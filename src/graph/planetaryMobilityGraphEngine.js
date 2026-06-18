/**
 * Planetary Mobility OS — unified graph / grid intelligence engine.
 *
 * Backend: nodes, edges, taxonomy, render intent, membership tiers.
 * Frontend: deck layers still choose arcs vs paths vs halos from render intent.
 */

import { getIntegratedGraph } from '../data/canonicalTransportAdapter.js';
import { listStarbaseHubs } from '../data/starbaseHubs.js';
import { deduplicateEdges, auditGraphIntegrity } from './graphIntegrity.js';
import { validateTransportGraph } from '../transportation/validators/graphValidation.js';
import adapter from '../data/canonicalTransportAdapter.js';
import { GRAPH_MEMBERSHIP } from './graphMembership.js';
import {
  normalizeGraphEdge,
  normalizeGraphNode,
  starbaseHubToOverlayNode,
  customDestinationToOverlayNode,
  parsedCityToOverlayNode,
} from './normalizeGraphMember.js';

function edgeDedupKey(edge) {
  const from = edge.fromNodeId ?? edge.origin_id;
  const to = edge.toNodeId ?? edge.destination_id;
  return `${from}|${to}|${edge.mode ?? ''}|${edge.routeType ?? edge.route_type ?? ''}`;
}

/**
 * Merge canonical backbone with optional legacy integrated graph (E2M/loop enrichment).
 * @param {{ nodes: object[], edges: object[] }} canonical
 * @param {{ nodes: object[], edges: object[] }} [legacy]
 */
export function mergeGraphBackbone(canonical, legacy) {
  if (!legacy?.nodes?.length && !legacy?.edges?.length) {
    return {
      nodes: (canonical.nodes ?? []).map((n) => normalizeGraphNode(n)),
      edges: (canonical.edges ?? []).map((e) => normalizeGraphEdge(e)),
    };
  }

  const nodeById = new Map();
  for (const n of legacy.nodes ?? []) {
    const norm = normalizeGraphNode(n);
    if (norm?.id) nodeById.set(norm.id, norm);
  }
  for (const n of canonical.nodes ?? []) {
    const norm = normalizeGraphNode(n);
    if (norm?.id && !nodeById.has(norm.id)) nodeById.set(norm.id, norm);
  }

  const edgeMap = new Map();
  for (const e of canonical.edges ?? []) {
    const mode = e.mode;
    if (mode === 'hyperloop' || mode === 'e2e' || mode === 'e2e_starship') {
      const norm = normalizeGraphEdge(e);
      if (norm) edgeMap.set(edgeDedupKey(norm), norm);
    }
  }
  for (const e of legacy.edges ?? []) {
    const mode = e.mode;
    if (mode === 'e2m' || mode === 're2e' || mode === 'loop' || mode === 'auto') {
      const norm = normalizeGraphEdge(e);
      if (norm) edgeMap.set(edgeDedupKey(norm), norm);
    }
  }
  for (const e of legacy.edges ?? []) {
    const norm = normalizeGraphEdge(e);
    if (norm && !edgeMap.has(edgeDedupKey(norm))) edgeMap.set(edgeDedupKey(norm), norm);
  }
  for (const e of canonical.edges ?? []) {
    const norm = normalizeGraphEdge(e);
    if (norm && !edgeMap.has(edgeDedupKey(norm))) edgeMap.set(edgeDedupKey(norm), norm);
  }

  return {
    nodes: [...nodeById.values()],
    edges: [...edgeMap.values()],
  };
}

/**
 * @param {{
 *   legacyGraph?: { nodes: object[], edges: object[] } | null,
 *   customDestinations?: object[],
 *   parsedCities?: object[],
 *   includeStarbaseOverlays?: boolean,
 *   modeFilter?: string | null,
 * }} [options]
 */
