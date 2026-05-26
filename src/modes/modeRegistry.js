/**
 * Canonical integrated transport mode registry (internal).
 * Maps later into layerRegistry.js + transportModeRegistry.js — do not replace those yet.
 */

/** @typedef {'overlayOnly'|'routes'|'nodesOnly'|'none'} GraphBehavior */

/**
 * @typedef {Object} ModeDefinition
 * @property {string} mode_id
 * @property {string} label
 * @property {string} color
 * @property {boolean} defaultVisibility
 * @property {string[]} nodeTypes
 * @property {string[]} routeTypes
 * @property {{ min: number, max: number }} zoomVisibility
 * @property {GraphBehavior} graphBehavior
 * @property {boolean} [defaultForCities]
 * @property {string} [eligibilityRule]
 */

/** @type {Record<string, ModeDefinition>} */
export const MODE_REGISTRY = {
  auto: {
    mode_id: 'auto',
    label: 'Auto',
    color: '#7dff9a',
    defaultVisibility: true,
    defaultForCities: true,
    nodeTypes: ['city', 'e2e_hub', 'e2m_hub', 'transfer_hub'],
    routeTypes: ['local', 'last_mile'],
    zoomVisibility: { min: 10, max: 22 },
    graphBehavior: 'overlayOnly',
  },
  loop: {
    mode_id: 'loop',
    label: 'Loop',
    color: '#00dcff',
    defaultVisibility: true,
    defaultForCities: true,
    nodeTypes: ['city', 'e2e_hub', 'e2m_hub', 'transfer_hub'],
    routeTypes: ['urban', 'regional'],
    zoomVisibility: { min: 6, max: 22 },
    graphBehavior: 'routes',
  },
  e2e: {
    mode_id: 'e2e',
    label: 'E2E',
    color: '#d4af37',
    defaultVisibility: true,
    eligibilityRule: 'population >= 1000000',
    nodeTypes: ['city', 'e2e_hub'],
    routeTypes: ['global'],
    zoomVisibility: { min: 0, max: 22 },
    graphBehavior: 'routes',
  },
  e2m: {
    mode_id: 'e2m',
    label: 'E2M',
    color: '#ff6b35',
    defaultVisibility: true,
    eligibilityRule: 'e2m_enabled === true',
    nodeTypes: ['mineral_hub', 'industrial_hub'],
    routeTypes: ['industrial', 'feeder', 'resource'],
    zoomVisibility: { min: 2, max: 22 },
    graphBehavior: 'routes',
  },
  hyperloop: {
    mode_id: 'hyperloop',
    label: 'Hyperloop / Tube / Rail',
    color: '#00dcff',
    defaultVisibility: true,
    nodeTypes: ['city', 'transfer_hub', 'industrial_hub', 'e2e_hub'],
    routeTypes: ['trunk', 'regional', 'feeder'],
    zoomVisibility: { min: 0, max: 22 },
    graphBehavior: 'routes',
  },
};

export const MODE_IDS = Object.keys(MODE_REGISTRY);

/** @param {string} modeId */
export function getModeDefinition(modeId) {
  return MODE_REGISTRY[modeId] ?? null;
}

export function listModes() {
  return MODE_IDS.map((id) => MODE_REGISTRY[id]);
}
