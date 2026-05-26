/**
 * Builds sequential intercontinental gateway edges from curated corridor definitions.
 */

import { intercontinentalGatewayRoutes } from './intercontinentalGatewayRoutes.js';
import { HYPERLOOP_ROUTE_CLASSES } from './hyperloopRouteClasses.js';
import { detectWaterCrossing } from '../utils/generateHyperloopGraph.js';
import { enrichEdgeConstruction } from '../utils/applyEdgeConstruction.js';
import { DEFAULT_CONSTRUCTION } from './constructionTypes.js';
import { normalizeCityKey } from './hyperloopPhase1Cities.js';
import {
  buildCanonicalNodeIndex,
  resolveCanonicalGraphNode,
} from '../graph/canonicalNodeResolution.js';

function hasCoordinates(node) {
  return (
    node &&
    typeof node.lat === 'number' &&
    typeof node.lon === 'number' &&
    Number.isFinite(node.lat) &&
    Number.isFinite(node.lon)
  );
}

function haversineDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const CITY_ALIASES = {
  'northeast asia': 'vladivostok',
  'san jose': 'san josé',
  'san josé': 'san josé',
};

function resolveCoordKey(name) {
  const key = normalizeCityKey(name);
  return CITY_ALIASES[key] || key;
}

function isTunnelSegment(gateway, fromName, toName) {
  const pairs = gateway.tunnelSegments || [];
  return pairs.some(
    ([a, b]) =>
      (a === fromName && b === toName) ||
      (a === toName && b === fromName) ||
      (normalizeCityKey(a) === normalizeCityKey(fromName) &&
        normalizeCityKey(b) === normalizeCityKey(toName))
  );
}

function resolveGatewayNode(name, nodeByKey, coordRegistry, roiHubNames, index) {
  const key = resolveCoordKey(name);
  if (nodeByKey.has(key)) return nodeByKey.get(key);

  const node =
    resolveCanonicalGraphNode({
      cityName: name,
      coordRegistry,
      index,
      roiHubNames,
      defaults: {
        isSwitchNode: true,
        allowsSplitOff: true,
        nodeType: 'INTERCONTINENTAL_GATEWAY',
      },
    }) || null;
  if (!node) return null;
  nodeByKey.set(key, node);
  return node;
}

export function makeGatewayEdge(fromNode, toNode, gatewayDef, segmentOptions = {}) {
  if (!hasCoordinates(fromNode) || !hasCoordinates(toNode)) return null;
  if (fromNode.id === toNode.id) return null;

  const distanceMiles = haversineDistanceMiles(
    fromNode.lat,
    fromNode.lon,
    toNode.lat,
    toNode.lon
  );

  const segmentTunnel =
    segmentOptions.tunnelRequired ||
    isTunnelSegment(gatewayDef, fromNode.name, toNode.name);

  const waterCheck = detectWaterCrossing(
    { lat: fromNode.lat, lon: fromNode.lon, continent: fromNode.continent },
    { lat: toNode.lat, lon: toNode.lon, continent: toNode.continent }
  );

  if (waterCheck.blocked && !gatewayDef.specialCrossing && !segmentTunnel) {
    return null;
  }

  const routeClass = segmentTunnel
    ? HYPERLOOP_ROUTE_CLASSES.TUNNEL_REQUIRED
    : HYPERLOOP_ROUTE_CLASSES.INTERCONTINENTAL_HYPERLOOP;

  const edge = {
    id: `${fromNode.id}-${toNode.id}-gateway-${normalizeCityKey(gatewayDef.name)}`,
    from: fromNode.id,
    to: toNode.id,
    fromNode,
    toNode,
    mode: 'HYPERLOOP',
    edgeType: gatewayDef.edgeType || 'INTERCONTINENTAL_GATEWAY_ROUTE',
    routeClass,
    corridor: gatewayDef.name,
    gatewayType: gatewayDef.gatewayType,
    connectsContinents: gatewayDef.connectsContinents,
    distanceMiles,
    supportsPodSplitOff: true,
    requiresStop: false,
    isThroughCorridor: true,
    isInterNetworkConnector: true,
    isIntercontinentalGateway: true,
    tunnelRequired: segmentTunnel,
    tunnelType: segmentTunnel ? gatewayDef.tunnelType || 'UNDERSEA' : null,
    constructionType: DEFAULT_CONSTRUCTION.constructionType,
    waterCrossing: waterCheck.blocked || segmentTunnel,
    specialCrossing: gatewayDef.specialCrossing || false,
    constructionDifficulty: gatewayDef.constructionDifficulty || 'MEDIUM',
    constructionNotes: null,
    renderable: true,
    edgeCategory: 'INTERCONTINENTAL_GATEWAY',
  };

  return enrichEdgeConstruction(edge);
}

/**
 * Generate sequential gateway edges for enabled intercontinental corridors.
 */
export function generateIntercontinentalGatewayEdges(
  nodeByKey,
  coordRegistry,
  options = {}
) {
  const enableFuture = options.enableFutureGateways === true;
  const roiHubNames = options.roiHubNames || new Set();
  const index = buildCanonicalNodeIndex([...nodeByKey.values()]);
  const edges = [];
  const edgeDedupe = new Set();
  let disabledFutureCount = 0;

  intercontinentalGatewayRoutes.forEach((gateway) => {
    if (!gateway.enabledByDefault && !enableFuture) {
      disabledFutureCount += 1;
      return;
    }

    const sequence = gateway.sequence || [];
    if (sequence.length < 2) return;

    for (let i = 0; i < sequence.length - 1; i += 1) {
      const fromNode = resolveGatewayNode(
        sequence[i],
        nodeByKey,
        coordRegistry,
        roiHubNames,
        index
      );
      const toNode = resolveGatewayNode(
        sequence[i + 1],
        nodeByKey,
        coordRegistry,
        roiHubNames,
        index
      );
      if (!fromNode || !toNode) continue;

      const dedupeKey = [fromNode.id, toNode.id].sort().join('|');
      if (edgeDedupe.has(dedupeKey)) continue;

      const edge = makeGatewayEdge(fromNode, toNode, gateway, {
        tunnelRequired: isTunnelSegment(gateway, sequence[i], sequence[i + 1]),
      });
      if (!edge) continue;

      edgeDedupe.add(dedupeKey);
      edges.push(edge);
    }
  });

  const tunnelGatewaySegments = edges.filter((e) => e.tunnelRequired).length;
  const gatewayMiles = Math.round(edges.reduce((s, e) => s + e.distanceMiles, 0));

  return {
    edges,
    intercontinentalGatewayRoutes: edges.length,
    intercontinentalGatewayMiles: gatewayMiles,
    tunnelGatewaySegments,
    disabledFutureGatewayRoutes: disabledFutureCount,
  };
}
