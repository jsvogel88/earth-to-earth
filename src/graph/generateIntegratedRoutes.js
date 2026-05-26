/**
 * Integrated route orchestrator — combines hyperloop, E2E, E2M, and Loop routes.
 */

import { classifyCity, classifyMineralHub } from '../modes/classifyLocation.js';
import { enrichMineralHubs } from '../data/buildMineralHubConnections.js';
import {
  createIntegratedEdge,
  EDGE_MODES,
  EDGE_TYPES,
  CORRIDOR_TYPES,
  NODE_TYPES,
  normalizeNodeId,
} from './integratedGraphTypes.js';
import { hasCoordinates } from './geoDistance.js';
import { generateE2ERoutes } from './generateE2ERoutes.js';
import { generateE2MRoutes } from './generateE2MRoutes.js';
import { generateLoopRegionalRoutes } from './generateLoopRegionalRoutes.js';
import { deduplicateEdges, auditGraphIntegrity } from './graphIntegrity.js';

/**
 * @param {object} city
 * @returns {object}
 */
function prepareCityNode(city) {
  const classified = classifyCity(city);
  const id = normalizeNodeId(classified);
  return {
    ...classified,
    id,
    networkCityId: classified.networkCityId ?? classified.city_id ?? id,
    lat: classified.lat ?? classified.latitude ?? null,
    lon: classified.lon ?? classified.longitude ?? null,
  };
}

/**
 * @param {object} hub
 * @returns {object}
 */
function prepareMineralHubNode(hub) {
  const classified = classifyMineralHub(hub);
  return {
    ...classified,
    id: classified.mineral_hub_id ?? normalizeNodeId(classified),
    nodeType: NODE_TYPES.E2M_HUB,
    lat: classified.latitude ?? classified.lat ?? null,
    lon: classified.longitude ?? classified.lon ?? null,
  };
}

/**
 * @param {object} edge
 * @returns {object | null}
 */
function normalizeExistingHyperloopEdge(edge) {
  if (!edge) return null;

  const origin = edge.origin_id ?? edge.from;
  const destination = edge.destination_id ?? edge.to;
  if (!origin || !destination) return null;

  let route_type = EDGE_TYPES.REGIONAL;
  const category = String(edge.edgeCategory ?? edge.routeClass ?? '').toUpperCase();
  if (category.includes('TRUNK') || category.includes('SPINE')) {
    route_type = EDGE_TYPES.TRUNK;
  } else if (category.includes('FEEDER')) {
    route_type = EDGE_TYPES.FEEDER;
  } else if (category.includes('THROUGH')) {
    route_type = EDGE_TYPES.REGIONAL;
  }

  const distance_km =
    edge.distance_km ??
    (edge.distanceMiles != null ? Math.round(edge.distanceMiles * 1.60934) : null);

  return createIntegratedEdge({
    origin,
    destination,
    mode: EDGE_MODES.HYPERLOOP,
    route_type,
    corridor_type: CORRIDOR_TYPES.MIXED,
    priority_score: edge.routePriority ?? edge.priority_score ?? null,
    distance_km,
    visibility_by_zoom: edge.visibility_by_zoom ?? { min: 0, max: 22 },
    metadata: {
      sourceEdgeId: edge.id,
      edgeCategory: edge.edgeCategory,
      routeClass: edge.routeClass,
      generatedBy: edge.generatedBy ?? 'existingHyperloop',
    },
  });
}

/**
 * @param {object[]} edges
 * @returns {number}
 */
function countEdgesByMode(edges, mode) {
  return (edges ?? []).filter((e) => e.mode === mode).length;
}

/**
 * @param {object} params
 * @returns {{ nodes: object[], edges: object[], diagnostics: object }}
 */
