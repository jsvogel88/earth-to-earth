/**
 * Curated network cities — coordinates and identity only.
 * Canonical IDs are defined here; classifications live in nodeClassification.js.
 * @deprecated Import from worldCities.js — this module re-exports for transition.
 */
export {
  networkCityId,
  CURATED_NETWORK_CITIES,
  getNetworkCityById,
  getNetworkCityByNameCountry,
  getActiveE2EHubCities,
  toMapHubRecord,
} from './worldCities.js';
