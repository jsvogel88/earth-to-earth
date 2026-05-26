/**
 * Hyperloop route visual system — styling only (no graph or route generation).
 */

import { CONSTRUCTION_TYPES } from '../data/constructionTypes.js';

/** @typedef {[number, number, number, number]} RgbaColor */

export const ROUTE_STYLE = {
  STARSHIP_E2E_ARC: { color: [255, 215, 80, 235], width: 5, dash: null, glow: 0.35 },
  PLANETARY_TRUNK: { color: [80, 200, 255, 250], width: 5.5, dash: null, glow: 0.38 },
  GLOBAL_MACRO_CORRIDOR: { color: [120, 180, 255, 170], width: 3.5, dash: [12, 6], glow: 0.1 },
  CONTINENTAL_SPINE: { color: [60, 180, 255, 240], width: 4.5, dash: null, glow: 0.25 },
  REGIONAL_TRUNK: { color: [0, 210, 230, 230], width: 3.25, dash: null, glow: 0.15 },
  FEEDER_BRANCH: { color: [0, 255, 140, 215], width: 1.75, dash: null, glow: 0 },
  LOCAL_FEEDER: { color: [0, 255, 140, 220], width: 1.5, dash: null, glow: 0 },
  REGIONAL_HYPERLOOP: { color: [0, 210, 230, 220], width: 2.5, dash: null, glow: 0.1 },
  EXTENDED_HYPERLOOP: { color: [145, 80, 255, 220], width: 2.75, dash: null, glow: 0.12 },
  THROUGH_ROUTE: { color: [220, 0, 255, 245], width: 4.5, dash: [14, 5], glow: 0.4 },
  INTERCONTINENTAL_HYPERLOOP: { color: [80, 130, 255, 235], width: 4, dash: [12, 6], glow: 0.2 },
  INTERCONTINENTAL_GATEWAY_ROUTE: { color: [80, 130, 255, 235], width: 4, dash: [12, 6], glow: 0.2 },
  PLANETARY_GATEWAY: { color: [100, 200, 255, 245], width: 4.25, dash: [10, 5], glow: 0.28 },
  ARCTIC_GATEWAY: { color: [180, 230, 255, 250], width: 4.5, dash: [8, 4], glow: 0.32 },
  PLANETARY_GATEWAY_ROUTE: { color: [100, 200, 255, 245], width: 4.25, dash: [10, 5], glow: 0.28 },
  UNDERSEA_TUNNEL: { color: [40, 120, 255, 235], width: 3.75, dash: [3, 5], glow: 0.3 },
  MOUNTAIN_TUNNEL: { color: [255, 60, 100, 235], width: 3.5, dash: [6, 4], glow: 0.2 },
  TUNNEL_REQUIRED: { color: [255, 40, 80, 240], width: 3.5, dash: [3, 5], glow: 0.25 },
  REMOTE_CARGO: { color: [255, 150, 40, 225], width: 2.5, dash: [8, 5], glow: 0 },
  CRITICAL_MINERALS: { color: [255, 185, 40, 235], width: 3, dash: null, glow: 0.1 },
  RARE_EARTH_RESOURCE: { color: [255, 235, 60, 240], width: 3, dash: [2, 5], glow: 0.15 },
  ARCTIC_LOGISTICS: { color: [130, 225, 255, 230], width: 2.5, dash: [9, 5], glow: 0.1 },
  RAINFOREST_ACCESS: { color: [40, 220, 170, 225], width: 2.5, dash: [2, 6], glow: 0 },
  DESERT_LOGISTICS: { color: [255, 180, 40, 225], width: 2.5, dash: [8, 5], glow: 0 },
  OUTBACK_RESOURCE: { color: [255, 105, 30, 225], width: 2.5, dash: [8, 5], glow: 0 },
  ISLAND_ACCESS: { color: [170, 90, 255, 180], width: 2, dash: [2, 8], glow: 0 },
  SPECIAL_FUTURE_CORRIDOR: { color: [170, 90, 255, 180], width: 2, dash: [2, 8], glow: 0.15 },
  CONNECTIVITY_REPAIR_LINK: { color: [170, 220, 255, 190], width: 2, dash: [2, 6], glow: 0.2 },
  CONNECTIVITY_REPAIR: { color: [170, 220, 255, 190], width: 2, dash: [2, 6], glow: 0.2 },
  CARGO_HYPERLOOP: { color: [255, 150, 40, 225], width: 2.75, dash: [8, 5], glow: 0 },
  RESOURCE_CORRIDOR: { color: [255, 105, 30, 225], width: 2.5, dash: [8, 5], glow: 0 },
  RURAL_NETWORK: { color: [0, 255, 140, 200], width: 1.25, dash: null, glow: 0 },
  UNCLASSIFIED: { color: [0, 210, 230, 190], width: 2, dash: null, glow: 0 },
  E2M_ORBITAL_CORRIDOR: { color: [210, 150, 50, 220], width: 3, dash: [10, 6], glow: 0.15 },
};

