/**
 * E2E Routes mode — sliced view of the frozen planetary graph (no second network builder).
 */

import { regionalFeederCitiesByHub } from '../data/regionalFeederCities.js';
import {
  getFeederCitiesForOrigin,
  haversineDistanceMiles,
  REGIONAL_HYPERLOOP_MAX_MILES,
  STARSHIP_PASSENGER_MIN_MILES,
} from '../data/globalHyperloopGraph.js';
import { hasCoordinates } from '../data/phase1GlobalHyperloopGraph.js';
import { networkCityId } from '../data/worldCities.js';
import { normalizeCityKey } from '../data/hyperloopPhase1Cities.js';
import {
  classifyHyperloopRoute,
  HYPERLOOP_ROUTE_CLASSES,
} from '../data/hyperloopRouteClasses.js';

const emptyHyperloopStats = {
  local: 0,
  regional: 0,
  extended: 0,
  cargo: 0,
  trunk: 0,
  branch: 0,
  total: 0,
};

function assignFeederIds(cities, originId) {
  return cities.map((city, index) => ({
    ...city,
    id: `feeder_${originId}_${index}`,
  }));
}

function resolveOriginNodeId(origin, planetaryGraph) {
  const canonical = origin.networkCityId || networkCityId(origin.name, origin.country);
  if (planetaryGraph.nodeById?.[canonical]) return canonical;

  const match = planetaryGraph.nodes.find(
    (n) =>
      normalizeCityKey(n.name) === normalizeCityKey(origin.name) &&
      normalizeCityKey(n.country || '') === normalizeCityKey(origin.country || '')
  );
  return match?.id ?? canonical;
}

