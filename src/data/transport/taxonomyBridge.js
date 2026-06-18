/**
 * taxonomyBridge.js
 * Maps Claude's canonical data model (v1.4.0) to the ChatGPT taxonomy.
 * Use this when consuming nodes/edges/routes from the transport dataset
 * and need to map to the app's taxonomy constants.
 */

import {
  TRANSPORTATION_MODES,
  NODE_TYPES,
  ROUTE_TYPES,
  CITY_STATUS,
} from '../../transportation/registries/index.js';

export const MODE_BRIDGE = {
  // Our canonical mode  → taxonomy mode(s)
  hyperloop:     [TRANSPORTATION_MODES.HYPERLOOP_SPINE, TRANSPORTATION_MODES.FEEDER_ROUTE], // distinguish by routeType
  regional_loop: [TRANSPORTATION_MODES.REGIONAL_LOOP],
  e2e_starship:  [TRANSPORTATION_MODES.E2E_STARSHIP],
  e2m:           [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.E2M, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.LOGISTICS],
  re2e:          [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.LOGISTICS],
  e2o:           [TRANSPORTATION_MODES.E2O],
  e2f:           [TRANSPORTATION_MODES.E2F],
  e2l:           [TRANSPORTATION_MODES.E2L],
  e2a:           [TRANSPORTATION_MODES.E2A],
  e2mars:        [TRANSPORTATION_MODES.E2MARS],
  petabond:      [TRANSPORTATION_MODES.PETABOND],
  port:          [TRANSPORTATION_MODES.PORT],
  robotaxi:      [TRANSPORTATION_MODES.ROBOTAXI],
  rail:          [TRANSPORTATION_MODES.RAIL],
};

export const NODE_TYPE_BRIDGE = {
  // Our nodeType        → taxonomy nodeType
  city:             NODE_TYPES.OFFICIAL_NETWORK_NODE,
  port:             NODE_TYPES.PORT_NODE,
  airport:          NODE_TYPES.AIRPORT_NODE,
  rail_terminal:    NODE_TYPES.RAIL_TERMINAL,
  energy_node:      NODE_TYPES.ENERGY_NODE,
  logistics_center: NODE_TYPES.LOGISTICS_NODE,
  mineral_node:     NODE_TYPES.MINERAL_NODE,
};

export const ROUTE_TYPE_BRIDGE = {
  // Our routeType          → taxonomy routeType
  global_backbone:      ROUTE_TYPES.GLOBAL_ARC,
  continental_spine:    ROUTE_TYPES.CONTINENTAL_SPINE,
  regional_loop:        ROUTE_TYPES.REGIONAL_LOOP,
  branch:               ROUTE_TYPES.FEEDER_ROUTE,
  feeder:               ROUTE_TYPES.FEEDER_ROUTE,
  cargo_spine:          ROUTE_TYPES.CARGO_CORRIDOR,
  resource_corridor:    ROUTE_TYPES.RESOURCE_CORRIDOR,
  regional_spine:       ROUTE_TYPES.MEGAREGION_SPINE,
  intercontinental_connector: ROUTE_TYPES.INTERCONTINENTAL_CONNECTOR,
};

export const CITY_STATUS_BRIDGE = {
  // worldCities.generated cityStatus → taxonomy nodeType
  transfer_hub:           NODE_TYPES.TRANSFER_HUB,
  official_network_node:  CITY_STATUS.OFFICIAL,
  candidate:              CITY_STATUS.CANDIDATE,
  feeder_candidate:       NODE_TYPES.FEEDER_CITY,
  planning_node:          CITY_STATUS.PLANNING,
  index_only:             CITY_STATUS.INDEX_ONLY,
  parsed_overlay:         CITY_STATUS.PARSED,
  custom_overlay:         CITY_STATUS.CUSTOM,
};

/**
 * Get taxonomy mode(s) for a given canonical edge or route.
 * Considers both mode and routeType for disambiguation.
 */
export function getTaxonomyMode(mode, routeType) {
  if (mode === 'hyperloop') {
    if (routeType === 'branch' || routeType === 'feeder') return TRANSPORTATION_MODES.FEEDER_ROUTE;
    return TRANSPORTATION_MODES.HYPERLOOP_SPINE;
  }
  return MODE_BRIDGE[mode] ? MODE_BRIDGE[mode][0] : mode;
}

/**
 * Get taxonomy nodeType from a canonical transport node.
 */
export function getTaxonomyNodeType(node) {
  if (node.isE2EHub) return NODE_TYPES.E2E_HUB;
  if (node.tags?.includes('transfer_hub')) return NODE_TYPES.TRANSFER_HUB;
  return NODE_TYPE_BRIDGE[node.nodeType] || NODE_TYPES.OFFICIAL_NETWORK_NODE;
}

/**
 * Get taxonomy routeType from a canonical route.
 */
export function getTaxonomyRouteType(route) {
  return ROUTE_TYPE_BRIDGE[route.routeType] || route.routeType;
}
