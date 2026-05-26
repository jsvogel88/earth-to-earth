/**
 * Save framework contracts — destinations, routes, scenarios, parsed sets.
 * Persistence via scenarioStorage (localStorage); export/share deferred.
 */

export {
  SCENARIO_STORAGE_KEY,
  PARSED_DESTINATION_SET_KEY,
  SCENARIO_SAVE_TYPES,
  loadScenarios,
  upsertScenario,
  deleteScenario,
  duplicateScenario,
  serializeScenario,
  deserializeScenario,
  saveParsedDestinationSet,
  loadParsedDestinationSets,
} from '../../utils/scenarioStorage.js';

export { useMapScenarios } from '../../hooks/useMapScenarios.js';

/**
 * @typedef {Object} SaveDestinationPayload
 * @property {string} worldCityId
 * @property {string} name
 * @property {number} lat
 * @property {number} lon
 * @property {string[]} [modeTags]
 * @property {string} [connectionMode]
 */

/**
 * @typedef {Object} SaveMapScenarioPayload
 * @property {string} name
 * @property {string} transportMode
 * @property {object} layerState
 * @property {object[]} [customDestinations]
 * @property {object[]} [parsedDestinationSets]
 * @property {number} [simulationYear]
 * @property {object} [viewport]
 */
