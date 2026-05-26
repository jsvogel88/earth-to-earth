/**
 * Phase 1 Global Hyperloop Web — full infrastructure graph.
 * Corridor chains + crosslinks + E2E feeders + split-off branches + limited extended trunks.
 * Pods route independently; lines are shared tube infrastructure only.
 */

import { hyperloopContinentalCorridors } from './hyperloopContinentalCorridors.js';
import { hyperloopCrosslinks } from './hyperloopCrosslinks.js';
import { regionalFeederCitiesByHub } from './regionalFeederCities.js';
import {
  buildPhase1CityIndex,
  buildPhase1CoordinateRegistry,
  normalizeNodeId,
  normalizeCityKey,
  resolveCanonicalCityName,
} from './hyperloopPhase1Cities.js';
import {
  classifyHyperloopRoute,
  HYPERLOOP_ROUTE_CLASSES,
} from './hyperloopRouteClasses.js';
import { detectWaterCrossing } from '../utils/generateHyperloopGraph.js';
import { enrichEdgeConstruction, enrichAllEdgeConstruction } from '../utils/applyEdgeConstruction.js';
import { computeConstructionMetrics } from '../utils/constructionMetrics.js';
import { DEFAULT_CONSTRUCTION } from './constructionTypes.js';
import { generateIntercontinentalGatewayEdges } from './intercontinentalGateways.js';
import { getNetworkCityByNameCountry } from './worldCities.js';

const REGIONAL_RADIUS_MILES = 700;
const SPLIT_OFF_MAX_MILES = 500;
const E2E_FEEDER_MAX_LINKS = 14;
const EXTENDED_TRUNK_MIN = 700;
const EXTENDED_TRUNK_MAX = 1400;
const MAX_EXTENDED_LINKS_PER_HUB = 4;

export function hasCoordinates(node) {
  return (
    node &&
    typeof node.lat === 'number' &&
    typeof node.lon === 'number' &&
    Number.isFinite(node.lat) &&
    Number.isFinite(node.lon)
  );
}

export const haversineDistanceMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

export function edgeKey(a, b, type = '') {
  const ids = [a, b].sort();
  return `${ids[0]}__${ids[1]}__${type}`;
}

export function addEdgeUnique(edges, edgeMap, edge) {
  if (!edge) return;
  const key = edgeKey(edge.from, edge.to, edge.edgeType);
  if (edgeMap.has(key)) return;
  edgeMap.set(key, true);
  edges.push(edge);
}

export function makeEdge(fromNode, toNode, options = {}) {
  if (!hasCoordinates(fromNode) || !hasCoordinates(toNode)) return null;
  if (fromNode.id === toNode.id) return null;

  const distanceMiles = haversineDistanceMiles(
    fromNode.lat,
    fromNode.lon,
    toNode.lat,
    toNode.lon
  );

  const waterCheck = detectWaterCrossing(
    { lat: fromNode.lat, lon: fromNode.lon, continent: fromNode.continent },
    { lat: toNode.lat, lon: toNode.lon, continent: toNode.continent }
  );
  if (waterCheck.blocked && !options.specialCrossing && !options.tunnelRequired) {
    return null;
  }

  const tunnelRequired =
    options.tunnelRequired ||
    (waterCheck.blocked && options.specialCrossing);

  const routeClass =
    options.routeClass ||
    classifyHyperloopRoute(distanceMiles, {
      cargoPriority: options.cargoPriority,
      tunnelRequired,
    });

  const edge = {
    id: `${fromNode.id}-${toNode.id}-${options.edgeType || 'edge'}`,
    from: fromNode.id,
    to: toNode.id,
    fromNode,
    toNode,
    mode: 'HYPERLOOP',
    edgeType: options.edgeType || 'REGIONAL_FEEDER_LINE',
    routeClass,
    corridor: options.corridor || null,
    distanceMiles,
    supportsPodSplitOff: true,
    requiresStop: false,
    isThroughCorridor: options.isThroughCorridor !== false,
    isSplitOff: options.isSplitOff || false,
    splitOffFrom: options.splitOffFrom || null,
    tunnelRequired,
    tunnelType: options.tunnelType || null,
    constructionType: options.constructionType || DEFAULT_CONSTRUCTION.constructionType,
    waterCrossing: options.waterCrossing || waterCheck.blocked,
    specialCrossing: options.specialCrossing || false,
    constructionDifficulty:
      options.constructionDifficulty || DEFAULT_CONSTRUCTION.constructionDifficulty,
    constructionNotes: options.constructionNotes ?? null,
    passengerPriority: options.passengerPriority ?? null,
    cargoPriority: options.cargoPriority ?? null,
    routePriority: options.routePriority ?? null,
    renderable: true,
    edgeCategory: options.edgeCategory || 'CORRIDOR',
    generatedBy: options.generatedBy || null,
    connectionPurpose: options.connectionPurpose || null,
    infrastructureTier: options.infrastructureTier ?? null,
  };

  return enrichEdgeConstruction(edge);
}

