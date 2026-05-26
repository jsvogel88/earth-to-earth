/**
 * Shared helpers for optional future-expansion planning overlays.
 */

import { getRouteColor } from '../styles/hyperloopRouteStyles.js';
import { PLANNING_DEMO_MIN_ZOOM } from './mapLayerDefaults.js';

export const PLANNING_LAYER_LABELS = {
  FUTURE_HIGH_POP: 'Future High-Population Hubs',
  RARE_EARTH: 'Rare Earth Hubs',
  REMOTE_CARGO_ROUTES: 'Remote Cargo / Critical Minerals Routes',
};

export const RARE_EARTH_VISIBLE_MIN_ZOOM = PLANNING_DEMO_MIN_ZOOM;
export const REMOTE_CARGO_ROUTE_MIN_ZOOM = PLANNING_DEMO_MIN_ZOOM;
export const GLOBAL_COVERAGE_VISIBLE_MIN_ZOOM = PLANNING_DEMO_MIN_ZOOM;

export const FUTURE_HUB_FILL = [255, 190, 40, 70];
export const FUTURE_HUB_LINE = [255, 190, 40, 220];

export function hasCoordinates(node) {
  return (
    node &&
    typeof node.lat === 'number' &&
    typeof node.lon === 'number' &&
    !Number.isNaN(node.lat) &&
    !Number.isNaN(node.lon)
  );
}

export function shouldRenderFutureHighPopulationHub(node, layerState) {
  return layerState.showFutureHighPopulationHubs && hasCoordinates(node);
}

export function shouldRenderRareEarthHub(node, layerState, zoom = 0) {
  if (!layerState.showRareEarthHubs || !hasCoordinates(node)) return false;
  const minZ = node.visibleMinZoom ?? RARE_EARTH_VISIBLE_MIN_ZOOM;
  return zoom >= minZ;
}

/** Scatter fill for Rare Earth layer (electric yellow / arctic ice blue). */
export function getRareEarthScatterFillColor(node) {
  const group = `${node.regionGroup || ''} ${node.subRegion || ''}`.toLowerCase();
  if (
    group.includes('arctic') ||
    group.includes('greenland') ||
    node.nodeType === 'ARCTIC_LOGISTICS_NODE'
  ) {
    return [130, 220, 255, 235];
  }
  return [255, 230, 70, 240];
}

export function getRemoteCargoRouteColor(routeClass, edgeType, options = {}) {
  return getRouteColor(routeClass, {
    edgeType,
    routeClass,
    ...options,
  });
}

export function getRareEarthHubFillColor(node) {
  const group = `${node.regionGroup || ''} ${node.subRegion || ''}`.toLowerCase();
  if (node.nodeType === 'ISLAND_ACCESS_NODE' || group.includes('pacific') || group.includes('island')) {
    return [100, 200, 255, 210];
  }
  if (group.includes('arctic') || node.nodeType === 'ARCTIC_LOGISTICS_NODE') {
    return [130, 220, 255, 220];
  }
  if (node.nodeType === 'RAINFOREST_ACCESS_NODE' || group.includes('amazon')) {
    return [80, 200, 160, 220];
  }
  if (node.nodeType === 'DESERT_LOGISTICS_NODE' || group.includes('africa') || group.includes('sahara')) {
    return [230, 180, 80, 220];
  }
  if (node.nodeType === 'OUTBACK_RESOURCE_NODE' || group.includes('australia')) {
    return [255, 120, 50, 220];
  }
  if (
    node.nodeType === 'CRITICAL_MINERALS_NODE' ||
    node.accessPurpose?.includes('critical_minerals')
  ) {
    return [255, 190, 40, 220];
  }
  if (node.nodeType === 'REMOTE_CARGO_NODE' || node.cargoPriority) {
    return [255, 150, 40, 220];
  }
  return [255, 230, 70, 235];
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

function connectorPriority(anchor) {
  let score = 0;
  if (anchor.isSwitchNode) score += 100;
  if (anchor.connectedToTrunk) score += 60;
  if (anchor.isPort || anchor.edgeType === 'PORT_INDUSTRIAL_CONNECTOR') score += 40;
  if (anchor.tier === 2) score += 25;
  if (anchor.tier === 1) score += 15;
  if (anchor.isE2EHub) score += 5;
  return score;
}

/**
 * Prefer switch → trunk → port → E2E hub (only if nearest).
 */
export function findNearestEligibleConnector(remoteNode, candidateNodes) {
  const eligible = (candidateNodes || []).filter(hasCoordinates);
  if (!eligible.length || !hasCoordinates(remoteNode)) return null;

  let best = null;
  let bestDist = Infinity;
  let bestScore = -Infinity;

  eligible.forEach((anchor) => {
    const dist = haversineDistanceMiles(
      remoteNode.lat,
      remoteNode.lon,
      anchor.lat,
      anchor.lon
    );
    const score = connectorPriority(anchor) - dist * 0.02;
    if (dist < bestDist || (dist === bestDist && score > bestScore)) {
      bestDist = dist;
      bestScore = score;
      best = { anchor, distanceMiles: dist };
    }
  });

  return best;
}

/** E2E Routes: contextual overlay within radius of selected origin */
export function filterNodesNearOrigin(nodes, origin, maxMiles) {
  if (!origin || !hasCoordinates(origin)) return [];
  return (nodes || []).filter((node) => {
    if (!hasCoordinates(node)) return false;
    return (
      haversineDistanceMiles(origin.lat, origin.lon, node.lat, node.lon) <= maxMiles
    );
  });
}

export function annotateNearestAnchors(nodes, anchorNodes) {
  return nodes.map((node) => {
    const match = findNearestEligibleConnector(node, anchorNodes);
    if (!match) return node;
    const anchor = match.anchor;
    return {
      ...node,
      nearestHyperloopTrunk: anchor.connectedToTrunk ? anchor.name : node.nearestHyperloopTrunk,
      nearestSwitchNode: anchor.isSwitchNode ? anchor.name : node.nearestSwitchNode,
      nearestE2EHub: anchor.isE2EHub ? anchor.name : node.nearestE2EHub,
    };
  });
}
