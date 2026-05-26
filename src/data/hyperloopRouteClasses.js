// Route distance thresholds and visual classification (Phase 1 Hyperloop Web)

import { getRouteColor, getRouteWidth } from '../styles/hyperloopRouteStyles.js';

export const ROUTE_THRESHOLDS = {
  localFeederMaxMiles: 150,
  regionalHyperloopMaxMiles: 700,
  extendedHyperloopMaxMiles: 1400,
  starshipPassengerMinMiles: 1400,
  cargoHyperloopMaxMiles: 3000,
};

export const HYPERLOOP_ROUTE_CLASSES = {
  LOCAL_FEEDER: 'LOCAL_FEEDER',
  REGIONAL_HYPERLOOP: 'REGIONAL_HYPERLOOP',
  CONTINENTAL_SPINE: 'CONTINENTAL_SPINE',
  PLANETARY_GATEWAY: 'PLANETARY_GATEWAY',
  ARCTIC_GATEWAY: 'ARCTIC_GATEWAY',
  EXTENDED_HYPERLOOP: 'EXTENDED_HYPERLOOP',
  CARGO_HYPERLOOP: 'CARGO_HYPERLOOP',
  TUNNEL_REQUIRED: 'TUNNEL_REQUIRED',
  THROUGH_ROUTE: 'THROUGH_ROUTE',
  INTERCONTINENTAL_HYPERLOOP: 'INTERCONTINENTAL_HYPERLOOP',
  RURAL_NETWORK: 'RURAL_NETWORK',
  REMOTE_CARGO: 'REMOTE_CARGO',
  CRITICAL_MINERALS: 'CRITICAL_MINERALS',
  RARE_EARTH_RESOURCE: 'RARE_EARTH_RESOURCE',
  ARCTIC_LOGISTICS: 'ARCTIC_LOGISTICS',
  RESOURCE_CORRIDOR: 'RESOURCE_CORRIDOR',
  CONNECTIVITY_REPAIR: 'CONNECTIVITY_REPAIR',
  SPECIAL_FUTURE_CORRIDOR: 'SPECIAL_FUTURE_CORRIDOR',
  DESERT_LOGISTICS: 'DESERT_LOGISTICS',
  RAINFOREST_ACCESS: 'RAINFOREST_ACCESS',
  OUTBACK_RESOURCE: 'OUTBACK_RESOURCE',
  UNCLASSIFIED: 'UNCLASSIFIED',
};

/** Canonical distance-based route class (all builders should use this). */
export function classifyHyperloopRoute(distanceMiles, options = {}) {
  const { cargoPriority = false, tunnelRequired = false } = options;

  if (tunnelRequired) return HYPERLOOP_ROUTE_CLASSES.TUNNEL_REQUIRED;
  if (distanceMiles <= ROUTE_THRESHOLDS.localFeederMaxMiles) {
    return HYPERLOOP_ROUTE_CLASSES.LOCAL_FEEDER;
  }
  if (distanceMiles <= ROUTE_THRESHOLDS.regionalHyperloopMaxMiles) {
    return HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP;
  }
  if (distanceMiles <= ROUTE_THRESHOLDS.extendedHyperloopMaxMiles) {
    return HYPERLOOP_ROUTE_CLASSES.EXTENDED_HYPERLOOP;
  }
  if (cargoPriority && distanceMiles <= ROUTE_THRESHOLDS.cargoHyperloopMaxMiles) {
    return HYPERLOOP_ROUTE_CLASSES.CARGO_HYPERLOOP;
  }

  return HYPERLOOP_ROUTE_CLASSES.UNCLASSIFIED;
}

/**
 * Legacy API — passenger/cargo/starship bands; delegates to classifyHyperloopRoute.
 */
export function classifyRoute(distanceMiles, mode = 'passenger') {
  if (!Number.isFinite(distanceMiles) || distanceMiles < 0) {
    return HYPERLOOP_ROUTE_CLASSES.UNCLASSIFIED;
  }
  if (mode === 'passenger' && distanceMiles >= ROUTE_THRESHOLDS.starshipPassengerMinMiles) {
    return 'STARSHIP_E2E';
  }
  return classifyHyperloopRoute(distanceMiles, {
    cargoPriority: mode === 'cargo',
  });
}

export function getHyperloopRouteColor(routeClass, edgeType, options = {}) {
  return getRouteColor(routeClass, {
    edgeType,
    tunnelRequired: options.tunnelRequired,
    constructionType: options.constructionType,
  });
}

export function getHyperloopLineWidth(edgeType, routeClass) {
  return getRouteWidth(routeClass, { edgeType });
}

/** Node fill color for Extended Rural layer scatter points */
export function getRemoteNodeColor(nodeType) {
  switch (nodeType) {
    case 'CRITICAL_MINERALS_NODE':
      return [255, 190, 40, 235];
    case 'RARE_EARTH_NODE':
      return [255, 230, 70, 235];
    case 'MINING_RESOURCE_NODE':
    case 'OUTBACK_RESOURCE_NODE':
      return [255, 120, 40, 220];
    case 'ARCTIC_PORT_NODE':
      return [130, 220, 255, 220];
    case 'ISLAND_ACCESS_NODE':
      return [100, 200, 255, 200];
    default:
      return [90, 180, 255, 190];
  }
}