function corridorToEdgeType(corridorType, distanceMiles) {
  if (corridorType === 'CONTINENTAL_TRUNK') return 'HYPERLOOP_TRUNK_LINE';
  if (corridorType === 'CROSS_BORDER_CORRIDOR') return 'EXTENDED_HYPERLOOP_LINE';
  if (distanceMiles <= 150) return 'LOCAL_CITY_WEB';
  if (distanceMiles <= 700) return 'REGIONAL_FEEDER_LINE';
  return 'EXTENDED_HYPERLOOP_LINE';
}

function toGraphNode(city, roiHubNames) {
  const name = resolveCanonicalCityName(city.name);
  const id = normalizeNodeId(name, city.country);
  const isE2E = city.isE2EHub || roiHubNames.has(normalizeCityKey(city.name));
  return {
    id,
    networkCityId: id,
    name,
    country: city.country || '',
    continent: city.continent,
    lat: city.lat,
    lon: city.lon,
    tier: city.tier ?? (isE2E ? 0 : city.isSwitchNode ? 2 : 3),
    isE2EHub: isE2E,
    isSwitchNode: Boolean(city.isSwitchNode),
    allowsSplitOff: city.allowsSplitOff !== false,
    connectedToTrunk: Boolean(city.connectedToTrunk || city.isSwitchNode || isE2E),
    parentE2EHub: city.parentE2EHub,
    nearestE2EHubs: city.nearestE2EHubs || [],
    primaryCorridor: city.primaryCorridor,
    alternateCorridors: city.alternateCorridors || city.corridors || [],
    corridors: city.corridors || [],
    renderable: hasCoordinates(city),
    nodeType: city.nodeType,
    population: city.population ?? null,
  };
}

function toDeckPath(edge) {
  return {
    id: edge.id,
    path: [
      [edge.fromNode.lon, edge.fromNode.lat],
      [edge.toNode.lon, edge.toNode.lat],
    ],
    edgeType: edge.edgeType,
    routeClass: edge.routeClass,
    distanceMiles: edge.distanceMiles,
    corridor: edge.corridor,
    tunnelRequired: edge.tunnelRequired,
    tunnelType: edge.tunnelType,
    constructionType: edge.constructionType,
    constructionDifficulty: edge.constructionDifficulty,
    constructionNotes: edge.constructionNotes,
    edgeCategory: edge.edgeCategory,
    isIntercontinentalGateway: edge.isIntercontinentalGateway,
    infrastructureOnly: true,
    supportsPodSplitOff: edge.supportsPodSplitOff,
    requiresStop: edge.requiresStop,
    isThroughCorridor: edge.isThroughCorridor,
    fromName: edge.fromNode.name,
    toName: edge.toNode.name,
    renderable: edge.renderable,
  };
}

