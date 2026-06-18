/**
 * Canonical taxonomy: route/edge types.
 * Keep strings stable; use adapters for legacy data routeType fields.
 */
export const ROUTE_TYPES = {
  GLOBAL_ARC: 'global_arc',
  E2E_PASSENGER_ROUTE: 'e2e_passenger_route',
  E2E_CARGO_ROUTE: 'e2e_cargo_route',

  CONTINENTAL_SPINE: 'continental_spine',
  GLOBAL_SPINE: 'global_spine',
  INTERCONTINENTAL_CONNECTOR: 'intercontinental_connector',
  MEGAREGION_SPINE: 'megaregion_spine',
  REGIONAL_LOOP: 'regional_loop',
  FEEDER_ROUTE: 'feeder_route',

  LOCAL_CONNECTOR: 'local_connector',
  LAST_MILE: 'last_mile',

  CARGO_CORRIDOR: 'cargo_corridor',
  RESOURCE_CORRIDOR: 'resource_corridor',
  LOGISTICS_CORRIDOR: 'logistics_corridor',

  PORT_CONNECTOR: 'port_connector',
  AIRPORT_CONNECTOR: 'airport_connector',
  RAIL_CONNECTOR: 'rail_connector',
  ROAD_CONNECTOR: 'road_connector',
  ENERGY_CORRIDOR: 'energy_corridor',

  /** Planetary deployment package route (future-ready). */
  PETABOND_DEPLOYMENT: 'petabond_deployment',
  ORBITAL_LOGISTICS: 'orbital_logistics',
  LUNAR_LOGISTICS: 'lunar_logistics',
  MARS_TRANSFER: 'mars_transfer',

  PLANNING_EDGE: 'planning_edge',
  CUSTOM_ROUTE: 'custom_route',
  PARSED_ROUTE: 'parsed_route',
  DEBUG_EDGE: 'debug_edge',
};

export const ROUTE_TYPE_IDS = new Set(Object.values(ROUTE_TYPES));

export function isRouteType(value) {
  return ROUTE_TYPE_IDS.has(value);
}