const TUNNEL_COLOR = [255, 40, 80, 240];
const TUNNEL_DASH = [3, 5];
const UNDERSEA_TUNNEL_DASH = [3, 5];
const MOUNTAIN_TUNNEL_DASH = [6, 4];
const URBAN_TUNNEL_DASH = [6, 4];
const ARCTIC_ENGINEERING_COLOR = [130, 225, 255, 230];
const ARCTIC_ENGINEERING_DASH = [9, 5];
const DESERT_CORRIDOR_COLOR = [255, 180, 40, 225];
const DESERT_CORRIDOR_DASH = [8, 5];

function mapInfrastructureToVisualClass(edge = {}) {
  if (edge.edgeCategory === 'PLANETARY_TRUNK' || edge.infrastructureTier === 1) {
    return 'PLANETARY_TRUNK';
  }
  if (edge.edgeType === 'HYPERLOOP_TRUNK_LINE') return 'CONTINENTAL_SPINE';
  if (edge.edgeType === 'EXTENDED_HYPERLOOP_LINE') return 'REGIONAL_TRUNK';
  if (
    edge.edgeType === 'REGIONAL_FEEDER_LINE' ||
    edge.edgeType === 'LOCAL_CITY_WEB' ||
    edge.edgeType === 'SPLIT_OFF_BRANCH'
  ) {
    return 'FEEDER_BRANCH';
  }
  return null;
}

export function resolveRouteClass(edge = {}) {
  if (
    edge.tunnelRequired ||
    edge.tunnelType ||
    edge.constructionDifficulty === 'EXTREME' ||
    edge.routeClass === 'TUNNEL_REQUIRED'
  ) {
    if (edge.constructionType === CONSTRUCTION_TYPES.UNDERSEA_TUNNEL) {
      return 'UNDERSEA_TUNNEL';
    }
    if (edge.constructionType === CONSTRUCTION_TYPES.MOUNTAIN_TUNNEL) {
      return 'MOUNTAIN_TUNNEL';
    }
    return 'TUNNEL_REQUIRED';
  }

  if (edge.planningOverlay || edge.previewOnly) {
    return 'GLOBAL_MACRO_CORRIDOR';
  }
  if (edge.edgeType === 'CONNECTIVITY_REPAIR_LINK' || edge.edgeCategory === 'CONNECTIVITY_REPAIR') {
    return 'CONNECTIVITY_REPAIR_LINK';
  }
  if (edge.edgeType === 'THROUGH_ROUTE' || edge.edgeCategory === 'THROUGH_ROUTE') {
    return 'THROUGH_ROUTE';
  }
  if (edge.edgeType === 'INTERCONTINENTAL_GATEWAY_ROUTE') {
    return 'INTERCONTINENTAL_GATEWAY_ROUTE';
  }
  if (edge.edgeType === 'PLANETARY_GATEWAY_ROUTE' || edge.edgeCategory === 'PLANETARY_GATEWAY') {
    if (edge.routeClass === 'ARCTIC_GATEWAY') return 'ARCTIC_GATEWAY';
    if (edge.routeClass === 'SPECIAL_FUTURE_CORRIDOR') return 'SPECIAL_FUTURE_CORRIDOR';
    return 'PLANETARY_GATEWAY';
  }
  if (edge.routeClass === 'ARCTIC_GATEWAY') return 'ARCTIC_GATEWAY';
  if (edge.routeClass === 'PLANETARY_GATEWAY') return 'PLANETARY_GATEWAY';
  if (
    edge.routeClass === 'CONTINENTAL_SPINE' ||
    edge.edgeCategory === 'CONTINENTAL_SPINE'
  ) {
    return 'CONTINENTAL_SPINE';
  }

  const infra = mapInfrastructureToVisualClass(edge);
  if (infra) return infra;

  return edge.routeClass || edge.edgeType || 'UNCLASSIFIED';
}

function styleForClass(routeClass) {
  return ROUTE_STYLE[routeClass] || ROUTE_STYLE.UNCLASSIFIED;
}

