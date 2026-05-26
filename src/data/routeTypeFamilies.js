/**
 * Canonical routeType families for Grid / Loop view filtering.
 * Mode alone is insufficient (e.g. hyperloop + routeType branch).
 */

export const ROUTE_TYPE_FAMILIES = {
  REGIONAL_LOOP: [
    'regional_loop',
    'loop',
    'megaregion_loop',
    'metro_loop',
  ],
  FEEDER: [
    'branch',
    'feeder',
    'feeder_route',
    'regional_feeder',
    'local_connector',
  ],
  SPINE: [
    'continental_spine',
    'global_spine',
    'megaregion_spine',
    'intercontinental_connector',
    'global_backbone',
    'regional_spine',
  ],
  GRID_PATH: [
    'continental_spine',
    'global_spine',
    'megaregion_spine',
    'intercontinental_connector',
    'global_backbone',
    'regional_spine',
    'regional_loop',
    'loop',
    'megaregion_loop',
    'metro_loop',
    'branch',
    'feeder',
    'feeder_route',
    'regional_feeder',
    'local_connector',
  ],
};

const _familyLookup = new Map();
for (const [family, types] of Object.entries(ROUTE_TYPE_FAMILIES)) {
  for (const t of types) {
    _familyLookup.set(t, family);
  }
}

/**
 * @param {string | null | undefined} routeType
 * @returns {keyof typeof ROUTE_TYPE_FAMILIES | null}
 */
export function getRouteTypeFamily(routeType) {
  if (!routeType) return null;
  return _familyLookup.get(routeType) ?? null;
}

/**
 * @param {string | null | undefined} routeType
 * @param {keyof typeof ROUTE_TYPE_FAMILIES | keyof typeof ROUTE_TYPE_FAMILIES[]} family
 */
export function routeTypeInFamily(routeType, family) {
  const list = Array.isArray(family) ? family : [family];
  const types = list.flatMap((f) => ROUTE_TYPE_FAMILIES[f] ?? []);
  return types.includes(routeType);
}

/**
 * @param {{ routeType?: string, route_type?: string, mode?: string }} item
 * @param {keyof typeof ROUTE_TYPE_FAMILIES | (keyof typeof ROUTE_TYPE_FAMILIES)[]} families
 */
export function matchesRouteFamilies(item, families) {
  const rt = item?.routeType ?? item?.route_type;
  if (!rt) {
    if (families.includes('REGIONAL_LOOP') && item?.mode === 'regional_loop') return true;
    return false;
  }
  const list = Array.isArray(families) ? families : [families];
  return list.some((f) => routeTypeInFamily(rt, f));
}
