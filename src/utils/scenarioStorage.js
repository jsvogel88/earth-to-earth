/**
 * Map scenario persistence — localStorage, planning state only.
 */

export const SCENARIO_STORAGE_KEY = 'transport-map-map-scenarios-v1';
export const PARSED_DESTINATION_SET_KEY = 'transport-map-parsed-destination-sets-v1';

export const SCENARIO_SAVE_TYPES = {
  DESTINATION: 'destination',
  ROUTE: 'route',
  MAP: 'map',
  SCENARIO: 'scenario',
  PRESET_VIEW: 'preset_view',
  PARSED_DESTINATION_SET: 'parsed_destination_set',
};

/**
 * @typedef {Object} MapScenario
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {string} [transportMode]
 * @property {object} [layerState]
 * @property {object[]} [customDestinations]
 * @property {object[]} [parsedDestinationSets]
 * @property {number} [simulationYear]
 * @property {object} [viewport]
 * @property {string[]} [activeOverlayIds]
 */

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadScenarios() {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(SCENARIO_STORAGE_KEY);
  const list = safeParse(raw, []);
  return Array.isArray(list) ? list : [];
}

export function saveScenarios(scenarios) {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(scenarios));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {Partial<MapScenario>} scenario
 */
export function createScenarioRecord(scenario) {
  const now = Date.now();
  return {
    id: scenario.id || `scenario-${now}`,
    name: scenario.name || 'Untitled scenario',
    type: scenario.type || SCENARIO_SAVE_TYPES.SCENARIO,
    createdAt: scenario.createdAt ?? now,
    updatedAt: now,
    transportMode: scenario.transportMode,
    layerState: scenario.layerState,
    customDestinations: scenario.customDestinations,
    parsedDestinationSets: scenario.parsedDestinationSets,
    simulationYear: scenario.simulationYear,
    viewport: scenario.viewport,
    activeOverlayIds: scenario.activeOverlayIds,
  };
}

export function upsertScenario(scenario) {
  const list = loadScenarios();
  const idx = list.findIndex((s) => s.id === scenario.id);
  const record = { ...createScenarioRecord(scenario), updatedAt: Date.now() };
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  saveScenarios(list);
  return record;
}

export function deleteScenario(id) {
  const list = loadScenarios().filter((s) => s.id !== id);
  saveScenarios(list);
  return list;
}

export function duplicateScenario(id) {
  const source = loadScenarios().find((s) => s.id === id);
  if (!source) return null;
  const copy = createScenarioRecord({
    ...source,
    id: `scenario-${Date.now()}`,
    name: `${source.name} (copy)`,
    createdAt: Date.now(),
  });
  return upsertScenario(copy);
}

export function serializeScenario(scenario) {
  return JSON.stringify(scenario);
}

export function deserializeScenario(json) {
  const parsed = safeParse(json, null);
  if (!parsed || typeof parsed !== 'object') return null;
  if (!parsed.id || !parsed.name) return null;
  return parsed;
}

export function loadParsedDestinationSets() {
  if (typeof localStorage === 'undefined') return [];
  return safeParse(localStorage.getItem(PARSED_DESTINATION_SET_KEY), []);
}

export function saveParsedDestinationSet(set) {
  const list = loadParsedDestinationSets();
  const record = {
    id: set.id || `parsed-set-${Date.now()}`,
    name: set.name || 'Parsed destinations',
    cities: set.cities || [],
    modeTags: set.modeTags || [],
    connectionMode: set.connectionMode,
    createdAt: Date.now(),
  };
  list.push(record);
  try {
    localStorage.setItem(PARSED_DESTINATION_SET_KEY, JSON.stringify(list));
    return record;
  } catch {
    return null;
  }
}
