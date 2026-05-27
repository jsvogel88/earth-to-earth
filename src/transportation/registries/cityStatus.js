/**
 * Canonical taxonomy: city/node status lifecycle.
 */
export const CITY_STATUS = {
  INDEX_ONLY: 'city_index_node',
  CANDIDATE: 'candidate_city',
  OFFICIAL: 'official_network_node',
  CUSTOM: 'custom_destination',
  PARSED: 'parsed_city',
  PLANNING: 'planning_node',
  DEBUG: 'debug_node',
};

export const CITY_STATUS_IDS = new Set(Object.values(CITY_STATUS));

export function isCityStatus(value) {
  return CITY_STATUS_IDS.has(value);
}

