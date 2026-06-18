/**
 * City promotion paths — custom/parsed stay overlay-only until explicit user action.
 */

import { CITY_STATUS } from '../transportation/registries/cityStatus.js';
import { NODE_TYPES } from '../transportation/registries/nodeTypes.js';

export const PROMOTION_TARGETS = Object.freeze([
  { id: 'candidate_city', label: 'Candidate city', cityStatus: CITY_STATUS.CANDIDATE },
  { id: 'official_network_node', label: 'Official network node', cityStatus: CITY_STATUS.OFFICIAL },
  { id: 'e2e_hub', label: 'E2E hub', cityStatus: CITY_STATUS.OFFICIAL, nodeType: NODE_TYPES.E2E_HUB },
  { id: 'e2m_hub', label: 'RE2E / E2M hub', cityStatus: CITY_STATUS.OFFICIAL, nodeType: NODE_TYPES.E2M_HUB },
  { id: 'hyperloop_station', label: 'Hyperloop station', cityStatus: CITY_STATUS.OFFICIAL, nodeType: NODE_TYPES.HYPERLOOP_STATION },
  { id: 'feeder_city', label: 'Feeder city', cityStatus: CITY_STATUS.OFFICIAL, nodeType: NODE_TYPES.FEEDER_CITY },
]);

/**
 * @param {object} location
 * @returns {boolean}
 */
export function canShowPromotionShell(location) {
  const status = location?.cityStatus ?? location?.city_status;
  return status === CITY_STATUS.CUSTOM || status === CITY_STATUS.PARSED || status === 'custom_destination' || status === 'parsed_city';
}

/**
 * Promotion is not wired to graph mutation yet — UI-only guard.
 */
export function isPromotionImplemented() {
  return false;
}
