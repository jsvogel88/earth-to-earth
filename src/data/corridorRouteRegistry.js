/**
 * Phase 8 — corridor ownership + intercontinental bridge metadata.
 */

import routesRaw from './transport/routes.json';
import { inferCorridorId } from '../map/visualHierarchy.js';

/** Minimum viable intercontinental backbone (V10 validation). */
export const INTERCONTINENTAL_BRIDGE_ROUTES = {
  atlantic_bridge: 'route:e2e_starship:transatlantic-north',
  european_gulf_bridge: 'route:hyperloop:european-gulf-bridge',
  gulf_india_bridge: 'route:hyperloop:gulf-india-bridge',
  india_eastasia_bridge: 'route:hyperloop:india-eastasia-bridge',
};

const _routeMetaById = new Map();

for (const route of routesRaw) {
  if (route.corridorId || route.civilizationImportance != null) {
    _routeMetaById.set(route.id, {
      corridorId: route.corridorId,
      civilizationImportance:
        route.civilizationImportance ?? route.avgCorridorEconomicWeight ?? null,
    });
  }
}

/** Explicit corridor tags for spine routes that predate corridorId fields. */
const ROUTE_CORRIDOR_OVERRIDES = {
  'route:e2e_starship:transatlantic-north': { corridorId: 'atlantic_spine', civilizationImportance: 97 },
  'route:hyperloop:na-east-coast-spine': { corridorId: 'north_american_grid', civilizationImportance: 82 },
  'route:hyperloop:na-west-coast-spine': { corridorId: 'north_american_grid', civilizationImportance: 78 },
  'route:hyperloop:na-midwest': { corridorId: 'north_american_grid', civilizationImportance: 72 },
  'route:hyperloop:eu-western-spine': { corridorId: 'atlantic_spine', civilizationImportance: 80 },
  'route:hyperloop:eu-north-spine': { corridorId: 'eurasian_trunk', civilizationImportance: 70 },
  'route:hyperloop:mea-gulf-spine': { corridorId: 'gulf_india', civilizationImportance: 84 },
  'route:hyperloop:china-east-spine': { corridorId: 'east_asia_megaregion', civilizationImportance: 86 },
  'route:hyperloop:sea-mekong': { corridorId: 'pacific_spine', civilizationImportance: 75 },
  'route:hyperloop:japan-spine': { corridorId: 'pacific_spine', civilizationImportance: 78 },
  'route:hyperloop:africa-north-spine': { corridorId: 'african_spine', civilizationImportance: 76 },
  'route:hyperloop:africa-west-spine': { corridorId: 'african_spine', civilizationImportance: 72 },
  'route:hyperloop:africa-east-spine': { corridorId: 'african_spine', civilizationImportance: 70 },
  'route:hyperloop:sa-atlantic-spine': { corridorId: 'south_american', civilizationImportance: 74 },
  'route:hyperloop:sa-southern-cone': { corridorId: 'southern_cone', civilizationImportance: 68 },
  'route:e2e_starship:transpacific-north': { corridorId: 'pacific_spine', civilizationImportance: 90 },
  'route:e2e_starship:europe-asia-1': { corridorId: 'atlantic_spine', civilizationImportance: 85 },
  'route:e2e_starship:middle-east-sea': { corridorId: 'gulf_india', civilizationImportance: 82 },
};

for (const [id, meta] of Object.entries(ROUTE_CORRIDOR_OVERRIDES)) {
  _routeMetaById.set(id, meta);
}

/**
 * @param {{ id?: string, routeId?: string, fromNodeId?: string, toNodeId?: string, corridorId?: string, civilizationImportance?: number, avgCorridorEconomicWeight?: number, economicWeight?: object }} item
 * @returns {{ corridorId: string, civilizationImportance: number }}
 */
export function getCorridorMetadata(item) {
  const routeId = item?.routeId ?? item?.id;
  const fromMeta = routeId ? _routeMetaById.get(routeId) : null;
  const corridorId =
    item?.corridorId ?? fromMeta?.corridorId ?? inferCorridorId(item);
  const civilizationImportance =
    item?.civilizationImportance ??
    fromMeta?.civilizationImportance ??
    item?.avgCorridorEconomicWeight ??
    item?.economicWeight?.gdpGeometricMean ??
    item?.economicWeight?.corridorWeight ??
    50;
  return { corridorId, civilizationImportance: Number(civilizationImportance) || 50 };
}

/**
 * @param {object} route
 * @returns {object}
 */
export function enrichRouteRecord(route) {
  const meta = getCorridorMetadata(route);
  return { ...route, ...meta };
}

/**
 * @param {object} edge
 * @returns {object}
 */
export function enrichEdgeRecord(edge) {
  const meta = getCorridorMetadata(edge);
  return { ...edge, ...meta };
}