export function buildPlanetaryMobilityGraph(options = {}) {
  const {
    legacyGraph = null,
    customDestinations = [],
    parsedCities = [],
    includeStarbaseOverlays = true,
    modeFilter = null,
  } = options;

  const canonicalNodes = getIntegratedGraph(modeFilter).nodes;
  const canonicalEdges = (adapter.getAllEdges?.() ?? []).map((e) => normalizeGraphEdge(e));
  const backbone = mergeGraphBackbone(
    { nodes: canonicalNodes, edges: canonicalEdges },
    legacyGraph
  );
  const { edges: dedupedEdges, duplicateCountRemoved } = deduplicateEdges(backbone.edges);

  const overlays = [];
  if (includeStarbaseOverlays) {
    for (const hub of listStarbaseHubs()) {
      const node = starbaseHubToOverlayNode(hub);
      if (node?.hasCoordinates) overlays.push(node);
    }
  }
  for (const dest of customDestinations ?? []) {
    const node = customDestinationToOverlayNode(dest);
    if (node?.hasCoordinates) overlays.push(node);
  }
  for (const parsed of parsedCities ?? []) {
    const node = parsedCityToOverlayNode(parsed);
    if (node?.hasCoordinates) overlays.push(node);
  }

  const nodeById = Object.fromEntries([
    ...backbone.nodes.map((n) => [n.id, n]),
    ...overlays.map((n) => [n.id, n]),
  ]);

  const integrity = auditGraphIntegrity(backbone.nodes, dedupedEdges);
  const datasetValidation = adapter.getValidationReport?.() ?? { valid: true, errors: [], warnings: [] };
  const allNodesForValidation = [...backbone.nodes, ...overlays];
  const graphValidation = validateTransportGraph(allNodesForValidation, dedupedEdges, {
    includeOverlays: true,
  });

  const taxonomyErrorCount =
    backbone.nodes.filter((n) => n.taxonomyErrors?.length).length +
    dedupedEdges.filter((e) => e.taxonomyErrors?.length).length;

  const geometryViolations = countGeometryIntentViolations(dedupedEdges);

  return {
    nodes: backbone.nodes,
    edges: dedupedEdges,
    layers: adapter.layers ?? [],
    backbone: { nodes: backbone.nodes, edges: dedupedEdges },
    overlays,
    nodeById,
    routes: adapter.routes ?? [],
    warnings: [
      ...(integrity.warnings ?? []),
      ...graphValidation.warnings.map((w) => w.type ?? String(w)),
      ...(datasetValidation.warnings?.length ? ['canonical dataset has validation warnings'] : []),
    ],
    diagnostics: {
      totalNodes: backbone.nodes.length,
      totalEdges: dedupedEdges.length,
      overlayNodeCount: overlays.length,
      duplicateEdgesRemoved: duplicateCountRemoved,
      orphanNodeCount: integrity.orphanNodeCount ?? 0,
      taxonomyErrorCount,
      geometryViolations,
      dataSource: legacyGraph ? 'canonical-v1.4.0+legacy' : 'canonical-v1.4.0',
      canonicalValidation: datasetValidation,
      graphValidation,
    },
  };
}

/**
 * Normalized official edges for route display pipeline (canonical + optional legacy).
 * @param {{ legacyGraph?: object | null }} [options]
 */
export function getDisplayGraphEdges(options = {}) {
  return buildPlanetaryMobilityGraph(options).backbone.edges;
}

/**
 * Registry-driven geometry intent audit (E2E ground, E2M long ground, hyperloop arcs).
 * @param {object[]} edges
 */
export function countGeometryIntentViolations(edges) {
  let e2eGround = 0;
  let e2mLongGround = 0;
  let hyperloopArc = 0;

  for (const e of edges) {
    const mode = e.taxonomyMode ?? e.mode;
    const geom = e.geometryType;
    if (
      (mode === 'e2e_starship' || e.mode === 'e2e') &&
      geom === 'ground'
    ) {
      e2eGround += 1;
    }
    if (
      (mode === 'e2m' ||
        mode === 're2e' ||
        mode === 'cargo' ||
        mode === 'logistics') &&
      geom === 'ground' &&
      (e.distanceKm ?? 0) > 100
    ) {
      e2mLongGround += 1;
    }
    if (
      (mode === 'hyperloop_spine' || e.mode === 'hyperloop') &&
      geom === 'arc'
    ) {
      hyperloopArc += 1;
    }
  }

  return { e2eGround, e2mLongGround, hyperloopArc };
}

/**
 * Membership-safe lookup: official nodes only (excludes overlays).
 */
export function getOfficialNodes(graph) {
  return (graph?.backbone?.nodes ?? []).filter(
    (n) => n.graphMembership === GRAPH_MEMBERSHIP.OFFICIAL
  );
}
