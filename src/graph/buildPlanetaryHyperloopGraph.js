/**
 * Planetary Hyperloop Web — sole public route/edge builder for the network map.
 * Orchestrates phase-1 corridors, planning connectors, repair links, and audit.
 */

import {
  buildGlobalHyperloopGraph,
  hasCoordinates,
  haversineDistanceMiles,
  addEdgeUnique,
  makeEdge,
  edgeKey,
} from '../data/phase1GlobalHyperloopGraph.js';
import { buildFutureHighPopulationCities } from '../data/futureHighPopulationCities.js';
import { buildRareEarthHubCandidates } from '../data/rareEarthHubCandidates.js';
import { buildRemoteCargoResourceNodes } from '../data/remoteCargoResourceNodes.js';
import { buildRemoteCargoCorridorEdges } from '../data/remoteCargoRoutes.js';
import { buildRemoteStrategicNodes } from '../data/remoteStrategicNodes.js';
import { generateExtendedRuralEdges, getMaxBranchMiles } from '../data/extendedRuralNetwork.js';
import { findNearestEligibleConnector } from '../data/planningLayers.js';
import { auditGraphConnectivity, CONNECTION_STATUS } from './graphConnectivityAudit.js';
import { normalizeNodeId, normalizeCityKey } from '../data/hyperloopPhase1Cities.js';
import { generateThroughRoutes } from './generateThroughRoutes.js';
import { applyContinentalSpines } from './applyContinentalSpines.js';
import { applyPlanetaryMergeGateways } from './applyPlanetaryMergeGateways.js';
import { applyInfrastructureTrunks } from './applyInfrastructureTrunks.js';
import { pruneMeshSpaghetti } from './pruneMeshSpaghetti.js';
import { applyFeederTrunkAttachment } from './applyFeederTrunkAttachment.js';
import { generateCorridorThroughRoutes } from './generateCorridorThroughRoutes.js';
import { classifyInfrastructureRole } from '../data/classifyWorldCityInfrastructure.js';
import { freezePlanetaryGraph } from './freezeGraph.js';
import { HYPERLOOP_ROUTE_CLASSES } from '../data/hyperloopRouteClasses.js';
import { enrichAllEdgeConstruction } from '../utils/applyEdgeConstruction.js';
import { computeConstructionMetrics } from '../utils/constructionMetrics.js';
import { getMapRoiHubs } from '../data/worldCities.js';
import { applyClassificationToNode } from '../data/nodeClassification.js';
import {
  deduplicateNodesByNetworkCityId,
  normalizeEdgeEndpoints,
  resolveCanonicalNodeId,
} from './canonicalNodeResolution.js';

const FUTURE_HUB_CONNECT_MAX_MILES = 700;
const REPAIR_MAX_MILES = {
  DEFAULT: 700,
  REMOTE_CARGO: 900,
  ARCTIC: 1200,
};
const MAX_REPAIR_PASSES = 16;

export function normalizePlanetaryNode(raw, defaults = {}) {
  const hasCoords = hasCoordinates(raw);
  const canonicalId = raw.networkCityId?.startsWith('net:')
    ? raw.networkCityId
    : raw.id?.startsWith('net:')
      ? raw.id
      : resolveCanonicalNodeId(raw.name, raw.country, raw.id);
  return {
    id: canonicalId,
    name: raw.name,
    country: raw.country || '',
    continent: raw.continent || '',
    lat: hasCoords ? raw.lat : null,
    lon: hasCoords ? raw.lon : null,
    population: raw.population ?? null,
    nodeType: raw.nodeType || 'HYPERLOOP_CITY',
    phase: raw.phase ?? 1,
    isActiveE2EHub: Boolean(raw.isActiveE2EHub),
    potentialFutureE2EHub: Boolean(raw.potentialFutureE2EHub),
    potentialRareEarthHub: Boolean(raw.potentialRareEarthHub),
    potentialRuralE2EHub: Boolean(raw.potentialRuralE2EHub),
    nearestE2EHub: raw.nearestE2EHub ?? raw.parentE2EHub ?? null,
    nearestHyperloopTrunk: raw.nearestHyperloopTrunk ?? raw.nearestHyperloopNode ?? null,
    nearestSwitchNode: raw.nearestSwitchNode ?? null,
    nearestPort: raw.nearestPort ?? null,
    connectionStatus: raw.connectionStatus ?? null,
    connectionPathToNetwork: raw.connectionPathToNetwork ?? null,
    connectionReason: raw.connectionReason ?? null,
    isSwitchNode: Boolean(raw.isSwitchNode),
    allowsSplitOff: raw.allowsSplitOff !== false,
    cargoPriority: Boolean(raw.cargoPriority),
    passengerPriority: raw.passengerPriority ?? !raw.cargoPriority,
    visibleMinZoom: raw.visibleMinZoom ?? 5,
    source: raw.source || 'planetary',
    requiresValidation: Boolean(raw.requiresValidation),
    renderable: raw.renderable !== false && hasCoords,
    needsCoordinates: raw.needsCoordinates ?? !hasCoords,
    futureOnly: Boolean(raw.futureOnly || raw.planningOverlay),
    disabled: Boolean(raw.disabled),
    tier: raw.tier,
    isE2EHub: Boolean(raw.isE2EHub),
    connectedToTrunk: Boolean(raw.connectedToTrunk),
    networkCityId: canonicalId,
    ...defaults,
  };
}

