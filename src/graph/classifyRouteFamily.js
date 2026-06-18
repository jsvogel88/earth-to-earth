/**
 * Classify canonical routes/edges into render families for view + zoom filters.
 */

import { isFeederRouteType } from './feederRouteSemantics.js';

export const ROUTE_FAMILIES = {
  E2E_GLOBAL_ARC: 'E2E_GLOBAL_ARC',
  CONTINENTAL_SPINE: 'CONTINENTAL_SPINE',
  REGIONAL_LOOP: 'REGIONAL_LOOP',
  FEEDER_BRANCH: 'FEEDER_BRANCH',
  E2M_CARGO: 'E2M_CARGO',
  ROBOTAXI_LOCAL: 'ROBOTAXI_LOCAL',
  MULTIMODAL_GROUND: 'MULTIMODAL_GROUND',
  ENERGY_GRID: 'ENERGY_GRID',
  PLANNING_OVERLAY: 'PLANNING_OVERLAY',
};

/**
 * @param {{ mode?: string, routeType?: string, route_type?: string }} item
 * @returns {string}
 */
export function classifyRouteFamily(item) {
  const mode = item?.mode ?? '';
  const routeType = item?.routeType ?? item?.route_type ?? '';

  if (mode === 'e2e_starship' || mode === 'e2e') return ROUTE_FAMILIES.E2E_GLOBAL_ARC;

  if (
    mode === 'hyperloop' &&
    (routeType === 'continental_spine' ||
      routeType === 'global_spine' ||
      routeType === 'intercontinental_connector')
  ) {
    return ROUTE_FAMILIES.CONTINENTAL_SPINE;
  }

  if (mode === 'hyperloop' && isFeederRouteType(routeType)) {
    return ROUTE_FAMILIES.FEEDER_BRANCH;
  }

  if (
    mode === 'regional_loop' ||
    (mode === 'hyperloop' && routeType === 'regional_loop')
  ) {
    return ROUTE_FAMILIES.REGIONAL_LOOP;
  }

  const multimodalModes = new Set(['port', 'rail', 'road', 'air', 'airport']);
  const multimodalRouteTypes = new Set([
    'port_connector',
    'rail_connector',
    'road_connector',
    'airport_connector',
    'local_port_connector',
    'terminal_ground_connector',
    'short_logistics_feeder',
  ]);
  if (multimodalModes.has(mode) || multimodalRouteTypes.has(routeType)) {
    return ROUTE_FAMILIES.MULTIMODAL_GROUND;
  }

  if (mode === 'energy') {
    return ROUTE_FAMILIES.ENERGY_GRID;
  }

  const e2mRouteTypes = new Set([
    'cargo_spine',
    'orbital_logistics',
    'resource_corridor',
    'cargo_corridor',
    'mining_corridor',
    'energy_corridor',
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

  if (
    mode === 'planning' ||
    mode === 'custom' ||
    mode === 'parsed' ||
    routeType === 'planning_edge' ||
    routeType === 'custom_route' ||
    routeType === 'parsed_route'
  ) {
    return ROUTE_FAMILIES.PLANNING_OVERLAY;
  }

  return ROUTE_FAMILIES.REGIONAL_LOOP;
}
