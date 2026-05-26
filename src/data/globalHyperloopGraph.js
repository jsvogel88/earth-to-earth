import { regionalFeederCitiesByHub, getFeederCitiesForHub } from './regionalFeederCities.js';
import {
  classifyHyperloopRoute,
  classifyRoute,
  getHyperloopRouteColor,
  getHyperloopLineWidth,
} from './hyperloopRouteClasses.js';
import { normalizeNodeId } from './hyperloopPhase1Cities.js';

export { getHyperloopRouteColor };

export function getHyperloopRouteWidth(routeClass, edgeType) {
  return getHyperloopLineWidth(edgeType, routeClass);
}

import {
  buildGlobalHyperloopGraph,
  hasCoordinates,
} from './phase1GlobalHyperloopGraph.js';

export { buildGlobalHyperloopGraph, hasCoordinates };

export { hyperloopCrosslinks } from './hyperloopCrosslinks.js';
export { generateThroughRoutes, makeThroughEdge } from '../graph/generateThroughRoutes.js';
export {
  intercontinentalGatewayRoutes,
  GATEWAY_TYPES,
} from './intercontinentalGatewayRoutes.js';
export { generateIntercontinentalGatewayEdges } from './intercontinentalGateways.js';
export {
  buildPlanetaryHyperloopGraph,
  normalizePlanetaryNode,
  CONNECTION_STATUS,
} from '../graph/buildPlanetaryHyperloopGraph.js';
export { auditGraphConnectivity } from './graphConnectivityAudit.js';
export {
  buildExtendedRuralNetwork,
  generateExtendedRuralEdges,
  EXTENDED_RURAL_LAYER_LABEL,
  REMOTE_VISIBLE_MIN_ZOOM,
  REMOTE_CARGO_VISIBLE_MIN_ZOOM,
} from './extendedRuralNetwork.js';
export { buildRemoteCargoResourceNodes, REMOTE_NODE_TYPES } from './remoteCargoResourceNodes.js';
export {
  buildFutureHighPopulationCities,
  getFutureHighPopulationMetrics,
  ACTIVE_E2E_HUB_NAMES,
} from './futureHighPopulationCities.js';
export {
  buildRareEarthHubCandidates,
  getRareEarthHubMetrics,
} from './rareEarthHubCandidates.js';
export { buildRemoteCargoPlanningRoutes } from './remoteCargoPlanningRoutes.js';
export {
  buildRemoteStrategicNodes,
  getGlobalCoverageNodeMetrics,
} from './remoteStrategicNodes.js';
export {
  buildRemoteCargoCorridorEdges,
  buildRemoteCargoCorridorPaths,
  REMOTE_CORRIDOR_CHAINS,
  REMOTE_CORRIDOR_VISIBLE_MIN_ZOOM,
  getRemoteCorridorMetrics,
} from './remoteCargoRoutes.js';
export { GLOBAL_COVERAGE_SEEDS, REGION_GROUPS } from './globalCoverageRegions.js';
export {
  DEFAULT_MAP_DISPLAY_MODE,
  DEFAULT_PLANNING_LAYER_STATE,
  PLANNING_DEMO_MIN_ZOOM,
} from './mapLayerDefaults.js';
export {
  PLANNING_LAYER_LABELS,
  RARE_EARTH_VISIBLE_MIN_ZOOM,
  REMOTE_CARGO_ROUTE_MIN_ZOOM,
  hasCoordinates as planningHasCoordinates,
  shouldRenderFutureHighPopulationHub,
  shouldRenderRareEarthHub,
  getRemoteCargoRouteColor,
  getRareEarthHubFillColor,
  getRareEarthScatterFillColor,
  filterNodesNearOrigin,
  FUTURE_HUB_FILL,
  FUTURE_HUB_LINE,
} from './planningLayers.js';

// Route distance thresholds (miles)
export const LOCAL_FEEDER_MAX_MILES = 150;
export const REGIONAL_HYPERLOOP_MAX_MILES = 700;
export const EXTENDED_HYPERLOOP_MAX_MILES = 1400;
export const STARSHIP_PASSENGER_MIN_MILES = 1400;
export const CARGO_HYPERLOOP_MAX_MILES = 3000;