function edgeToDeckPath(edge) {
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

function countHyperloopStats(paths) {
  const stats = { ...emptyHyperloopStats };
  paths.forEach((p) => {
    if (p.routeClass === HYPERLOOP_ROUTE_CLASSES.LOCAL_FEEDER) stats.local += 1;
    else if (p.routeClass === HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP) stats.regional += 1;
    else if (p.routeClass === HYPERLOOP_ROUTE_CLASSES.EXTENDED_HYPERLOOP) stats.extended += 1;
    else if (p.routeClass === HYPERLOOP_ROUTE_CLASSES.CARGO_HYPERLOOP) stats.cargo += 1;
    if (p.edgeType === 'HYPERLOOP_TRUNK_LINE') stats.trunk += 1;
    if (p.edgeType === 'SPLIT_OFF_BRANCH' || p.edgeCategory === 'SPLIT_OFF') stats.branch += 1;
    stats.total += 1;
  });
  return stats;
}

/**
 * Slice planetary edges/paths for one E2E origin hub.
 */
export function slicePlanetaryGraphForOrigin(planetaryGraph, origin, roiHubs, radiusMiles) {
  const originNodeId = resolveOriginNodeId(origin, planetaryGraph);
  const nodeIdsInRadius = new Set([originNodeId]);

  planetaryGraph.nodes.forEach((n) => {
    if (!hasCoordinates(n)) return;
    if (
      haversineDistanceMiles(origin.lat, origin.lon, n.lat, n.lon) <= radiusMiles
    ) {
      nodeIdsInRadius.add(n.id);
    }
  });

  const pathByEdgeId = new Map(planetaryGraph.paths.map((p) => [p.id, p]));

  const selectedEdges = planetaryGraph.edges.filter((e) => {
    if (e.renderable === false) return false;
    const inRadius =
      nodeIdsInRadius.has(e.from) && nodeIdsInRadius.has(e.to);
    const trunkFromOrigin =
      e.edgeType === 'HYPERLOOP_TRUNK_LINE' &&
      (e.from === originNodeId || e.to === originNodeId);
    return inRadius || trunkFromOrigin;
  });

  const hyperloopRoutes = selectedEdges.map(
    (e) => pathByEdgeId.get(e.id) || edgeToDeckPath(e)
  );

  let e2eFeederRoutes = selectedEdges
    .filter(
      (e) =>
        (e.from === originNodeId || e.to === originNodeId) &&
        (e.edgeCategory === 'E2E_FEEDER' ||
          e.edgeType === 'LOCAL_CITY_WEB' ||
          e.edgeType === 'REGIONAL_FEEDER_LINE')
    )
    .map((e) => pathByEdgeId.get(e.id) || edgeToDeckPath(e));

  const hyperloopSwitchNodes = planetaryGraph.nodes.filter(
    (n) =>
      n.isSwitchNode &&
      nodeIdsInRadius.has(n.id) &&
      n.id !== originNodeId
  );

  return {
    hyperloopRoutes,
    e2eFeederRoutes,
    hyperloopStats: countHyperloopStats(hyperloopRoutes),
    hyperloopSwitchNodes,
  };
}

export function buildE2EOriginView({
  originId,
  roiHubs,
  planetaryGraph,
  radiusMiles = REGIONAL_HYPERLOOP_MAX_MILES,
}) {
  if (originId == null) {
    return {
      starshipRoutes: [],
      hyperloopRoutes: [],
      hyperloopStats: emptyHyperloopStats,
      hyperloopSwitchNodes: [],
      regionalHubsInRadius: [],
      feederCitiesInRadius: [],
      e2eFeederRoutes: [],
      feederStats: { count: 0, avgDistance: 0 },
    };
  }

  const origin = roiHubs.find((h) => h.id === originId);
  if (!origin) {
    return {
      starshipRoutes: [],
      hyperloopRoutes: [],
      e2eFeederRoutes: [],
      hyperloopStats: emptyHyperloopStats,
      hyperloopSwitchNodes: [],
      regionalHubsInRadius: [],
      feederCitiesInRadius: [],
      feederStats: { count: 0, avgDistance: 0 },
    };
  }

  const roiHubNames = roiHubs.map((h) => h.name);
  const mergedFeeders = getFeederCitiesForOrigin(
    origin,
    regionalFeederCitiesByHub,
    planetaryGraph.nodes,
    { excludeHubNames: roiHubNames, radiusMiles }
  );
  const curatedFeeders = assignFeederIds(mergedFeeders, origin.id);

  const sliced = slicePlanetaryGraphForOrigin(
    planetaryGraph,
    origin,
    roiHubs,
    radiusMiles
  );

  if (sliced.e2eFeederRoutes.length === 0 && curatedFeeders.length > 0) {
    sliced.e2eFeederRoutes = curatedFeeders
      .filter((city) => hasCoordinates(city))
      .map((city, index) => {
        const distanceMiles = haversineDistanceMiles(
          origin.lat,
          origin.lon,
          city.lat,
          city.lon
        );
        return {
          id: `e2e-feeder-view-${origin.id}-${index}`,
          path: [
            [origin.lon, origin.lat],
            [city.lon, city.lat],
          ],
          routeClass: classifyHyperloopRoute(distanceMiles),
          edgeType:
            distanceMiles <= 150 ? 'LOCAL_CITY_WEB' : 'REGIONAL_FEEDER_LINE',
          distanceMiles,
          corridor: city.corridor || 'Regional Feeder',
          infrastructureOnly: true,
          feederName: city.name,
          renderable: true,
        };
      });
  }

  const regionalHubsInRadius = roiHubs.filter((hub) => {
    if (hub.id === originId) return false;
    const dist = haversineDistanceMiles(origin.lat, origin.lon, hub.lat, hub.lon);
    return dist <= REGIONAL_HYPERLOOP_MAX_MILES;
  });

  const starshipDests = roiHubs.filter((hub) => {
    if (hub.id === originId) return false;
    const dist = haversineDistanceMiles(origin.lat, origin.lon, hub.lat, hub.lon);
    return dist > STARSHIP_PASSENGER_MIN_MILES;
  });

  const starshipRoutes = starshipDests.map((destination) => ({
    sourcePosition: [origin.lon, origin.lat],
    targetPosition: [destination.lon, destination.lat],
    type: 'starship',
    destination,
    routeClass: 'STARSHIP_E2E_ARC',
  }));

  const totalDist = curatedFeeders.reduce(
    (sum, city) => sum + haversineDistanceMiles(origin.lat, origin.lon, city.lat, city.lon),
    0
  );

  return {
    starshipRoutes,
    hyperloopRoutes: sliced.hyperloopRoutes,
    e2eFeederRoutes: sliced.e2eFeederRoutes,
    hyperloopStats: sliced.hyperloopStats,
    hyperloopSwitchNodes: sliced.hyperloopSwitchNodes,
    regionalHubsInRadius,
    feederCitiesInRadius: curatedFeeders,
    feederStats: {
      count: curatedFeeders.length,
      avgDistance: curatedFeeders.length > 0 ? totalDist / curatedFeeders.length : 0,
    },
  };
}