function registerFeederCities(nodeByKey, coordRegistry, roiHubNames) {
  Object.values(regionalFeederCitiesByHub).forEach((hubCorridors) => {
    Object.values(hubCorridors).forEach((cities) => {
      if (!Array.isArray(cities)) return;
      cities.forEach((city) => {
        if (!hasCoordinates(city)) return;
        const key = normalizeCityKey(city.name);
        if (nodeByKey.has(key)) return;
        nodeByKey.set(
          key,
          toGraphNode(
            {
              name: city.name,
              country: city.country,
              lat: city.lat,
              lon: city.lon,
              continent: coordRegistry.get(key)?.continent,
              isSwitchNode: false,
              allowsSplitOff: true,
              renderable: true,
              corridors: [city.corridor || 'Regional Feeder'],
              primaryCorridor: city.corridor,
              nodeType: 'FEEDER_CITY',
            },
            roiHubNames
          )
        );
      });
    });
  });
}

function getNodeByName(nodeByKey, name, coordRegistry) {
  const key = normalizeCityKey(name);
  if (nodeByKey.has(key)) return nodeByKey.get(key);
  const coords = coordRegistry.get(key);
  if (!coords || !hasCoordinates(coords)) return null;
  const curated = getNetworkCityByNameCountry(coords.name || name, coords.country);
  const node = toGraphNode(
    curated || {
      name: coords.name || name,
      country: coords.country || '',
      continent: coords.continent,
      lat: coords.lat,
      lon: coords.lon,
      isSwitchNode: false,
      isE2EHub: false,
      allowsSplitOff: true,
      renderable: true,
    },
    new Set()
  );
  nodeByKey.set(key, node);
  return node;
}

function buildAdjacency(edges) {
  const adj = new Map();
  edges.forEach((e) => {
    if (!adj.has(e.from)) adj.set(e.from, new Set());
    if (!adj.has(e.to)) adj.set(e.to, new Set());
    adj.get(e.from).add(e.to);
    adj.get(e.to).add(e.from);
  });
  return adj;
}

function isConnected(adj, a, b) {
  if (a === b) return true;
  const visited = new Set([a]);
  const queue = [a];
  while (queue.length) {
    const cur = queue.shift();
    const neighbors = adj.get(cur);
    if (!neighbors) continue;
    for (const n of neighbors) {
      if (n === b) return true;
      if (!visited.has(n)) {
        visited.add(n);
        queue.push(n);
      }
    }
  }
  return false;
}

/**
 * Build Phase 1 global Hyperloop web graph.
 */
