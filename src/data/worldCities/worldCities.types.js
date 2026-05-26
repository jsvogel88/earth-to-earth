/**
 * worldCities.types.js
 * Type definitions for the hardwired world city universe.
 */

/**
 * @typedef {Object} WorldCity
 * @property {string}   id                    - Stable ID: city:name-slug:country-slug:geonameid
 * @property {string}   name                  - Display name
 * @property {string}   normalizedName        - URL-safe slug
 * @property {string}   country               - Country name
 * @property {string}   normalizedCountry     - URL-safe slug
 * @property {string}   subcountry            - State/province
 * @property {string}   geonameid             - GeoNames ID
 * @property {number|null} latitude           - null if no coordinate data
 * @property {number|null} longitude          - null if no coordinate data
 * @property {number|null} population         - null if unknown
 * @property {number|null} rank               - rank in top-500 list if applicable
 * @property {CityStatus} cityStatus          - promotion level
 * @property {TransportRole[]} transportRoles - roles in transport system
 * @property {TransportMode[]} modes          - active transport modes
 * @property {string}   nodeType              - city|port|airport|rail_terminal|energy_node|logistics_center|mineral_node
 * @property {boolean}  hubCandidate          - in top-500 E2E hub list
 * @property {boolean}  e2eCandidate          - flagged as E2E candidate
 * @property {boolean}  isOfficialNetworkNode - in canonical transport nodes.json
 * @property {boolean}  isE2EHub              - one of 31 curated E2E hubs
 * @property {string|null} transportNodeId    - canonical node ID if promoted
 * @property {boolean}  isDuplicate           - duplicate city+country in GeoNames
 * @property {boolean}  isCustomDestination   - user-added overlay
 * @property {boolean}  isParsedDestination   - added via paste/parser
 * @property {string}   dataSource            - source file
 * @property {string|null} coordinateSource   - where coords came from
 * @property {Confidence} confidence          - data quality
 * @property {boolean}  hasCoordinates        - lat/lon are non-null
 */

/**
 * @typedef {'index_only'|'candidate'|'feeder_candidate'|'parsed_overlay'|
 *           'custom_overlay'|'planning_node'|'official_network_node'|'transfer_hub'} CityStatus
 *
 * Promotion path:
 *   index_only → candidate → feeder_candidate → planning_node → official_network_node → transfer_hub
 */

/**
 * @typedef {'e2e_hub'|'e2e_candidate'|'hyperloop_spine_hub'|'hyperloop_station'|
 *           'regional_loop_stop'|'feeder_city'|'robotaxi_zone'|'e2m_hub'|
 *           'resource_node'|'cargo_hub'|'port'|'airport'|'rail_terminal'|
 *           'logistics_node'|'energy_node'|'construction_candidate'|
 *           'strategic_node'|'custom_destination'|'parsed_destination'} TransportRole
 */

/**
 * @typedef {'e2e_starship'|'hyperloop'|'regional_loop'|'feeder'|'robotaxi'|
 *           'e2m'|'rail'|'road'|'port'|'air'|'grid'|'custom'|'planning'} TransportMode
 */

/**
 * @typedef {'high'|'medium'|'low'} Confidence
 */

export const CITY_STATUS_PROMOTION_PATH = [
  'index_only',
  'candidate',
  'feeder_candidate',
  'planning_node',
  'official_network_node',
  'transfer_hub',
];

export const TRANSPORT_ROLES = [
  'e2e_hub','e2e_candidate','hyperloop_spine_hub','hyperloop_station',
  'regional_loop_stop','feeder_city','robotaxi_zone','e2m_hub',
  'resource_node','cargo_hub','port','airport','rail_terminal',
  'logistics_node','energy_node','construction_candidate',
  'strategic_node','custom_destination','parsed_destination',
];

export const TRANSPORT_MODES = [
  'e2e_starship','hyperloop','regional_loop','feeder',
  'robotaxi','e2m','rail','road','port','air','grid','custom','planning',
];