function mergeNodes(existingById, incoming) {
  (incoming || []).forEach((raw) => {
    const node = normalizePlanetaryNode(raw);
    if (!node.id) return;
    if (existingById.has(node.id)) {
      const prev = existingById.get(node.id);
      if (prev.isActiveE2EHub && !node.isActiveE2EHub) return;
      existingById.set(node.id, {
        ...prev,
        ...node,
        isActiveE2EHub: prev.isActiveE2EHub || node.isActiveE2EHub,
        renderable: prev.renderable || node.renderable,
      });
      return;
    }
    existingById.set(node.id, node);
  });
}

function getAnchorNodes(nodes) {
  return nodes.filter(
    (n) =>
      hasCoordinates(n) &&
      (n.isSwitchNode ||
        n.connectedToTrunk ||
        n.isE2EHub ||
        n.tier <= 2 ||
        n.isActiveE2EHub)
  );
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
    infrastructureTier: edge.infrastructureTier,
    generatedBy: edge.generatedBy,
    isIntercontinentalGateway: edge.isIntercontinentalGateway,
    infrastructureOnly: true,
    supportsPodSplitOff: edge.supportsPodSplitOff,
    requiresStop: edge.requiresStop,
    isThroughCorridor: edge.isThroughCorridor,
    fromName: edge.fromNode?.name,
    toName: edge.toNode?.name,
    renderable: edge.renderable !== false,
  };
}

function addPlanningEdges(edges, edgeMap, ruralNodes, anchorNodes) {
  const renderableRemote = ruralNodes.filter((n) => n.renderable && hasCoordinates(n));
  const ruralEdges = generateExtendedRuralEdges(renderableRemote, anchorNodes);
  ruralEdges.forEach((e) => {
    e.edgeCategory = e.edgeCategory || 'EXTENDED_RURAL';
    e.generatedBy = e.generatedBy || 'extended_rural';
    addEdgeUnique(edges, edgeMap, e);
  });
  return ruralEdges.length;
}

function addFutureHubConnectors(edges, edgeMap, futureNodes, anchorNodes) {
  let added = 0;
  futureNodes
    .filter((n) => n.renderable && hasCoordinates(n) && !n.isActiveE2EHub)
    .forEach((hub) => {
      const match = findNearestEligibleConnector(hub, anchorNodes);
      if (!match || match.distanceMiles > FUTURE_HUB_CONNECT_MAX_MILES) return;

      const edge = makeEdge(hub, match.anchor, {
        edgeType: 'REGIONAL_FEEDER_LINE',
        routeClass: HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP,
        corridor: `Future hub connector: ${hub.name}`,
        edgeCategory: 'PLANNING_FUTURE_HUB',
        generatedBy: 'future_hub_connector',
        passengerPriority: true,
      });
      if (edge) {
        hub.nearestHyperloopTrunk = match.anchor.name;
        hub.nearestSwitchNode = match.anchor.isSwitchNode ? match.anchor.name : hub.nearestSwitchNode;
        addEdgeUnique(edges, edgeMap, edge);
        added += 1;
      }
    });
  return added;
}

