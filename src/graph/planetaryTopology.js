/**
 * Phase 7D — macro corridor ownership, continuity, and planetary topology rules.
 */

import { getCorridorMetadata } from '../data/corridorRouteRegistry.js';
import { classifyRouteFamily, ROUTE_FAMILIES } from './classifyRouteFamily.js';
import { isPriorityE2EEdge } from '../map/visualHierarchy.js';

/** Macro civilization corridors — every planetary route must map to one. */
export const MACRO_CORRIDOR_IDS = new Set([
  'atlantic_spine',
  'north_american_grid',
  'european_continental',
  'pacific_spine',
  'pacific_rim',
  'eurasian_trunk',
  'gulf_india',
  'east_asia_megaregion',
  'african_spine',
  'south_american',
  'southern_cone',
  'andes_corridor',
]);

/** Spinal ownership classes visible at planetary zoom. */
export const PLANETARY_OWNERSHIP_CLASSES = new Set([
  'global_civilization_trunk',
  'continental_spine',
  'major_e2e_arc',
  'major_e2m_arc',
  'major_resource_corridor',
]);

const REGIONAL_TRUNK_ROUTE_IDS = new Set([
  'route:hyperloop:na-east-coast-spine',
  'route:hyperloop:na-west-coast-spine',
  'route:hyperloop:na-midwest',
  'route:hyperloop:eu-western-spine',
  'route:hyperloop:eu-north-spine',
  'route:hyperloop:mea-gulf-spine',
  'route:hyperloop:africa-north-spine',
  'route:hyperloop:africa-west-spine',
  'route:hyperloop:africa-east-spine',
  'route:hyperloop:sa-atlantic-spine',
  'route:hyperloop:sa-southern-cone',
  'route:hyperloop:china-east-spine',
  'route:hyperloop:sea-mekong',
  'route:hyperloop:japan-spine',
  'route:e2e_starship:transatlantic-north',
  'route:e2e_starship:transpacific-north',
]);

/**
 * @param {object} item
 * @returns {string}
 */
export function resolveMacroCorridorId(item) {
  const meta = getCorridorMetadata(item);
  const id = meta.corridorId ?? 'eurasian_trunk';
  if (MACRO_CORRIDOR_IDS.has(id)) return id;
  if (id === 'north_american_grid') return id;
  if (id === 'south_american') return id;
  return id;
}

/**
 * @param {object} item
 * @returns {string | null}
 */
export function getPlanetaryOwnershipClass(item) {
  const family = classifyRouteFamily(item);
  if (family === ROUTE_FAMILIES.E2E_GLOBAL_ARC) {
    return isPriorityE2EEdge(item) ? 'major_e2e_arc' : 'global_civilization_trunk';
  }
  if (family === ROUTE_FAMILIES.E2M_CARGO) return 'major_e2m_arc';
  if (family === ROUTE_FAMILIES.CONTINENTAL_SPINE) return 'continental_spine';
  const rt = String(item?.routeType ?? item?.route_type ?? '');
  if (rt.includes('resource') || rt.includes('mining')) return 'major_resource_corridor';
  return null;
}

/**
 * @param {object} item
 * @param {number} [zoom]
 * @returns {boolean}
 */
export function isCorridorOwnedForPlanetary(item, zoom = 2) {
  if (Number(zoom) >= 3) return true;
  const corridorId = resolveMacroCorridorId(item);
  if (!corridorId) return false;
  const ownership = getPlanetaryOwnershipClass(item);
  if (!ownership || !PLANETARY_OWNERSHIP_CLASSES.has(ownership)) return false;
  const imp =
    item?.civilizationImportance ??
    item?.economicWeight?.gdpGeometricMean ??
    item?.importance ??
    getCorridorMetadata(item).civilizationImportance ??
    0;
  if ((item?.tier ?? 2) > 1 && imp < 45) return false;
  if (ownership === 'major_e2m_arc' && imp < 8 && (item?.tier ?? 2) > 1) return false;
  return MACRO_CORRIDOR_IDS.has(corridorId) || corridorId === 'atlantic_spine';
}

/**
 * @param {object} route
 * @returns {string[]}
 */
export function resolveRouteNodeSequence(route) {
  return route?.nodeSequence ?? route?.nodeIds ?? [];
}

/**
 * @param {object} route
 * @returns {{ ok: boolean, reason?: string }}
 */
export function validateCorridorContinuity(route) {
  const seq = resolveRouteNodeSequence(route);
  if (seq.length < 2) {
    return { ok: false, reason: 'missing_nodeSequence' };
  }
  if (seq.length >= 2 && !route?.corridorId && !route?.name) {
    return { ok: false, reason: 'unnamed_corridor' };
  }
  return { ok: true };
}

/**
 * @param {object[]} routes
 * @returns {{ fragmented: object[], continuous: number }}
 */
export function detectFragmentedCorridors(routes = []) {
  const byCorridor = new Map();
  for (const route of routes) {
    const id = route?.corridorId ?? route?.routeId ?? route?.id;
    if (!id) continue;
    if (!byCorridor.has(id)) byCorridor.set(id, []);
    byCorridor.get(id).push(route);
  }
  const fragmented = [];
  for (const [corridorId, members] of byCorridor) {
    if (members.length > 1 && members.every((m) => resolveRouteNodeSequence(m).length <= 2)) {
      fragmented.push({ corridorId, segmentCount: members.length });
    }
  }
  return { fragmented, continuous: byCorridor.size - fragmented.length };
}

/**
 * @param {object[]} items
 * @param {number} zoom
 * @returns {object[]}
 */
export function filterUnownedPlanetaryRoutes(items, zoom) {
  const z = Number(zoom) || 2;
  if (z >= 3) return items ?? [];
  return (items ?? []).filter((item) => isCorridorOwnedForPlanetary(item, z));
}

/**
 * @param {object[]} items
 * @returns {Record<string, boolean>}
 */
export function regionalTrunkVisibility(items = []) {
  const regions = {
    africa: false,
    southAmerica: false,
    northAmerica: false,
    europe: false,
    asia: false,
  };
  for (const item of items) {
    const corridor = resolveMacroCorridorId(item);
    const routeId = item?.routeId ?? item?.id ?? '';
    if (corridor === 'african_spine' || routeId.includes('africa')) regions.africa = true;
    if (corridor === 'south_american' || corridor === 'southern_cone' || routeId.includes('sa-')) {
      regions.southAmerica = true;
    }
    if (corridor === 'north_american_grid' || routeId.includes('na-')) regions.northAmerica = true;
    if (corridor === 'atlantic_spine' || corridor === 'eurasian_trunk' || routeId.includes('eu-')) {
      regions.europe = true;
    }
    if (
      corridor === 'east_asia_megaregion' ||
      corridor === 'pacific_spine' ||
      routeId.includes('china') ||
      routeId.includes('japan')
    ) {
      regions.asia = true;
    }
    if (REGIONAL_TRUNK_ROUTE_IDS.has(routeId)) {
      if (routeId.includes('africa')) regions.africa = true;
      if (routeId.includes('sa-')) regions.southAmerica = true;
      if (routeId.includes('na-')) regions.northAmerica = true;
      if (routeId.includes('eu-')) regions.europe = true;
      if (routeId.includes('china') || routeId.includes('japan') || routeId.includes('sea-')) {
        regions.asia = true;
      }
    }
  }
  return regions;
}