export function getRouteColor(routeClass, edge = {}) {
  const cls = resolveRouteClass({ ...edge, routeClass: routeClass || edge.routeClass });
  const constructionType = edge.constructionType;

  if (constructionType === CONSTRUCTION_TYPES.ARCTIC_ENGINEERING && !edge.tunnelRequired) {
    return ARCTIC_ENGINEERING_COLOR;
  }
  if (constructionType === CONSTRUCTION_TYPES.DESERT_CORRIDOR) {
    return DESERT_CORRIDOR_COLOR;
  }

  if (
    edge.tunnelRequired ||
    edge.tunnelType ||
    edge.constructionDifficulty === 'EXTREME' ||
    cls === 'TUNNEL_REQUIRED' ||
    cls === 'UNDERSEA_TUNNEL' ||
    cls === 'MOUNTAIN_TUNNEL' ||
    constructionType === CONSTRUCTION_TYPES.UNDERSEA_TUNNEL ||
    constructionType === CONSTRUCTION_TYPES.MOUNTAIN_TUNNEL ||
    constructionType === CONSTRUCTION_TYPES.URBAN_TUNNEL ||
    constructionType === CONSTRUCTION_TYPES.TUNNEL
  ) {
    if (constructionType === CONSTRUCTION_TYPES.UNDERSEA_TUNNEL || cls === 'UNDERSEA_TUNNEL') {
      return ROUTE_STYLE.UNDERSEA_TUNNEL.color;
    }
    if (constructionType === CONSTRUCTION_TYPES.MOUNTAIN_TUNNEL || cls === 'MOUNTAIN_TUNNEL') {
      return ROUTE_STYLE.MOUNTAIN_TUNNEL.color;
    }
    return TUNNEL_COLOR;
  }

  if (edge.edgeType === 'INTERCONTINENTAL_GATEWAY_ROUTE' && edge.tunnelRequired) {
    return TUNNEL_COLOR;
  }

  const key = cls;
  if (key && ROUTE_STYLE[key]) return ROUTE_STYLE[key].color;
  return styleForClass(cls).color;
}

export function getRouteWidth(routeClass, edge = {}) {
  const cls = resolveRouteClass({ ...edge, routeClass: routeClass || edge.routeClass });
  if (ROUTE_STYLE[cls]) return ROUTE_STYLE[cls].width;
  return styleForClass(cls).width;
}

export function getRouteDashPattern(routeClass, edge = {}) {
  const cls = resolveRouteClass({ ...edge, routeClass: routeClass || edge.routeClass });
  const constructionType = edge.constructionType;

  if (constructionType === CONSTRUCTION_TYPES.ARCTIC_ENGINEERING && !edge.tunnelRequired) {
    return ARCTIC_ENGINEERING_DASH;
  }
  if (constructionType === CONSTRUCTION_TYPES.DESERT_CORRIDOR) {
    return DESERT_CORRIDOR_DASH;
  }

  if (
    edge.tunnelRequired ||
    edge.tunnelType ||
    edge.constructionDifficulty === 'EXTREME' ||
    cls === 'TUNNEL_REQUIRED' ||
    cls === 'UNDERSEA_TUNNEL' ||
    cls === 'MOUNTAIN_TUNNEL' ||
    constructionType === CONSTRUCTION_TYPES.UNDERSEA_TUNNEL ||
    constructionType === CONSTRUCTION_TYPES.MOUNTAIN_TUNNEL ||
    constructionType === CONSTRUCTION_TYPES.URBAN_TUNNEL ||
    constructionType === CONSTRUCTION_TYPES.TUNNEL
  ) {
    if (constructionType === CONSTRUCTION_TYPES.UNDERSEA_TUNNEL || cls === 'UNDERSEA_TUNNEL') {
      return UNDERSEA_TUNNEL_DASH;
    }
    if (constructionType === CONSTRUCTION_TYPES.MOUNTAIN_TUNNEL || cls === 'MOUNTAIN_TUNNEL') {
      return MOUNTAIN_TUNNEL_DASH;
    }
    if (constructionType === CONSTRUCTION_TYPES.URBAN_TUNNEL) return URBAN_TUNNEL_DASH;
    return TUNNEL_DASH;
  }

  if (ROUTE_STYLE[cls]?.dash != null) return ROUTE_STYLE[cls].dash;
  return styleForClass(cls).dash;
}

export function getRouteOpacity(routeClass, edge = {}) {
  const color = getRouteColor(routeClass, edge);
  return color[3] != null ? color[3] / 255 : 1;
}

export function getRouteGlow(routeClass, edge = {}) {
  const cls = resolveRouteClass({ ...edge, routeClass: routeClass || edge.routeClass });
  return ROUTE_STYLE[cls]?.glow ?? 0;
}