function getRepairMaxMiles(node) {
  if (node.nodeType === 'ISLAND_ACCESS_NODE') return 0;
  const group = `${node.regionGroup || ''} ${node.subRegion || ''}`.toLowerCase();
  if (
    node.nodeType === 'ARCTIC_LOGISTICS_NODE' ||
    group.includes('arctic') ||
    group.includes('greenland') ||
    group.includes('siberia')
  ) {
    return REPAIR_MAX_MILES.ARCTIC;
  }
  if (
    node.cargoPriority ||
    node.potentialRareEarthHub ||
    node.globalCoverage ||
    node.nodeType === 'REMOTE_CARGO_NODE' ||
    node.nodeType === 'RARE_EARTH_HUB_CANDIDATE'
  ) {
    return REPAIR_MAX_MILES.REMOTE_CARGO;
  }
  if (node.cargoPriority) {
    return Math.min(getMaxBranchMiles(node), REPAIR_MAX_MILES.REMOTE_CARGO);
  }
  return REPAIR_MAX_MILES.DEFAULT;
}

function isIslandNodeWithoutSpecialCrossing(node) {
  return (
    node.nodeType === 'ISLAND_ACCESS_NODE' &&
    !node.specialCrossing &&
    !node.requiresSpecialCorridor
  );
}

