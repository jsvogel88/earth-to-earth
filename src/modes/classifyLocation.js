/**
 * Location classification for the integrated transport grid.
 * Metadata only — no routes or graph mutation.
 */

export const E2E_POPULATION_THRESHOLD = 1_000_000;

const TRANSFER_HUB_MODE_THRESHOLD = 3;

/**
 * @param {object} city
 * @returns {number}
 */
function resolvePopulation(city) {
  const metro = city.metro_population ?? city.metroPopulation;
  const pop = city.population ?? city.pop;
  if (metro != null && metro > 0) return metro;
  if (pop != null && pop > 0) return pop;
  return 0;
}

/**
 * @param {object} city
 * @returns {boolean}
 */
function isE2EEligible(city) {
  if (city.manual_override?.e2e_eligible != null) {
    return Boolean(city.manual_override.e2e_eligible);
  }
  if (city.e2e_eligible != null && city.manual_override == null) {
    return Boolean(city.e2e_eligible);
  }
  return resolvePopulation(city) >= E2E_POPULATION_THRESHOLD;
}

/**
 * @param {object} location
 * @returns {string[]}
 */
export function getEnabledModes(location) {
  if (location?.enabledModes) return [...location.enabledModes];
  if (location?.mineral_hub_id || location?.e2m_enabled) {
    return ['auto', 'loop', 'e2m'];
  }
  const modes = ['auto', 'loop'];
  if (location?.e2e_eligible || location?.isE2EHub) modes.push('e2e');
  if (location?.hyperloop_connected) modes.push('hyperloop');
  return modes;
}

/**
 * @param {object} location
 * @returns {boolean}
 */
export function isTransferHub(location) {
  if (location?.transfer_hub === true) return true;
  return getEnabledModes(location).length >= TRANSFER_HUB_MODE_THRESHOLD;
}

/**
 * @param {object} city
 * @returns {object}
 */
export function classifyCity(city) {
  if (!city) return city;

  const population = city.population ?? city.pop;
  const metro_population = city.metro_population ?? city.metroPopulation;
  const auto_enabled = true;
  const loop_enabled = true;
  const e2e_eligible = isE2EEligible(city);

  const enabledModes = ['auto', 'loop'];
  if (e2e_eligible) enabledModes.push('e2e');
  if (city.hyperloop_connected) enabledModes.push('hyperloop');

  const nodeType = e2e_eligible ? 'e2e_hub' : 'city';

  return {
    ...city,
    auto_enabled,
    loop_enabled,
    e2e_eligible,
    isE2EHub: e2e_eligible,
    nodeType,
    enabledModes,
    transfer_hub: isTransferHub({ ...city, enabledModes }),
  };
}

/**
 * @param {object} hub
 * @returns {object}
 */
export function classifyMineralHub(hub) {
  if (!hub) return hub;

  const enabledModes = ['auto', 'loop', 'e2m'];

  return {
    ...hub,
    e2m_enabled: true,
    auto_enabled: true,
    loop_enabled: true,
    feeder_required: true,
    nodeType: 'mineral_hub',
    enabledModes,
    transfer_hub: isTransferHub({ ...hub, enabledModes }),
  };
}

/**
 * @param {object} location
 * @returns {object}
 */
export function classifyLocation(location) {
  if (!location) return location;
  if (location.mineral_hub_id || location.mineral_type) {
    return classifyMineralHub(location);
  }
  return classifyCity(location);
}
