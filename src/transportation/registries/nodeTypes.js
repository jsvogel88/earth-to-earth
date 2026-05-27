/**
 * Canonical taxonomy: node types.
 * Nodes may have multiple nodeTypes; keep strings stable.
 */
export const NODE_TYPES = {
  WORLD_CITY: 'world_city',
  CITY_INDEX_NODE: 'city_index_node',
  CANDIDATE_CITY: 'candidate_city',
  OFFICIAL_NETWORK_NODE: 'official_network_node',
  TRANSFER_HUB: 'transfer_hub',
  GLOBAL_HUB: 'global_hub',

  E2E_HUB: 'e2e_hub',
  E2E_LAUNCH_HUB: 'e2e_launch_hub',
  E2E_LANDING_HUB: 'e2e_landing_hub',
  E2E_CARGO_HUB: 'e2e_cargo_hub',
  E2E_FEEDER_NODE: 'e2e_feeder_node',

  SPINAL_HUB: 'spinal_hub',
  CONTINENTAL_GATEWAY: 'continental_gateway',
  REGIONAL_GATEWAY: 'regional_gateway',
  HYPERLOOP_STATION: 'hyperloop_station',
  HYPERLOOP_SPINE_HUB: 'hyperloop_spine_hub',
  REGIONAL_LOOP_STOP: 'regional_loop_stop',
  FEEDER_CITY: 'feeder_city',

  ROBOTAXI_ZONE: 'robotaxi_zone',
  AUTONOMOUS_AUTO_HUB: 'autonomous_auto_hub',
  LAST_MILE_NODE: 'last_mile_node',

  E2M_HUB: 'e2m_hub',
  RESOURCE_NODE: 'resource_node',
  MINERAL_NODE: 'mineral_node',
  ENERGY_NODE: 'energy_node',

  CARGO_HUB: 'cargo_hub',
  LOGISTICS_NODE: 'logistics_node',
  WAREHOUSE_NODE: 'warehouse_node',
  PORT_NODE: 'port_node',
  AIRPORT_NODE: 'airport_node',
  RAIL_TERMINAL: 'rail_terminal',
  ROAD_GATEWAY: 'road_gateway',

  INDUSTRIAL_NODE: 'industrial_node',
  MAINTENANCE_DEPOT: 'maintenance_depot',
  CHARGING_DEPOT: 'charging_depot',
  CONTROL_CENTER: 'control_center',
  CUSTOMS_NODE: 'customs_node',
  BORDER_GATEWAY: 'border_gateway',
  ISLAND_CONNECTOR: 'island_connector',
  REMOTE_HUB: 'remote_hub',
  STRATEGIC_NODE: 'strategic_node',
  CONSTRUCTION_CANDIDATE: 'construction_candidate',

  PLANNING_NODE: 'planning_node',
  CUSTOM_DESTINATION: 'custom_destination',
  PARSED_CITY: 'parsed_city',
  DEBUG_NODE: 'debug_node',
};

export const NODE_TYPE_IDS = new Set(Object.values(NODE_TYPES));

export function isNodeType(value) {
  return NODE_TYPE_IDS.has(value);
}