function scoreRepairAnchorTarget(anchor, node, edges) {
  const incident = (edges || []).filter(
    (e) => e.from === anchor.id || e.to === anchor.id
  );
  let score = 0;
  if (anchor.connectedToTrunk) score += 85;
  if (anchor.isSwitchNode) score += 75;
  if (incident.some((e) => e.edgeType === 'HYPERLOOP_TRUNK_LINE')) score += 90;
  if (
    incident.some(
      (e) =>
        e.edgeCategory === 'THROUGH_ROUTE' ||
        e.routeClass === 'THROUGH_ROUTE' ||
        e.edgeType === 'THROUGH_ROUTE'
    )
  ) {
    score += 95;
  }
  if (incident.some((e) => e.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR')) score += 65;
  if (anchor.isE2EHub || anchor.isActiveE2EHub) score += 55;
  if (anchor.tier != null && anchor.tier <= 2) score += 45;
  const dist = haversineDistanceMiles(node.lat, node.lon, anchor.lat, anchor.lon);
  return score - dist * 0.03;
}

function findBestRepairTarget(node, largestComponentNodes, edges, maxMiles) {
  let best = null;
  let bestScore = -Infinity;
  let bestDist = Infinity;

  largestComponentNodes.forEach((target) => {
    const dist = haversineDistanceMiles(node.lat, node.lon, target.lat, target.lon);
    if (dist > maxMiles) return;

    let score = scoreRepairAnchorTarget(target, node, edges) - dist * 0.03;
    if (node.continent && target.continent && node.continent === target.continent) {
      score += 12;
    }

    if (score > bestScore || (score === bestScore && dist < bestDist)) {
      bestScore = score;
      bestDist = dist;
      best = target;
    }
  });

  return best ? { anchor: best, distanceMiles: bestDist } : null;
}

function findComponents(nodeIds, edges) {
  const adj = new Map();
  nodeIds.forEach((id) => adj.set(id, new Set()));
  edges.forEach((e) => {
    if (!adj.has(e.from)) adj.set(e.from, new Set());
    if (!adj.has(e.to)) adj.set(e.to, new Set());
    adj.get(e.from)?.add(e.to);
    adj.get(e.to)?.add(e.from);
  });

  const visited = new Set();
  const components = [];

  nodeIds.forEach((start) => {
    if (visited.has(start)) return;
    const comp = [];
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const cur = queue.shift();
      comp.push(cur);
      (adj.get(cur) || []).forEach((n) => {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      });
    }
    components.push(comp);
  });

  return components.sort((a, b) => b.length - a.length);
}

function generateConnectivityRepairPass(nodes, edges, edgeMap) {
  const renderable = nodes.filter((n) => n.renderable && hasCoordinates(n) && !n.disabled);
  const renderableIds = renderable.map((n) => n.id);
  const components = findComponents(renderableIds, edges);
  const largestSet = new Set(components[0] || []);
  if (!largestSet.size) return [];

  const largestComponentNodes = renderable.filter((n) => largestSet.has(n.id));
  const repairEdges = [];

  renderable
    .filter((n) => !largestSet.has(n.id))
    .forEach((node) => {
      if (isIslandNodeWithoutSpecialCrossing(node)) {
        node.connectionStatus = CONNECTION_STATUS.SPECIAL_CORRIDOR_REQUIRED;
        node.connectionReason = 'Island access — requires future special corridor';
        return;
      }

      const maxMiles = getRepairMaxMiles(node);
      if (maxMiles <= 0) return;

      const match = findBestRepairTarget(node, largestComponentNodes, edges, maxMiles);
      if (!match || match.distanceMiles > maxMiles) {
        node.connectionStatus = CONNECTION_STATUS.DISCONNECTED_REVIEW_NEEDED;
        node.connectionReason =
          maxMiles <= 0
            ? 'Island node — no automatic repair'
            : 'No eligible connector within distance guardrail';
        return;
      }

      const key = edgeKey(node.id, match.anchor.id, 'CONNECTIVITY_REPAIR_LINK');
      if (edgeMap.has(key)) return;

      const edge = makeEdge(node, match.anchor, {
        edgeType: 'CONNECTIVITY_REPAIR_LINK',
        routeClass: HYPERLOOP_ROUTE_CLASSES.CONNECTIVITY_REPAIR,
        corridor: `Connectivity repair: ${node.name} → ${match.anchor.name}`,
        edgeCategory: 'CONNECTIVITY_REPAIR',
        generatedBy: 'connectivity_repair',
        connectionPurpose: 'connect_disconnected_node_to_global_hyperloop_web',
        isThroughCorridor: false,
        supportsPodSplitOff: true,
        requiresStop: false,
        cargoPriority: node.cargoPriority,
        passengerPriority: !node.cargoPriority,
        renderable: true,
      });

      if (edge) {
        repairEdges.push(edge);
        node.nearestHyperloopTrunk = match.anchor.name;
        node.nearestSwitchNode = match.anchor.isSwitchNode
          ? match.anchor.name
          : node.nearestSwitchNode;
        node.connectionReason = `Repair link to ${match.anchor.name} (${Math.round(match.distanceMiles)} mi)`;
        node.connectionStatus = CONNECTION_STATUS.CONNECTED_VIA_BRANCH;
      }
    });

  return repairEdges;
}

export function generateConnectivityRepairLinks(nodes, edges, edgeMap) {
  const allRepairs = [];
  for (let pass = 0; pass < MAX_REPAIR_PASSES; pass += 1) {
    const batch = generateConnectivityRepairPass(nodes, edges, edgeMap);
    if (!batch.length) break;
    batch.forEach((e) => addEdgeUnique(edges, edgeMap, e));
    allRepairs.push(...batch);
  }
  return allRepairs;
}

export function buildPlanetaryHyperloopGraph({
  activeE2EHubs = [],
  regionalFeederCitiesByHub = {},
  futureHighPopulationCities = null,
  rareEarthHubCandidates = null,
  extendedRuralNodes = null,
  enableFutureGateways = false,
  includePlanningConnectors = true,
  runConnectivityRepair = true,
} = {}) {
  const hubs = activeE2EHubs.length ? activeE2EHubs : getMapRoiHubs();

  const base = buildGlobalHyperloopGraph({
    hubs,
    feederCitiesByHub: regionalFeederCitiesByHub,
    enableFutureGateways,
    infrastructureMode: true,
  });

  const edgeCountBeforePrune = base.edges.length;

  const nodeById = new Map(base.nodes.map((n) => [n.id, { ...n }]));
  const edges = [...base.edges];
  const edgeMap = new Map();
  edges.forEach((e) => edgeMap.set(edgeKey(e.from, e.to, e.edgeType), true));

  const spineResult = applyContinentalSpines({
    hubs,
    nodes: [...nodeById.values()],
    edges,
    edgeMap,
  });
  spineResult.newNodes.forEach((n) => mergeNodes(nodeById, [n]));

  const mergeGatewayResult = applyPlanetaryMergeGateways({
    hubs,
    nodes: [...nodeById.values()],
    edges,
    edgeMap,
  });
  mergeGatewayResult.newNodes.forEach((n) => mergeNodes(nodeById, [n]));

  const trunkResult = applyInfrastructureTrunks({
    hubs,
    nodes: [...nodeById.values()],
    edges,
    edgeMap,
  });
  trunkResult.newNodes.forEach((n) => mergeNodes(nodeById, [n]));

  const pruneResult = pruneMeshSpaghetti(edges);
  edges.length = 0;
  edges.push(...pruneResult.edges);
  edgeMap.clear();
  edges.forEach((e) => edgeMap.set(edgeKey(e.from, e.to, e.edgeType), true));

  const feederAttachResult = applyFeederTrunkAttachment({
    nodes: [...nodeById.values()],
    edges,
    edgeMap,
  });

  const corridorThroughResult = generateCorridorThroughRoutes({
    hubs,
    nodes: [...nodeById.values()],
    edges,
    edgeMap,
  });

  const futureCities =
    futureHighPopulationCities || buildFutureHighPopulationCities();
  const rareEarth = rareEarthHubCandidates || buildRareEarthHubCandidates();
  const ruralNodes =
    extendedRuralNodes ||
    buildRemoteCargoResourceNodes().map((n) => ({
      ...n,
      futureOnly: false,
    }));

  mergeNodes(nodeById, futureCities.map((n) => ({ ...n, phase: 2, futureOnly: true })));
  mergeNodes(
    nodeById,
    rareEarth.map((n) => ({
      ...n,
      phase: 3,
      futureOnly: true,
      cargoPriority: true,
      _sourceRemoteNode: n._sourceRemoteNode,
    }))
  );
  mergeNodes(nodeById, ruralNodes.map((n) => ({ ...n, phase: 3 })));

  const nodes = [...nodeById.values()];

  const hubsForThrough = hubs.map((h) => {
    const match = nodes.find((n) => normalizeCityKey(n.name) === normalizeCityKey(h.name));
    return { ...h, continent: h.continent || match?.continent || 'Unknown' };
  });
  const directEdgePairs = new Set(
    edges.map((e) => [e.from, e.to].sort().join('|'))
  );
  const throughResult = generateThroughRoutes(
    hubsForThrough,
    nodes,
    regionalFeederCitiesByHub,
    {
      maxPerHub: 0,
      hasDirectEdge: (a, b) => directEdgePairs.has([a, b].sort().join('|')),
    }
  );
  throughResult.edges.forEach((e) => addEdgeUnique(edges, edgeMap, e));

  const anchorNodes = getAnchorNodes(nodes);

  let planningRuralEdges = 0;
  let futureHubEdges = 0;
  let globalCorridorEdges = 0;

  if (includePlanningConnectors) {
    planningRuralEdges = addPlanningEdges(edges, edgeMap, ruralNodes, anchorNodes);
    futureHubEdges = addFutureHubConnectors(edges, edgeMap, futureCities, anchorNodes);
    const corridorResult = buildRemoteCargoCorridorEdges(nodes, edgeMap);
    corridorResult.edges.forEach((e) => addEdgeUnique(edges, edgeMap, e));
    globalCorridorEdges = corridorResult.edges.length;
  }

  let repairEdgeCount = 0;
  if (runConnectivityRepair) {
    const repairs = generateConnectivityRepairLinks(nodes, edges, edgeMap);
    repairEdgeCount = repairs.length;
  }

  nodes.forEach((n) => {
    if (!n.infrastructureRole) {
      n.infrastructureRole = classifyInfrastructureRole(n);
    }
  });

  const { nodes: dedupedNodes, idRemap, mergedCount } = deduplicateNodesByNetworkCityId(nodes);
  normalizeEdgeEndpoints(edges, dedupedNodes, idRemap);
  nodes.length = 0;
  nodes.push(...dedupedNodes);

  const audit = auditGraphConnectivity(nodes, edges);
  const classifiedNodes = audit.nodes.map(applyClassificationToNode);
  const nodeByIdFinal = Object.fromEntries(classifiedNodes.map((n) => [n.id, n]));

  enrichAllEdgeConstruction(edges);

  const renderableEdges = edges.filter((e) => e.renderable !== false);
  const paths = renderableEdges.map(toDeckPath);
  const constructionMetrics = computeConstructionMetrics(renderableEdges);

  const switchNodes = classifiedNodes.filter((n) => n.isSwitchNode);
  const connectivity = audit.metrics;

  const throughRouteCount = renderableEdges.filter(
    (e) => e.edgeCategory === 'THROUGH_ROUTE' || e.routeClass === 'THROUGH_ROUTE'
  ).length;
  const continentalSpineCount = renderableEdges.filter(
    (e) => e.edgeCategory === 'CONTINENTAL_SPINE' || e.routeClass === 'CONTINENTAL_SPINE'
  ).length;
  const planetaryGatewayCount = renderableEdges.filter(
    (e) =>
      e.edgeCategory === 'PLANETARY_GATEWAY' ||
      e.routeClass === 'PLANETARY_GATEWAY' ||
      e.routeClass === 'ARCTIC_GATEWAY'
  ).length;

  const metrics = {
    ...base.metrics,
    ...constructionMetrics,
    continentalSpineEdges: continentalSpineCount,
    continentalSpineMiles: spineResult.spineMiles,
    continentalSpineCorridors: spineResult.corridors.length,
    planetaryMergeGatewayEdges: mergeGatewayResult.edgesAdded,
    planetaryMergeGatewayMiles: mergeGatewayResult.gatewayMiles,
    planetaryMergeGatewayCorridors: mergeGatewayResult.corridors.length,
    throughRoutes: throughRouteCount,
    throughRouteMiles: throughResult.throughRouteMiles,
    connectedFeederNetworks: throughResult.connectedFeederNetworks,
    planningRuralEdges,
    futureHubConnectors: futureHubEdges,
    globalCorridorEdges,
    globalCoverageSeeds: buildRemoteStrategicNodes().length,
    connectivityRepairEdges: repairEdgeCount,
    duplicateNodesMerged: mergedCount,
    edgeCountBeforePrune,
    edgeCountAfterPrune: pruneResult.edges.length,
    meshEdgesRemoved: pruneResult.removed,
    meshRemovedByCategory: pruneResult.removedByCategory,
    infrastructureTrunkEdges: trunkResult.edgesAdded,
    infrastructureTrunkCorridors: trunkResult.corridors.length,
    feederAttachments: feederAttachResult.attachments,
    corridorThroughRoutes: corridorThroughResult.edgesAdded,
    corridorThroughRouteMiles: corridorThroughResult.throughRouteMiles,
    connectivity,
  };

  const webStats = {
    ...base.webStats,
    ...constructionMetrics,
    throughRoutes: throughRouteCount,
    throughRouteMiles: throughResult.throughRouteMiles,
    connectedFeederNetworks: throughResult.connectedFeederNetworks,
    continentalSpineEdges: continentalSpineCount,
    continentalSpineMiles: spineResult.spineMiles,
    planetaryMergeGatewayEdges: planetaryGatewayCount,
    planetaryMergeGatewayMiles: mergeGatewayResult.gatewayMiles,
    connectivityPercent: connectivity.connectivityPercent,
    connectedNodes: connectivity.connectedNodes,
    disconnectedNodes: connectivity.disconnectedNodes,
    connectedComponents: connectivity.connectedComponents,
    largestComponentSize: connectivity.largestComponentSize,
    missingCoordinateNodes: connectivity.missingCoordinateNodes,
    futureOnlyNodes: connectivity.futureOnlyNodes,
    repairLinks: connectivity.repairLinks || repairEdgeCount,
    planningRuralEdges,
    futureHubConnectors: futureHubEdges,
    globalCorridorEdges,
  };

  return freezePlanetaryGraph({
    nodes: classifiedNodes,
    edges,
    paths,
    metrics,
    webStats,
    stats: base.stats,
    switchNodes,
    nodeById: nodeByIdFinal,
    connectivity,
    disconnectedNodes: audit.disconnectedNodes,
    connectedComponents: audit.connectedComponents,
    largestComponentIds: audit.largestComponentIds,
  });
}

export { CONNECTION_STATUS };