export function getRouteRenderPriority(routeClass, edge = {}) {
  const cls = resolveRouteClass({ ...edge, routeClass: routeClass || edge.routeClass });

  switch (cls) {
    case 'CONNECTIVITY_REPAIR':
    case 'CONNECTIVITY_REPAIR_LINK':
      return 1;
    case 'FEEDER_BRANCH':
    case 'LOCAL_FEEDER':
    case 'RURAL_NETWORK':
      return 2;
    case 'REGIONAL_TRUNK':
    case 'REGIONAL_HYPERLOOP':
      return 3;
    case 'EXTENDED_HYPERLOOP':
    case 'CARGO_HYPERLOOP':
    case 'UNCLASSIFIED':
      return 4;
    case 'REMOTE_CARGO':
    case 'RESOURCE_CORRIDOR':
      return 5;
    case 'CRITICAL_MINERALS':
    case 'RARE_EARTH_RESOURCE':
      return 6;
    case 'ARCTIC_LOGISTICS':
    case 'RAINFOREST_ACCESS':
    case 'DESERT_LOGISTICS':
    case 'OUTBACK_RESOURCE':
    case 'ISLAND_ACCESS':
    case 'SPECIAL_FUTURE_CORRIDOR':
    case 'TUNNEL_REQUIRED':
    case 'UNDERSEA_TUNNEL':
    case 'MOUNTAIN_TUNNEL':
      return 7;
    case 'CONTINENTAL_SPINE':
    case 'INTERCONTINENTAL_HYPERLOOP':
    case 'INTERCONTINENTAL_GATEWAY_ROUTE':
    case 'PLANETARY_GATEWAY':
    case 'PLANETARY_GATEWAY_ROUTE':
    case 'ARCTIC_GATEWAY':
      return 8;
    case 'CONTINENTAL_SPINE':
      return 9;
    case 'THROUGH_ROUTE':
      return 10;
    default:
      return 4;
  }
}

export function partitionPathsByRenderPriority(paths = []) {
  const buckets = new Map();
  for (const path of paths) {
    const priority = getRouteRenderPriority(path.routeClass, path);
    if (!buckets.has(priority)) buckets.set(priority, []);
    buckets.get(priority).push({
      ...path,
      dashPattern: getRouteDashPattern(path.routeClass, path),
    });
  }
  return buckets;
}

export function pathUsesDashedLine(edge = {}) {
  const dash = getRouteDashPattern(edge.routeClass, edge);
  return Array.isArray(dash) && dash.length >= 2 && (dash[0] > 0 || dash[1] > 0);
}

export const ROUTE_CLASS_METRIC_LABELS = {
  STARSHIP_E2E_ARC: 'Starship',
  CONTINENTAL_SPINE: 'Continental Spine',
  REGIONAL_TRUNK: 'Regional Trunk',
  FEEDER_BRANCH: 'Feeder Branch',
  LOCAL_FEEDER: 'Local Feeder',
  REGIONAL_HYPERLOOP: 'Regional',
  EXTENDED_HYPERLOOP: 'Extended',
  THROUGH_ROUTE: 'Through',
  INTERCONTINENTAL_HYPERLOOP: 'Gateway',
  INTERCONTINENTAL_GATEWAY_ROUTE: 'Gateway',
  PLANETARY_GATEWAY: 'Planetary Gateway',
  PLANETARY_GATEWAY_ROUTE: 'Planetary Gateway',
  ARCTIC_GATEWAY: 'Arctic Gateway',
  UNDERSEA_TUNNEL: 'Undersea Tunnel',
  MOUNTAIN_TUNNEL: 'Mountain Tunnel',
  TUNNEL_REQUIRED: 'Tunnel',
  REMOTE_CARGO: 'Remote Cargo',
  CRITICAL_MINERALS: 'Critical Minerals',
  RARE_EARTH_RESOURCE: 'Rare Earth',
  ARCTIC_LOGISTICS: 'Arctic',
  RAINFOREST_ACCESS: 'Rainforest',
  DESERT_LOGISTICS: 'Desert',
  OUTBACK_RESOURCE: 'Outback',
  ISLAND_ACCESS: 'Island / Future',
  SPECIAL_FUTURE_CORRIDOR: 'Island / Future',
  CONNECTIVITY_REPAIR_LINK: 'Repair',
  CONNECTIVITY_REPAIR: 'Repair',
  CARGO_HYPERLOOP: 'Cargo',
  RESOURCE_CORRIDOR: 'Resource',
  RURAL_NETWORK: 'Rural',
};

export function countPathsByMetricLabel(paths = [], filterFn = () => true) {
  const counts = {};
  for (const path of paths) {
    if (!filterFn(path)) continue;
    const cls = resolveRouteClass(path);
    const label = ROUTE_CLASS_METRIC_LABELS[cls] || cls;
    counts[label] = (counts[label] || 0) + 1;
  }
  return counts;
}

export const PATH_DASH_RENDERING_ACTIVE = false;