/** Primary map display modes */
import { MAP_DISPLAY_MODES, TRANSPORT_MODES } from './transportOperatingSystem.js';

export { MAP_DISPLAY_MODES, TRANSPORT_MODES };

/** Future analysis overlays (secondary) */
export const ANALYSIS_VIEW_MODES = [
  'Infrastructure',
  'Passenger Demand',
  'Cargo Demand',
  'Displacement',
  'ROI Priority',
];

export const VIEW_MODES = MAP_DISPLAY_MODES;

export const EDGE_TYPES = {
  HYPERLOOP_TRUNK_LINE: 'HYPERLOOP_TRUNK_LINE',
  REGIONAL_FEEDER_LINE: 'REGIONAL_FEEDER_LINE',
  EXTENDED_HYPERLOOP_LINE: 'EXTENDED_HYPERLOOP_LINE',
  SPLIT_OFF_BRANCH: 'SPLIT_OFF_BRANCH',
  LOCAL_CITY_WEB: 'LOCAL_CITY_WEB',
  CARGO_BYPASS_LINE: 'CARGO_BYPASS_LINE',
  CROSS_BORDER_CORRIDOR: 'CROSS_BORDER_CORRIDOR',
  PORT_INDUSTRIAL_CONNECTOR: 'PORT_INDUSTRIAL_CONNECTOR',
};

const BRANCH_POPULATION_THRESHOLD = 150000;
const MAX_INTER_HUB_TRUNK_EDGES = 8;