export function generateIntegratedRoutes({
  cities = [],
  mineralHubs = [],
  existingHyperloopGraph = null,
  existingEdges = null,
  options = {},
} = {}) {
  const warnings = [];

  if (!cities?.length && !mineralHubs?.length && !existingHyperloopGraph && !existingEdges?.length) {
    return {
      nodes: [],
      edges: [],
      diagnostics: {
        totalNodes: 0,
        totalEdges: 0,
        cityCount: 0,
        e2eHubCount: 0,
        mineralHubCount: 0,
        e2eRouteCount: 0,
        e2mRouteCount: 0,
        loopRouteCount: 0,
        hyperloopRouteCount: 0,
        orphanNodeCount: 0,
        orphanMineralHubCount: 0,
        duplicateEdgeCountRemoved: 0,
        warnings: ['No input cities, mineral hubs, or existing graph provided'],
      },
    };
  }

  const cityNodes = (cities ?? []).map(prepareCityNode);
  const e2eHubs = cityNodes.filter((c) => c.isE2EHub || c.e2e_eligible);

  const enrichedMineralHubs = enrichMineralHubs(mineralHubs ?? [], {
    cities: cityNodes,
    e2eHubs,
  });
  const mineralNodes = enrichedMineralHubs.map(prepareMineralHubNode);

  const hyperloopNodesFromGraph = existingHyperloopGraph?.nodes ?? [];
  const hyperloopNodeIds = new Set(
    hyperloopNodesFromGraph.map((n) => normalizeNodeId(n)).filter(Boolean)
  );

  const cityNodeIds = new Set(cityNodes.map((n) => n.id).filter(Boolean));
  const nodes = [...cityNodes];

  for (const hub of mineralNodes) {
    if (hub.id && !cityNodeIds.has(hub.id)) nodes.push(hub);
  }

  for (const hlNode of hyperloopNodesFromGraph) {
    const id = normalizeNodeId(hlNode);
    if (id && !cityNodeIds.has(id) && !nodes.some((n) => n.id === id)) {
      nodes.push({
        ...hlNode,
        id,
        nodeType: hlNode.nodeType ?? NODE_TYPES.HYPERLOOP_HUB,
      });
    }
  }

  const rawHyperloopEdges =
    existingEdges ??
    existingHyperloopGraph?.edges ??
    existingHyperloopGraph?.paths ??
    [];

  const hyperloopEdges = rawHyperloopEdges
    .map(normalizeExistingHyperloopEdge)
    .filter(Boolean);

  const e2eRoutes = generateE2ERoutes(e2eHubs, options.e2eOptions ?? {});
  const e2mRoutes = generateE2MRoutes(mineralNodes, {
    cities: cityNodes,
    e2eHubs,
    allNodes: nodes,
  });
  const loopRoutes = generateLoopRegionalRoutes(cityNodes, {
    e2eHubs,
    hyperloopNodes: hyperloopNodesFromGraph.length
      ? hyperloopNodesFromGraph
      : cityNodes.filter((c) => c.hyperloop_connected || hyperloopNodeIds.has(c.id)),
  }, options.loopOptions ?? {});

  const combinedEdges = [...hyperloopEdges, ...e2eRoutes, ...e2mRoutes, ...loopRoutes];
  const { edges, duplicateCountRemoved } = deduplicateEdges(combinedEdges);

  const integrity = auditGraphIntegrity(nodes, edges);

  if (integrity.orphanMineralHubCount > 0) {
    warnings.push(
      `${integrity.orphanMineralHubCount} mineral hub(s) remain without edges — check city context`
    );
  }

  const diagnostics = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    cityCount: cityNodes.length,
    e2eHubCount: e2eHubs.length,
    mineralHubCount: mineralNodes.length,
    e2eRouteCount: countEdgesByMode(edges, EDGE_MODES.E2E),
    e2mRouteCount: countEdgesByMode(edges, EDGE_MODES.E2M),
    loopRouteCount: countEdgesByMode(edges, EDGE_MODES.LOOP),
    hyperloopRouteCount: countEdgesByMode(edges, EDGE_MODES.HYPERLOOP),
    orphanNodeCount: integrity.orphanNodeCount,
    orphanMineralHubCount: integrity.orphanMineralHubCount,
    duplicateEdgeCountRemoved: duplicateCountRemoved,
    warnings,
  };

  return { nodes, edges, diagnostics };
}
