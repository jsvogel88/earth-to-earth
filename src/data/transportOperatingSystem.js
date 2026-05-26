/**
 * Planetary Transport Operating System — modes, layer taxonomy, presets.
 * No graph generation; configuration only.
 */

export const TRANSPORT_MODES = {
  E2E_STARSHIP: 'E2E Starship',
  E2M_ORBITAL: 'E2M Orbital Logistics',
  HYPERLOOP_CORE: 'Hyperloop Core Web',
  CIVILIZATION_GRID: 'Civilization Grid',
  ROBOTAXI: 'Robotaxi / Autonomous Mobility',
};

/** @deprecated Use TRANSPORT_MODES — kept for transition */
export const LEGACY_MODE_ALIASES = {
  'E2E Routes': TRANSPORT_MODES.E2E_STARSHIP,
  'Hyperloop Web': TRANSPORT_MODES.HYPERLOOP_CORE,
};

export const MAP_DISPLAY_MODES = Object.values(TRANSPORT_MODES);

export const DEFAULT_TRANSPORT_MODE = TRANSPORT_MODES.CIVILIZATION_GRID;

export function normalizeTransportMode(mode) {
  return LEGACY_MODE_ALIASES[mode] || mode || DEFAULT_TRANSPORT_MODE;
}

export function isHyperloopCoreMode(mode) {
  return normalizeTransportMode(mode) === TRANSPORT_MODES.HYPERLOOP_CORE;
}

export function isE2EStarshipMode(mode) {
  return normalizeTransportMode(mode) === TRANSPORT_MODES.E2E_STARSHIP;
}

export function isE2MOrbitalMode(mode) {
  return normalizeTransportMode(mode) === TRANSPORT_MODES.E2M_ORBITAL;
}

export function isCivilizationGridMode(mode) {
  return normalizeTransportMode(mode) === TRANSPORT_MODES.CIVILIZATION_GRID;
}

export function isRobotaxiMode(mode) {
  return normalizeTransportMode(mode) === TRANSPORT_MODES.ROBOTAXI;
}

export function getTransportModeLabel(mode) {
  return normalizeTransportMode(mode);
}

export const E2E_HUB_PRESETS_STORAGE_KEY = 'transport-map-e2e-hub-presets-v1';
export const E2E_ACTIVE_HUBS_STORAGE_KEY = 'transport-map-e2e-active-hubs-v1';

export const E2E_HUB_PRESET_BUILTINS = [
  { id: 'global-premium', name: 'Global Premium (default)', hubIds: null },
  { id: 'americas', name: 'Americas Focus', hubIds: null },
  { id: 'europe-mena', name: 'Europe / MENA Focus', hubIds: null },
];