const haversineDistanceMiles = (lat1, lon1, lat2, lon2) => {
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

export const normalizeNodeKey = (name, country) =>
  `${String(name || '').trim().toLowerCase()}|${String(country || '').trim().toLowerCase()}`;

export { normalizeNodeId };

export { classifyRoute };

const estimateEconomicScore = (population = 0) =>
  Math.min(99, Math.round(40 + Math.log10(Math.max(population || 1, 1)) * 12));

const estimateCargoScore = (population = 0) =>
  Math.min(95, Math.round(35 + Math.log10(Math.max(population || 1, 1)) * 10));

const defaultEdgeBehavior = () => ({
  supportsPodSplitOff: true,
  requiresStop: false,
  isThroughCorridor: true,
});

export function normalizeNode(city, type = 'FEEDER_CITY', meta = {}) {
  if (
    typeof city?.lat !== 'number' ||
    !Number.isFinite(city.lat) ||
    typeof city?.lon !== 'number' ||
    !Number.isFinite(city.lon)
  ) {
    return null;
  }

  const base = {
    id: normalizeNodeId(city.name, city.country),
    name: city.name,
    country: city.country,
    type,
    lat: city.lat,
    lon: city.lon,
    population: city.population ?? null,
    economicScore: city.economicScore ?? estimateEconomicScore(city.population),
    cargoScore: city.cargoScore ?? estimateCargoScore(city.population),
    parentHub: meta.parentHub ?? null,
    connectedCorridors: meta.connectedCorridors ?? [],
    isSwitchNode: meta.isSwitchNode ?? false,
    allowsSplitOff: meta.allowsSplitOff ?? false,
    switchPriority: meta.switchPriority ?? 0,
  };

  return base;
}

export function enrichNodeForWeb(node, options = {}) {
  const {
    parentHub,
    corridorName,
    indexInChain = 0,
    chainLength = 1,
    isE2eAnchor = false,
  } = options;

  const isOrigin = isE2eAnchor || node.type === 'GLOBAL_STARSHIP_HUB';
  const isIntermediate = !isOrigin && indexInChain > 0 && indexInChain < chainLength - 1;
  const isMajor = (node.population || 0) >= BRANCH_POPULATION_THRESHOLD;

  const corridors = new Set(node.connectedCorridors || []);
  if (corridorName) corridors.add(corridorName);

  let type = node.type;
  if (isOrigin) {
    type = 'GLOBAL_STARSHIP_HUB';
  } else if (isIntermediate || isMajor) {
    type = isMajor && !isIntermediate ? 'REGIONAL_HUB' : 'SWITCH_TRANSFER_NODE';
  } else {
    type = 'FEEDER_CITY';
  }

  return {
    ...node,
    type,
    parentHub: parentHub ?? node.parentHub,
    connectedCorridors: [...corridors],
    isSwitchNode: isOrigin || isIntermediate || isMajor,
    allowsSplitOff: isOrigin || isIntermediate || isMajor,
    switchPriority: isOrigin
      ? 100
      : isIntermediate
        ? Math.min(90, 55 + indexInChain * 5)
        : isMajor
          ? 65
          : 35,
  };
}

export function dedupeNodes(nodes) {
  const seen = new Map();

  nodes.forEach((node) => {
    if (!node) return;
    const key = normalizeNodeKey(node.name, node.country);
    const existing = seen.get(key);
    if (existing) {
      const mergedCorridors = new Set([
        ...(existing.connectedCorridors || []),
        ...(node.connectedCorridors || []),
      ]);
      seen.set(key, {
        ...existing,
        connectedCorridors: [...mergedCorridors],
        isSwitchNode: existing.isSwitchNode || node.isSwitchNode,
        allowsSplitOff: existing.allowsSplitOff || node.allowsSplitOff,
        switchPriority: Math.max(existing.switchPriority || 0, node.switchPriority || 0),
      });
      return;
    }
    seen.set(key, node);
  });

  return [...seen.values()];
}

export function buildNodesFromHubsAndFeeders(roiHubs, feederCities = [], parentHubName = null) {
  const hubNodes = roiHubs
    .map((hub) =>
      enrichNodeForWeb(
        normalizeNode(hub, 'GLOBAL_STARSHIP_HUB', { parentHub: hub.name }),
        { isE2eAnchor: true, parentHub: hub.name }
      )
    )
    .filter(Boolean);

  const feederNodes = feederCities
    .map((city) =>
      enrichNodeForWeb(
        normalizeNode(city, 'FEEDER_CITY', {
          parentHub: parentHubName,
          connectedCorridors: city.corridor ? [city.corridor] : [],
        }),
        { parentHub: parentHubName, corridorName: city.corridor }
      )
    )
    .filter(Boolean);

  return dedupeNodes([...hubNodes, ...feederNodes]);
}

function getDisplacedModes(distanceMiles) {
  if (distanceMiles <= LOCAL_FEEDER_MAX_MILES) {
    return ['car', 'rideshare', 'commuter_rail', 'regional_bus'];
  }
  if (distanceMiles <= REGIONAL_HYPERLOOP_MAX_MILES) {
    return ['car', 'regional_flights', 'rail', 'bus', 'short_cargo_trucking'];
  }
  if (distanceMiles <= EXTENDED_HYPERLOOP_MAX_MILES) {
    return ['domestic_flights', 'private_aviation', 'long_haul_rail', 'trucking'];
  }
  return ['first_class', 'business_class', 'private_jet', 'long_haul_air_cargo'];
}

export function computePassengerDisplacementScore({ distanceMiles = 0, routeClass = 'UNCLASSIFIED' } = {}) {
  const timeSavings = Math.min(95, 30 + distanceMiles / 25);
  const premiumDemand = routeClass === 'EXTENDED_HYPERLOOP' ? 75 : 55;
  const costCompetitiveness = distanceMiles > 300 ? 70 : 60;
  const reliabilityGain = 65;
  const comfortGain = routeClass === 'LOCAL_FEEDER' ? 50 : 72;
  const networkConvenience = 58;
  const adoptionFriction = distanceMiles > 1000 ? 18 : 10;

  return Math.round(
    0.35 * timeSavings +
      0.25 * premiumDemand +
      0.15 * costCompetitiveness +
      0.1 * reliabilityGain +
      0.1 * comfortGain +
      0.05 * networkConvenience -
      adoptionFriction
  );
}

export function computeCargoDisplacementScore({ distanceMiles = 0 } = {}) {
  const speedGain = Math.min(90, 25 + distanceMiles / 30);
  const costPerTon = distanceMiles > 500 ? 78 : 62;
  const reliabilityGain = 70;
  const logisticsConnectivity = 68;
  const volumePotential = 60;
  const handlingPenalty = 8;

  return Math.round(
    0.3 * speedGain +
      0.25 * costPerTon +
      0.2 * reliabilityGain +
      0.15 * logisticsConnectivity +
      0.1 * volumePotential -
      handlingPenalty
  );
}

export function computeRoutePriority(edge = {}) {
  const displacement = edge.passengerDisplacementScore ?? 50;
  const premiumDemand = edge.routeClass === 'EXTENDED_HYPERLOOP' ? 80 : 60;
  const timeSavings = Math.min(90, 40 + (edge.distanceMiles || 0) / 20);
  const revenuePotential = 65;
  const networkValue = 62;
  const infrastructureFeasibility = edge.distanceMiles > 1200 ? 45 : 70;
  const strategicValue = 55;
  const regulatoryPenalty = edge.edgeType === EDGE_TYPES.CROSS_BORDER_CORRIDOR ? 12 : 5;

  return Math.round(
    0.25 * premiumDemand +
      0.2 * timeSavings +
      0.15 * displacement +
      0.15 * revenuePotential +
      0.1 * networkValue +
      0.1 * infrastructureFeasibility +
      0.05 * strategicValue -
      regulatoryPenalty
  );
}

function sortCitiesForCorridor(cities, origin) {
  return [...cities]
    .filter(
      (city) =>
        typeof city?.lat === 'number' &&
        Number.isFinite(city.lat) &&
        typeof city?.lon === 'number' &&
        Number.isFinite(city.lon)
    )
    .sort((a, b) => {
      const da =
        typeof a.distanceFromOriginMiles === 'number'
          ? a.distanceFromOriginMiles
          : haversineDistanceMiles(origin.lat, origin.lon, a.lat, a.lon);
      const db =
        typeof b.distanceFromOriginMiles === 'number'
          ? b.distanceFromOriginMiles
          : haversineDistanceMiles(origin.lat, origin.lon, b.lat, b.lon);
      return da - db;
    });
}

function inferEdgeType(routeClass, options = {}) {
  if (options.edgeType) return options.edgeType;
  if (options.isBranch) {
    return options.distanceMiles <= LOCAL_FEEDER_MAX_MILES
      ? EDGE_TYPES.LOCAL_CITY_WEB
      : EDGE_TYPES.SPLIT_OFF_BRANCH;
  }
  if (routeClass === 'EXTENDED_HYPERLOOP') return EDGE_TYPES.EXTENDED_HYPERLOOP_LINE;
  if (routeClass === 'LOCAL_FEEDER') return EDGE_TYPES.REGIONAL_FEEDER_LINE;
  return EDGE_TYPES.HYPERLOOP_TRUNK_LINE;
}

function createPathSegment(fromNode, toNode, options = {}) {
  const {
    corridor = 'Regional',
    edgeType: edgeTypeOverride,
    mode = 'passenger',
    isBranch = false,
    isThroughCorridor = !isBranch,
  } = options;

  const distanceMiles = haversineDistanceMiles(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);
  const routeClass = classifyRoute(distanceMiles, mode === 'cargo' ? 'cargo' : 'passenger');

  if (routeClass === 'STARSHIP_E2E' || routeClass === 'UNCLASSIFIED') {
    return null;
  }

  const edgeType = inferEdgeType(routeClass, { ...options, edgeType: edgeTypeOverride, isBranch, distanceMiles });
  const behavior = defaultEdgeBehavior();

  const passengerDisplacementScore = computePassengerDisplacementScore({ distanceMiles, routeClass });
  const cargoDisplacementScore = computeCargoDisplacementScore({ distanceMiles });

  const edge = {
    id: `${fromNode.id}-${toNode.id}`,
    from: fromNode.id,
    to: toNode.id,
    mode: 'HYPERLOOP',
    edgeType,
    corridor,
    distanceMiles: Math.round(distanceMiles),
    routeClass,
    ...behavior,
    isThroughCorridor,
    supportsPodSplitOff: behavior.supportsPodSplitOff,
    requiresStop: behavior.requiresStop,
    passengerPriority: Math.min(99, passengerDisplacementScore + 5),
    cargoPriority: Math.min(95, cargoDisplacementScore),
    displacedModes: getDisplacedModes(distanceMiles),
    passengerDisplacementScore,
    cargoDisplacementScore,
    routePriority: 0,
    path: [
      [fromNode.lon, fromNode.lat],
      [toNode.lon, toNode.lat],
    ],
    fromName: fromNode.name,
    toName: toNode.name,
    infrastructureOnly: true,
  };

  edge.routePriority = computeRoutePriority(edge);
  return edge;
}

function findNearestTrunkNode(cityNode, trunkNodes) {
  let nearest = trunkNodes[0];
  let minDist = Infinity;

  trunkNodes.forEach((trunk) => {
    const d = haversineDistanceMiles(cityNode.lat, cityNode.lon, trunk.lat, trunk.lon);
    if (d < minDist) {
      minDist = d;
      nearest = trunk;
    }
  });

  return { node: nearest, distanceMiles: minDist };
}

/**
 * Corridor infrastructure: shared trunk through anchor/switch nodes + split-off branches.
 * Lines are tubes (infrastructure), not mandatory pod stops.
 */
export function generateCorridorInfrastructure(
  originNode,
  corridorName,
  cities,
  excludeHubNames = new Set(),
  parentHubName
) {
  const sorted = sortCitiesForCorridor(cities, originNode).filter((city) => !excludeHubNames.has(city.name));

  if (sorted.length === 0) return { segments: [], nodes: [] };

  const cityNodes = sorted
    .map((city) =>
      enrichNodeForWeb(normalizeNode(city, 'FEEDER_CITY'), {
        parentHub: parentHubName,
        corridorName,
      })
    )
    .filter(Boolean);

  const anchors = cityNodes.filter((n) => (n.population || 0) >= BRANCH_POPULATION_THRESHOLD);
  const trunkSequence =
    anchors.length >= 2
      ? anchors
      : anchors.length === 1
        ? anchors
        : cityNodes.length <= 6
          ? cityNodes
          : cityNodes.slice(0, Math.max(3, Math.ceil(cityNodes.length * 0.4)));

  const trunkNodes = [
    enrichNodeForWeb(originNode, {
      isE2eAnchor: true,
      parentHub: parentHubName,
      corridorName,
      indexInChain: 0,
      chainLength: trunkSequence.length + 1,
    }),
    ...trunkSequence.map((node, idx) =>
      enrichNodeForWeb(node, {
        parentHub: parentHubName,
        corridorName,
        indexInChain: idx + 1,
        chainLength: trunkSequence.length + 1,
      })
    ),
  ];

  const segments = [];
  const enrichedNodes = [...trunkNodes];

  for (let i = 0; i < trunkNodes.length - 1; i += 1) {
    const segment = createPathSegment(trunkNodes[i], trunkNodes[i + 1], {
      corridor: corridorName,
      edgeType:
        i === 0 ? EDGE_TYPES.REGIONAL_FEEDER_LINE : EDGE_TYPES.HYPERLOOP_TRUNK_LINE,
      isThroughCorridor: true,
    });
    if (segment) segments.push(segment);
  }

  const trunkIds = new Set(trunkNodes.map((n) => n.id));
  const branchCandidates = cityNodes.filter((n) => !trunkIds.has(n.id));

  branchCandidates.forEach((cityNode) => {
    const { node: attachNode } = findNearestTrunkNode(cityNode, trunkNodes);
    if (!attachNode || attachNode.id === cityNode.id) return;

    const branchNode = enrichNodeForWeb(cityNode, {
      parentHub: parentHubName,
      corridorName,
      indexInChain: 0,
      chainLength: 1,
    });
    branchNode.type = 'SPLIT_OFF_NODE';
    branchNode.isSwitchNode = true;
    branchNode.allowsSplitOff = true;
    branchNode.switchPriority = 45;
    enrichedNodes.push(branchNode);

    const branchSeg = createPathSegment(attachNode, branchNode, {
      corridor: corridorName,
      isBranch: true,
      isThroughCorridor: false,
      edgeType:
        haversineDistanceMiles(attachNode.lat, attachNode.lon, branchNode.lat, branchNode.lon) <=
        LOCAL_FEEDER_MAX_MILES
          ? EDGE_TYPES.LOCAL_CITY_WEB
          : EDGE_TYPES.SPLIT_OFF_BRANCH,
    });
    if (branchSeg) segments.push(branchSeg);
  });

  return { segments, nodes: dedupeNodes(enrichedNodes) };
}

export function generateCorridorEdges(originNode, corridorName, cities, excludeHubNames = new Set()) {
  return generateCorridorInfrastructure(
    originNode,
    corridorName,
    cities,
    excludeHubNames,
    originNode.name
  ).segments;
}

export function generateTrunkEdgesBetweenHubs(originNode, roiHubs, excludeHubNames = new Set()) {
  const candidates = [];

  roiHubs.forEach((hub) => {
    if (hub.name === originNode.name) return;
    if (excludeHubNames.has(hub.name)) return;

    const distanceMiles = haversineDistanceMiles(
      originNode.lat,
      originNode.lon,
      hub.lat,
      hub.lon
    );

    if (distanceMiles > EXTENDED_HYPERLOOP_MAX_MILES) return;

    candidates.push({ hub, distanceMiles });
  });

  candidates.sort((a, b) => a.distanceMiles - b.distanceMiles);
  const nearest = candidates.slice(0, MAX_INTER_HUB_TRUNK_EDGES);

  const segments = [];
  nearest.forEach(({ hub }) => {
    const targetNode = enrichNodeForWeb(normalizeNode(hub, 'GLOBAL_STARSHIP_HUB'), {
      isE2eAnchor: true,
      parentHub: hub.name,
    });
    if (!targetNode) return;

    const segment = createPathSegment(originNode, targetNode, {
      corridor: 'Inter-Hub Trunk',
      edgeType: EDGE_TYPES.HYPERLOOP_TRUNK_LINE,
      isThroughCorridor: true,
    });
    if (segment) segments.push(segment);
  });

  return segments;
}

function countByClass(segments) {
  return segments.reduce(
    (acc, seg) => {
      if (seg.routeClass === 'LOCAL_FEEDER') acc.local += 1;
      else if (seg.routeClass === 'REGIONAL_HYPERLOOP') acc.regional += 1;
      else if (seg.routeClass === 'EXTENDED_HYPERLOOP') acc.extended += 1;
      else if (seg.routeClass === 'CARGO_HYPERLOOP') acc.cargo += 1;

      if (
        seg.edgeType === EDGE_TYPES.HYPERLOOP_TRUNK_LINE ||
        seg.edgeType === EDGE_TYPES.EXTENDED_HYPERLOOP_LINE
      ) {
        acc.trunk += 1;
      }
      if (
        seg.edgeType === EDGE_TYPES.SPLIT_OFF_BRANCH ||
        seg.edgeType === EDGE_TYPES.LOCAL_CITY_WEB
      ) {
        acc.branch += 1;
      }

      return acc;
    },
    { local: 0, regional: 0, extended: 0, cargo: 0, trunk: 0, branch: 0, total: segments.length }
  );
}

function computeWebStats(segments, nodes, originName) {
  const switchNodes = nodes.filter((n) => n.isSwitchNode && n.allowsSplitOff);
  const tubeMiles = segments.reduce((sum, s) => sum + (s.distanceMiles || 0), 0);
  const avgEdge =
    segments.length > 0 ? tubeMiles / segments.length : 0;

  return {
    totalNodes: nodes.length,
    totalEdges: segments.length,
    switchNodes: switchNodes.length,
    trunkLines: segments.filter(
      (s) =>
        s.edgeType === EDGE_TYPES.HYPERLOOP_TRUNK_LINE ||
        s.edgeType === EDGE_TYPES.EXTENDED_HYPERLOOP_LINE
    ).length,
    branchLines: segments.filter(
      (s) =>
        s.edgeType === EDGE_TYPES.SPLIT_OFF_BRANCH || s.edgeType === EDGE_TYPES.LOCAL_CITY_WEB
    ).length,
    estimatedTubeMiles: Math.round(tubeMiles),
    avgEdgeDistance: Math.round(avgEdge),
    connectedE2eHubs: originName ? 1 : 0,
  };
}

/**
 * Packet-switched pod routing description (placeholder).
 * Intermediate nodes are pass-through / switch — not mandatory stops.
 */
export function describePodRoute(pathNodeIds, nodeById = {}) {
  if (!Array.isArray(pathNodeIds) || pathNodeIds.length < 2) {
    return {
      path: pathNodeIds || [],
      stopsRequired: [],
      passThroughNodes: [],
      splitOffNodes: [],
      routingNote: 'Invalid path',
    };
  }

  const origin = pathNodeIds[0];
  const destination = pathNodeIds[pathNodeIds.length - 1];
  const intermediate = pathNodeIds.slice(1, -1);

  const passThroughNodes = intermediate.filter((id) => {
    const n = nodeById[id];
    return n && (n.isSwitchNode || n.isThroughCorridor !== false);
  });

  const splitOffNodes = intermediate.filter((id) => {
    const n = nodeById[id];
    return n && n.allowsSplitOff;
  });

  return {
    path: pathNodeIds,
    stopsRequired: [origin, destination],
    passThroughNodes,
    splitOffNodes,
    routingNote:
      'Packet-switched physical transport: pods enter the web, traverse trunk tubes, and may split at switch nodes. Only origin and destination require stops.',
  };
}

/**
 * Build Hyperloop Web infrastructure for selected E2E hub (not a train schedule).
 */
export function buildHyperloopPathsForOrigin(origin, roiHubs, options = {}) {
  const { excludeHubNames = [], includeTrunkHubEdges = true } = options;
  const exclude = new Set(excludeHubNames);

  const originNode = enrichNodeForWeb(normalizeNode(origin, 'GLOBAL_STARSHIP_HUB'), {
    isE2eAnchor: true,
    parentHub: origin.name,
  });

  if (!originNode) {
    return {
      paths: [],
      stats: { local: 0, regional: 0, extended: 0, cargo: 0, trunk: 0, branch: 0, total: 0 },
      nodes: [],
      switchNodes: [],
      webStats: computeWebStats([], [], null),
      nodeById: {},
    };
  }

  const hubData = regionalFeederCitiesByHub[origin.name];
  const segments = [];
  const allNodes = [originNode];
  const segmentIds = new Set();

  const pushSegment = (segment) => {
    if (!segment || segmentIds.has(segment.id)) return;
    segmentIds.add(segment.id);
    segments.push(segment);
  };

  if (hubData && typeof hubData === 'object') {
    Object.entries(hubData).forEach(([corridorName, cities]) => {
      if (!Array.isArray(cities)) return;
      const { segments: corridorSegs, nodes: corridorNodes } = generateCorridorInfrastructure(
        originNode,
        corridorName,
        cities,
        exclude,
        origin.name
      );
      corridorSegs.forEach(pushSegment);
      allNodes.push(...corridorNodes);
    });
  }

  if (includeTrunkHubEdges) {
    generateTrunkEdgesBetweenHubs(originNode, roiHubs, exclude).forEach(pushSegment);
  }

  const feederCities = [];
  if (hubData) {
    Object.values(hubData).forEach((corridor) => {
      if (Array.isArray(corridor)) feederCities.push(...corridor);
    });
  }

  const nodes = buildNodesFromHubsAndFeeders(roiHubs, feederCities, origin.name);
  const mergedNodes = dedupeNodes([...nodes, ...allNodes]);
  const nodeById = Object.fromEntries(mergedNodes.map((n) => [n.id, n]));
  const switchNodes = mergedNodes.filter(
    (n) => n.isSwitchNode && n.allowsSplitOff && n.id !== originNode.id
  );

  return {
    paths: segments,
    stats: countByClass(segments),
    nodes: mergedNodes,
    switchNodes,
    webStats: computeWebStats(segments, mergedNodes, origin.name),
    nodeById,
  };
}

function undirectedEdgeKey(segment) {
  return [segment.from, segment.to].sort().join('|');
}

/**
 * Merge all E2E hub regional webs into one planetary infrastructure graph.
 * Deduplicates undirected tube segments to avoid spaghetti / duplicate trunks.
 */
export function buildGlobalHyperloopWeb(roiHubs) {
  const roiHubNames = roiHubs.map((h) => h.name);
  const segmentKeys = new Set();
  const allSegments = [];
  const allNodes = [];

  const pushSegment = (segment) => {
    if (!segment) return;
    const key = undirectedEdgeKey(segment);
    if (segmentKeys.has(key)) return;
    segmentKeys.add(key);
    allSegments.push(segment);
  };

  roiHubs.forEach((origin) => {
    if (!regionalFeederCitiesByHub[origin.name]) return;

    const { paths, nodes } = buildHyperloopPathsForOrigin(origin, roiHubs, {
      excludeHubNames: roiHubNames,
      includeTrunkHubEdges: false,
    });

    paths.forEach(pushSegment);
    allNodes.push(...nodes);
  });

  const trunkPairs = new Set();
  roiHubs.forEach((origin) => {
    const originNode = enrichNodeForWeb(normalizeNode(origin, 'GLOBAL_STARSHIP_HUB'), {
      isE2eAnchor: true,
      parentHub: origin.name,
    });
    if (!originNode) return;

    generateTrunkEdgesBetweenHubs(originNode, roiHubs, new Set()).forEach((seg) => {
      const pairKey = undirectedEdgeKey(seg);
      if (trunkPairs.has(pairKey)) return;
      trunkPairs.add(pairKey);
      pushSegment(seg);
    });
  });

  roiHubs.forEach((hub) => {
    const anchor = enrichNodeForWeb(normalizeNode(hub, 'GLOBAL_STARSHIP_HUB'), {
      isE2eAnchor: true,
      parentHub: hub.name,
    });
    if (anchor) allNodes.push(anchor);
  });

  const mergedNodes = dedupeNodes(allNodes);
  const switchNodes = mergedNodes.filter(
    (n) =>
      n.isSwitchNode &&
      n.allowsSplitOff &&
      n.type !== 'GLOBAL_STARSHIP_HUB'
  );

  const connectedE2eHubs = roiHubs.filter((h) => regionalFeederCitiesByHub[h.name]).length;

  return {
    paths: allSegments,
    stats: countByClass(allSegments),
    nodes: mergedNodes,
    switchNodes,
    webStats: {
      ...computeWebStats(allSegments, mergedNodes, null),
      connectedE2eHubs,
    },
    nodeById: Object.fromEntries(mergedNodes.map((n) => [n.id, n])),
  };
}

/**
 * Merge curated regional feeders + Phase 1 nodes within regional Hyperloop radius.
 */
export function getFeederCitiesForOrigin(
  origin,
  feederCitiesByHub,
  phase1Nodes,
  options = {}
) {
  if (!origin || !hasCoordinates(origin)) return [];

  const radius = options.radiusMiles ?? REGIONAL_HYPERLOOP_MAX_MILES;
  const exclude = new Set(
    (options.excludeHubNames || []).map((n) => String(n).toLowerCase())
  );

  const curated = getFeederCitiesForHub(origin.name, {
    excludeHubNames: options.excludeHubNames,
  });

  const nearbyPhase1 = (phase1Nodes || [])
    .filter((node) => {
      if (!hasCoordinates(node)) return false;
      if (node.name === origin.name) return false;
      if (exclude.has(String(node.name).toLowerCase())) return false;
      const distance = haversineDistanceMiles(
        origin.lat,
        origin.lon,
        node.lat,
        node.lon
      );
      return distance <= radius;
    })
    .map((node) => ({
      name: node.name,
      country: node.country || '',
      lat: node.lat,
      lon: node.lon,
      corridor: node.primaryCorridor || node.corridors?.[0] || 'Phase 1 Network',
      population: node.population ?? null,
      isSwitchNode: node.isSwitchNode,
      source: 'phase1',
    }));

  const merged = [...curated, ...nearbyPhase1];
  const seen = new Set();

  return merged.filter((city) => {
    const key = `${city.name}-${city.country || ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return hasCoordinates(city);
  });
}

/** Spoke routes from E2E origin to each feeder city (E2E Routes mode). */
export function buildE2eFeederRoutes(origin, feederCities) {
  if (!origin || !hasCoordinates(origin)) return [];

  return feederCities
    .filter(hasCoordinates)
    .map((city, index) => {
      const distanceMiles = haversineDistanceMiles(
        origin.lat,
        origin.lon,
        city.lat,
        city.lon
      );
      const routeClass = classifyHyperloopRoute(distanceMiles);
      const edgeType =
        distanceMiles <= LOCAL_FEEDER_MAX_MILES
          ? 'LOCAL_CITY_WEB'
          : 'REGIONAL_FEEDER_LINE';

      return {
        id: `e2e-feeder-${origin.id}-${index}`,
        path: [
          [origin.lon, origin.lat],
          [city.lon, city.lat],
        ],
        routeClass,
        edgeType,
        distanceMiles,
        corridor: city.corridor || 'Regional Feeder',
        infrastructureOnly: true,
        feederName: city.name,
      };
    });
}

export { haversineDistanceMiles };
