/**
 * Classify canonical routes/edges into render families for view + zoom filters.
 */

export const ROUTE_FAMILIES = {
  E2E_GLOBAL_ARC: 'E2E_GLOBAL_ARC',
  CONTINENTAL_SPINE: 'CONTINENTAL_SPINE',
  REGIONAL_LOOP: 'REGIONAL_LOOP',
  FEEDER_BRANCH: 'FEEDER_BRANCH',
  E2M_CARGO: 'E2M_CARGO',
  ROBOTAXI_LOCAL: 'ROBOTAXI_LOCAL',
};

/**
 * @param {{ mode?: string, routeType?: string, route_type?: string }} item
 * @returns {string}
 */
export function classifyRouteFamily(item) {
  const mode = item?.mode ?? '';
  const routeType = item?.routeType ?? item?.route_type ?? '';

  if (mode === 'e2e_starship') return ROUTE_FAMILIES.E2E_GLOBAL_ARC;

  if (
    mode === 'hyperloop' &&
    (routeType === 'continental_spine' ||
      routeType === 'global_spine' ||
      routeType === 'intercontinental_connector')
  ) {
    return ROUTE_FAMILIES.CONTINENTAL_SPINE;
  }

  if (
    mode === 'hyperloop' &&
    (routeType === 'branch' ||
      routeType === 'feeder' ||
      routeType === 'feeder_route' ||
      routeType === 'regional_feeder')
  ) {
    return ROUTE_FAMILIES.FEEDER_BRANCH;
  }

  if (
    mode === 'regional_loop' ||
    (mode === 'hyperloop' && routeType === 'regional_loop')
  ) {
    return ROUTE_FAMILIES.REGIONAL_LOOP;
  }

  const e2mRouteTypes = new Set([
    'cargo_spine',
    'orbital_logistics',
    'resource_corridor',
    'cargo_corridor',
    'mining_corridor',
    'energy_corridor',
    'port_connector',
    'cargo',
    'logistics',
    'resource',
    'industrial',
  ]);

  if (mode === 'e2m' || mode === 'cargo' || mode === 'logistics') {
    return ROUTE_FAMILIES.E2M_CARGO;
  }

  if (e2mRouteTypes.has(routeType) && mode !== 'hyperloop' && mode !== 'e2e_starship') {
    return ROUTE_FAMILIES.E2M_CARGO;
  }

  if (mode === 'robotaxi' || mode === 'autonomous_auto') {
    return ROUTE_FAMILIES.ROBOTAXI_LOCAL;
  }

  return ROUTE_FAMILIES.REGIONAL_LOOP;
}
