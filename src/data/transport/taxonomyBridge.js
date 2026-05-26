/**
 * taxonomyBridge.js
 * Maps Claude's canonical data model (v1.4.0) to the ChatGPT taxonomy.
 * Use this when consuming nodes/edges/routes from the transport dataset
 * and need to map to the app's taxonomy constants.
 */

export const MODE_BRIDGE = {
  // Our canonical mode  → taxonomy mode(s)
  hyperloop:     ['hyperloop_spine', 'feeder_route'],   // distinguish by routeType
  regional_loop: ['regional_loop'],
  e2e_starship:  ['e2e_starship'],
  e2m:           ['e2m', 'cargo', 'logistics'],
  port:          ['port'],
  robotaxi:      ['robotaxi'],
  rail:          ['rail'],
};

export const NODE_TYPE_BRIDGE = {
  // Our nodeType        → taxonomy nodeType
  city:             'official_network_node',
  port:             'port_node',
  airport:          'airport_node',
  rail_terminal:    'rail_terminal',
  energy_node:      'energy_node',
  logistics_center: 'logistics_node',
  mineral_node:     'mineral_node',
};

export const ROUTE_TYPE_BRIDGE = {
  // Our routeType          → taxonomy routeType
  global_backbone:      'global_arc',
  continental_spine:    'continental_spine',
  regional_loop:        'regional_loop',
  branch:               'feeder_route',
  feeder:               'feeder_route',
  cargo_spine:          'cargo_corridor',
  resource_corridor:    'resource_corridor',
  regional_spine:       'megaregion_spine',
  intercontinental_connector: 'intercontinental_connector',
};

export const CITY_STATUS_BRIDGE = {
  // worldCities.generated cityStatus → taxonomy nodeType
  transfer_hub:           'transfer_hub',
  official_network_node:  'official_network_node',
  candidate:              'candidate_city',
  feeder_candidate:       'feeder_city',
  planning_node:          'planning_node',
  index_only:             'city_index_node',
  parsed_overlay:         'parsed_city',
  custom_overlay:         'custom_destination',
};

/**
 * Get taxonomy mode(s) for a given canonical edge or route.
 * Considers both mode and routeType for disambiguation.
 */
export function getTaxonomyMode(mode, routeType) {
  if (mode === 'hyperloop') {
    if (routeType === 'branch' || routeType === 'feeder') return 'feeder_route';
    return 'hyperloop_spine';
  }
  return MODE_BRIDGE[mode] ? MODE_BRIDGE[mode][0] : mode;
}

/**
 * Get taxonomy nodeType from a canonical transport node.
 */
export function getTaxonomyNodeType(node) {
  if (node.isE2EHub) return 'e2e_hub';
  if (node.tags?.includes('transfer_hub')) return 'transfer_hub';
  return NODE_TYPE_BRIDGE[node.nodeType] || 'official_network_node';
}

/**
 * Get taxonomy routeType from a canonical route.
 */
export function getTaxonomyRouteType(route) {
  return ROUTE_TYPE_BRIDGE[route.routeType] || route.routeType;
}