export function buildGlobalHyperloopGraph({
  hubs = [],
  feederCitiesByHub = {},
  enableFutureGateways = false,
  infrastructureMode = true,
} = {}) {
  void feederCitiesByHub;

  const roiHubNames = new Set(hubs.map((h) => normalizeCityKey(h.name)));
  const cityIndex = buildPhase1CityIndex(hubs);
  const coordRegistry = buildPhase1CoordinateRegistry(hubs);
  const nodeByKey = new Map();

  cityIndex.forEach((city) => {
    if (!hasCoordinates(city)) return;
    nodeByKey.set(normalizeCityKey(city.name), toGraphNode(city, roiHubNames));
  });

  registerFeederCities(nodeByKey, coordRegistry, roiHubNames);

  hubs.forEach((hub) => {
    const key = normalizeCityKey(hub.name);
    if (!hasCoordinates(hub)) return;
    const existing = nodeByKey.get(key);
    if (existing) {
      existing.isE2EHub = true;
      existing.tier = 0;
      return;
    }
    nodeByKey.set(
      key,
      toGraphNode(
        {
          name: hub.name,
          country: hub.country,
          lat: hub.lat,
          lon: hub.lon,
          isE2EHub: true,
          isSwitchNode: false,
          tier: 0,
          allowsSplitOff: true,
          parentE2EHub: hub.name,
          corridors: [],
        },
        roiHubNames
      )
    );
  });

  const nodes = [...nodeByKey.values()];
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = [];
  const edgeMap = new Map();

  // A — Corridor chain edges
  hyperloopContinentalCorridors.forEach((corridorDef) => {
    const { nodes: nodeSequence, corridor, corridorType } = corridorDef;
    const corridorSpecial = corridorDef.specialCrossing === true;
    const corridorTunnel =
      corridorDef.tunnelRequired ||
      corridorDef.specialCrossingType === 'UNDERSEA_TUNNEL';

    for (let i = 0; i < nodeSequence.length - 1; i += 1) {
      const fromNode = getNodeByName(nodeByKey, nodeSequence[i], coordRegistry);
      const toNode = getNodeByName(nodeByKey, nodeSequence[i + 1], coordRegistry);
      if (!fromNode || !toNode) continue;

      const dist = haversineDistanceMiles(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);
      addEdgeUnique(
        edges,
        edgeMap,
        makeEdge(fromNode, toNode, {
          edgeType: corridorToEdgeType(corridorType, dist),
          corridor,
          tunnelRequired: corridorTunnel,
          specialCrossing: corridorSpecial,
          edgeCategory: 'CORRIDOR_CHAIN',
          isThroughCorridor: true,
        })
      );
    }
  });

  // B — Curated crosslinks
  hyperloopCrosslinks.forEach((xl) => {
    const fromNode = getNodeByName(nodeByKey, xl.from, coordRegistry);
    const toNode = getNodeByName(nodeByKey, xl.to, coordRegistry);
    if (!fromNode || !toNode) return;

    const isChannel =
      (xl.from === 'London' && xl.to === 'Paris') ||
      (xl.from === 'Paris' && xl.to === 'London');

    addEdgeUnique(
      edges,
      edgeMap,
      makeEdge(fromNode, toNode, {
        edgeType: xl.edgeType || 'HYPERLOOP_TRUNK_LINE',
        corridor: xl.corridor,
        specialCrossing: isChannel,
        tunnelRequired: isChannel,
        edgeCategory: 'CROSSLINK',
      })
    );
  });

  let adj = buildAdjacency(edges);
  const e2eNodes = nodes.filter((n) => n.isE2EHub);

  // C — E2E hub radial feeders (disabled in infrastructure mode — use feeder trunk attachment)
  if (!infrastructureMode) {
  e2eNodes.forEach((hub) => {
    const candidates = nodes
      .filter((n) => n.id !== hub.id && n.continent === hub.continent)
      .map((n) => ({
        node: n,
        dist: haversineDistanceMiles(hub.lat, hub.lon, n.lat, n.lon),
        score:
          (n.isSwitchNode ? 3 : 0) +
          (n.tier === 1 ? 2 : 0) +
          (n.tier === 2 ? 1 : 0) +
          (n.isE2EHub ? -5 : 0),
      }))
      .filter((c) => c.dist > 0 && c.dist <= REGIONAL_RADIUS_MILES)
      .sort((a, b) => b.score - a.score || a.dist - b.dist);

    let added = 0;
    for (const { node: target, dist } of candidates) {
      if (added >= E2E_FEEDER_MAX_LINKS) break;
      if (isConnected(adj, hub.id, target.id)) continue;
      const edge = makeEdge(hub, target, {
        edgeType: dist <= 150 ? 'LOCAL_CITY_WEB' : 'REGIONAL_FEEDER_LINE',
        corridor: `E2E feeder: ${hub.name}`,
        edgeCategory: 'E2E_FEEDER',
      });
      if (edge) {
        addEdgeUnique(edges, edgeMap, edge);
        added += 1;
      }
    }
  });

  adj = buildAdjacency(edges);
  }

  // D — Split-off branches for poorly connected cities
  const trunkAnchors = nodes.filter(
    (n) => n.isE2EHub || n.isSwitchNode || n.tier <= 2
  );

  nodes.forEach((city) => {
    if (city.isE2EHub) return;
    const degree = adj.get(city.id)?.size || 0;
    if (degree > 0) return;

    let best = null;
    let bestDist = Infinity;
    trunkAnchors.forEach((anchor) => {
      if (anchor.id === city.id) return;
      if (anchor.continent !== city.continent) return;
      const d = haversineDistanceMiles(city.lat, city.lon, anchor.lat, anchor.lon);
      if (d < bestDist && d <= SPLIT_OFF_MAX_MILES) {
        bestDist = d;
        best = anchor;
      }
    });

    if (!best) return;
    addEdgeUnique(
      edges,
      edgeMap,
      makeEdge(city, best, {
        edgeType: 'SPLIT_OFF_BRANCH',
        corridor: `Split-off: ${city.name}`,
        isSplitOff: true,
        splitOffFrom: best.id,
        edgeCategory: 'SPLIT_OFF',
        isThroughCorridor: false,
      })
    );
  });

  adj = buildAdjacency(edges);

  // E — Limited extended trunk between major hubs (disabled in infrastructure mode)
  if (!infrastructureMode) {
  const majors = nodes.filter((n) => n.isE2EHub || n.isSwitchNode);
  majors.forEach((hub) => {
    let added = 0;
    const peers = majors
      .filter((p) => p.id !== hub.id && p.continent === hub.continent)
      .map((p) => ({
        node: p,
        dist: haversineDistanceMiles(hub.lat, hub.lon, p.lat, p.lon),
      }))
      .filter((p) => p.dist >= EXTENDED_TRUNK_MIN && p.dist <= EXTENDED_TRUNK_MAX)
      .sort((a, b) => a.dist - b.dist);

    for (const { node: peer, dist } of peers) {
      if (added >= MAX_EXTENDED_LINKS_PER_HUB) break;
      if (isConnected(adj, hub.id, peer.id)) continue;
      const edge = makeEdge(hub, peer, {
        edgeType: 'EXTENDED_HYPERLOOP_LINE',
        corridor: `Extended trunk: ${hub.continent}`,
        edgeCategory: 'EXTENDED_TRUNK',
      });
      if (edge) {
        addEdgeUnique(edges, edgeMap, edge);
        added += 1;
      }
    }
  });

  adj = buildAdjacency(edges);
  }

  // F — Through routes: generated in buildPlanetaryHyperloopGraph.js (not phase-1)

  // G — Intercontinental gateway corridors (sequential land-bridge / special crossing chains)
  const gatewayResult = generateIntercontinentalGatewayEdges(nodeByKey, coordRegistry, {
    enableFutureGateways,
    roiHubNames,
  });

  gatewayResult.edges.forEach((gatewayEdge) => {
    addEdgeUnique(edges, edgeMap, gatewayEdge);
  });

  // Register any new gateway nodes into graph node list
  const gatewayNodes = [...nodeByKey.values()].filter(
    (n) => !nodes.some((existing) => existing.id === n.id)
  );
  gatewayNodes.forEach((n) => nodes.push(n));

  nodes.forEach((n) => {
    const degree = edges.some((e) => e.from === n.id || e.to === n.id);
    n.connectedToTrunk = degree || n.isE2EHub || n.isSwitchNode;
  });

  enrichAllEdgeConstruction(edges);

  const renderableEdges = edges.filter((e) => e.renderable);
  const paths = renderableEdges.map(toDeckPath);
  const constructionMetrics = computeConstructionMetrics(renderableEdges);
  const switchNodes = nodes.filter((n) => n.isSwitchNode);
  const renderableNodes = nodes.filter((n) => n.renderable);

  const countByClass = (cls) =>
    renderableEdges.filter((e) => e.routeClass === cls).length;

  const countByCategory = (cat) =>
    renderableEdges.filter((e) => e.edgeCategory === cat).length;

  const metrics = {
    totalNodes: nodes.length,
    totalRenderableNodes: renderableNodes.length,
    totalEdges: edges.length,
    totalRenderableEdges: renderableEdges.length,
    crosslinks: countByCategory('CROSSLINK'),
    corridorChains: countByCategory('CORRIDOR_CHAIN'),
    e2eFeederEdges: countByCategory('E2E_FEEDER'),
    splitOffEdges: countByCategory('SPLIT_OFF'),
    extendedTrunkEdges: countByCategory('EXTENDED_TRUNK'),
    throughRoutes: 0,
    throughRouteMiles: 0,
    connectedFeederNetworks: 0,
    intercontinentalGatewayRoutes: gatewayResult.intercontinentalGatewayRoutes,
    intercontinentalGatewayMiles: gatewayResult.intercontinentalGatewayMiles,
    tunnelGatewaySegments: gatewayResult.tunnelGatewaySegments,
    disabledFutureGatewayRoutes: gatewayResult.disabledFutureGatewayRoutes,
    trunkLines: renderableEdges.filter((e) => e.edgeType === 'HYPERLOOP_TRUNK_LINE').length,
    branchLines: renderableEdges.filter((e) => e.edgeType === 'SPLIT_OFF_BRANCH').length,
    localFeederLines: countByClass(HYPERLOOP_ROUTE_CLASSES.LOCAL_FEEDER),
    regionalHyperloopLines: countByClass(HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP),
    extendedHyperloopLines: countByClass(HYPERLOOP_ROUTE_CLASSES.EXTENDED_HYPERLOOP),
    tunnelRequiredLines: countByClass(HYPERLOOP_ROUTE_CLASSES.TUNNEL_REQUIRED),
    estimatedTubeMiles: Math.round(
      renderableEdges.reduce((s, e) => s + e.distanceMiles, 0)
    ),
    ...constructionMetrics,
  };

  const webStats = {
    totalNodes: metrics.totalNodes,
    totalRenderableNodes: metrics.totalRenderableNodes,
    totalEdges: metrics.totalEdges,
    totalRenderableEdges: metrics.totalRenderableEdges,
    crosslinks: metrics.crosslinks,
    switchNodes: switchNodes.length,
    trunkLines: metrics.trunkLines,
    branchLines: metrics.branchLines,
    splitOffNodes: switchNodes.length,
    localFeederLines: metrics.localFeederLines,
    regionalHyperloopLines: metrics.regionalHyperloopLines,
    extendedHyperloopLines: metrics.extendedHyperloopLines,
    tunnelRequiredLines: metrics.tunnelRequiredLines,
    throughRoutes: metrics.throughRoutes,
    throughRouteMiles: metrics.throughRouteMiles,
    connectedFeederNetworks: metrics.connectedFeederNetworks,
    intercontinentalGatewayRoutes: metrics.intercontinentalGatewayRoutes,
    intercontinentalGatewayMiles: metrics.intercontinentalGatewayMiles,
    tunnelGatewaySegments: metrics.tunnelGatewaySegments,
    disabledFutureGatewayRoutes: metrics.disabledFutureGatewayRoutes,
    estimatedTubeMiles: metrics.estimatedTubeMiles,
    ...constructionMetrics,
    avgEdgeDistance: renderableEdges.length
      ? Math.round(metrics.estimatedTubeMiles / renderableEdges.length)
      : 0,
    connectedE2eHubs: e2eNodes.length,
    e2eHubs: e2eNodes.length,
    estimatedCoverage: `${metrics.totalRenderableNodes} renderable cities`,
  };

  const stats = {
    local: metrics.localFeederLines,
    regional: metrics.regionalHyperloopLines,
    extended: metrics.extendedHyperloopLines,
    cargo: renderableEdges.filter(
      (e) => e.routeClass === HYPERLOOP_ROUTE_CLASSES.CARGO_HYPERLOOP
    ).length,
    trunk: metrics.trunkLines,
    branch: metrics.branchLines + metrics.splitOffEdges,
    total: paths.length,
  };

  return {
    nodes,
    edges,
    metrics,
    paths,
    pathsByType: null,
    stats,
    switchNodes,
    webStats,
    nodeById,
  };
}
