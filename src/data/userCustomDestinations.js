/**
 * User custom destinations — planning overlay only (not canonical graph nodes).
 */

import { networkCityId } from './worldCities.js';
import { CONNECTION_MODES } from './customDestinationConstants.js';

export { CONNECTION_MODES };

export const CUSTOM_DESTINATION_ROLES = {
  CUSTOM_E2E_CANDIDATE: 'Custom E2E Candidate',
  CUSTOM_HYPERLOOP_STOP: 'Custom Hyperloop Stop',
  CUSTOM_REGIONAL_HUB: 'Custom Regional Hub',
  CUSTOM_FEEDER_CITY: 'Custom Feeder City',
  CUSTOM_RARE_EARTH_CARGO: 'Custom Rare Earth / Cargo Hub',
  CUSTOM_E2M_CANDIDATE: 'Custom E2M Candidate',
  CUSTOM_ROBOTAXI_ZONE: 'Custom Robotaxi Service Zone',
};

/** Layer tags for filtering map visibility (not graph edges). */
export const CUSTOM_LAYER_TAGS = {
  E2E: 'e2e',
  HYPERLOOP: 'hyperloop',
  CIVILIZATION: 'civilization',
  CARGO: 'cargo',
  E2M: 'e2m',
  ROBOTAXI: 'robotaxi',
};

export const ROLE_COLORS = {
  [CUSTOM_DESTINATION_ROLES.CUSTOM_E2E_CANDIDATE]: [255, 220, 100, 235],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_HYPERLOOP_STOP]: [100, 200, 255, 230],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_REGIONAL_HUB]: [0, 210, 230, 225],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_FEEDER_CITY]: [120, 255, 180, 220],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_RARE_EARTH_CARGO]: [255, 200, 60, 225],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_E2M_CANDIDATE]: [210, 160, 80, 225],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_ROBOTAXI_ZONE]: [180, 255, 140, 225],
};

const ROLE_TO_LAYERS = {
  [CUSTOM_DESTINATION_ROLES.CUSTOM_E2E_CANDIDATE]: [CUSTOM_LAYER_TAGS.E2E],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_HYPERLOOP_STOP]: [CUSTOM_LAYER_TAGS.HYPERLOOP],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_REGIONAL_HUB]: [
    CUSTOM_LAYER_TAGS.HYPERLOOP,
    CUSTOM_LAYER_TAGS.E2E,
  ],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_FEEDER_CITY]: [CUSTOM_LAYER_TAGS.HYPERLOOP],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_RARE_EARTH_CARGO]: [CUSTOM_LAYER_TAGS.CARGO],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_E2M_CANDIDATE]: [CUSTOM_LAYER_TAGS.E2M],
  [CUSTOM_DESTINATION_ROLES.CUSTOM_ROBOTAXI_ZONE]: [CUSTOM_LAYER_TAGS.ROBOTAXI],
};

/**
 * @typedef {Object} UserCustomDestination
 * @property {string} id
 * @property {string} worldCityId
 * @property {string} name
 * @property {string} country
 * @property {number} lat
 * @property {number} lon
 * @property {number|null} population
 * @property {string} selectedRole
 * @property {string[]} enabledLayers
 * @property {string} connectionMode
 * @property {string|null} [manualHubId]
 * @property {string} [manualHubName]
 * @property {string} customNotes
 * @property {boolean} userAdded
 * @property {string} createdAt
 */

export function defaultEnabledLayersForRole(role) {
  return [...(ROLE_TO_LAYERS[role] || [CUSTOM_LAYER_TAGS.CIVILIZATION])];
}

/**
 * @param {object} city — search result or world city record
 * @param {object} options
 * @returns {UserCustomDestination}
 */
export function createCustomDestinationFromCity(city, options = {}) {
  const name = city.name || '';
  const country = city.country || '';
  const wId = city.worldCityId || networkCityId(name, country);
  const role = options.selectedRole || CUSTOM_DESTINATION_ROLES.CUSTOM_E2E_CANDIDATE;
  const lat = city.latitude ?? city.lat;
  const lon = city.longitude ?? city.lon;

  return {
    id: options.id || `custom-${wId}-${Date.now()}`,
    worldCityId: wId,
    name,
    country,
    lat,
    lon,
    population: city.population ?? null,
    selectedRole: role,
    enabledLayers: options.enabledLayers || defaultEnabledLayersForRole(role),
    connectionMode: options.connectionMode || CONNECTION_MODES.NONE,
    manualHubId: options.manualHubId ?? null,
    manualHubName: options.manualHubName ?? null,
    customNotes: options.customNotes || '',
    userAdded: true,
    createdAt: options.createdAt || new Date().toISOString(),
  };
}

export function getRoleColor(role) {
  return ROLE_COLORS[role] || [200, 180, 255, 210];
}

/** Deck.gl map point — no route geometry. */
export function toCustomDestinationMapPoint(dest) {
  return {
    ...dest,
    renderable: dest.lat != null && dest.lon != null,
    userAddedBadge: true,
    planningOnly: true,
  };
}

export function roleOptionsForSelect() {
  return Object.entries(CUSTOM_DESTINATION_ROLES).map(([value, label]) => ({
    value: label,
    label,
  }));
}

export function layerTagOptionsForSelect() {
  return [
    { id: CUSTOM_LAYER_TAGS.E2E, label: 'E2E Candidates' },
    { id: CUSTOM_LAYER_TAGS.HYPERLOOP, label: 'Hyperloop Planning' },
    { id: CUSTOM_LAYER_TAGS.CIVILIZATION, label: 'Civilization Grid' },
    { id: CUSTOM_LAYER_TAGS.CARGO, label: 'Rare Earth / Cargo' },
    { id: CUSTOM_LAYER_TAGS.E2M, label: 'E2M' },
    { id: CUSTOM_LAYER_TAGS.ROBOTAXI, label: 'Robotaxi' },
  ];
}

export function connectionModeOptionsForSelect() {
  return [
    { value: CONNECTION_MODES.NONE, label: 'No connection (default)' },
    { value: CONNECTION_MODES.NEAREST_TRUNK, label: 'Attach to nearest trunk (planning)' },
    { value: CONNECTION_MODES.NEAREST_REGIONAL_HUB, label: 'Attach to nearest regional hub' },
    { value: CONNECTION_MODES.MANUAL_HUB, label: 'Attach to selected hub manually' },
  ];
}

const LAYER_TAG_LABELS = {
  [CUSTOM_LAYER_TAGS.E2E]: 'E2E',
  [CUSTOM_LAYER_TAGS.HYPERLOOP]: 'Hyperloop',
  [CUSTOM_LAYER_TAGS.CIVILIZATION]: 'Civ Grid',
  [CUSTOM_LAYER_TAGS.CARGO]: 'Cargo',
  [CUSTOM_LAYER_TAGS.E2M]: 'E2M',
  [CUSTOM_LAYER_TAGS.ROBOTAXI]: 'Robotaxi',
};

export function formatLayerTagLabel(tag) {
  return LAYER_TAG_LABELS[tag] || tag;
}

export function formatConnectionModeLabel(mode) {
  if (mode === CONNECTION_MODES.NONE) return 'No connection';
  if (mode === CONNECTION_MODES.NEAREST_TRUNK) return 'Nearest trunk';
  if (mode === CONNECTION_MODES.NEAREST_REGIONAL_HUB) return 'Nearest regional hub';
  if (mode === CONNECTION_MODES.MANUAL_HUB) return 'Manual hub (pending)';
  return mode;
}

/** Visual constants for deck overlay (distinct from official E2E/trunk hubs). */
export const CUSTOM_DESTINATION_MAP_STYLE = {
  haloColor: [255, 100, 255, 90],
  haloRadius: 16,
  markerRadius: 9,
  lineColor: [255, 160, 255, 255],
  lineWidth: 3,
  labelPrefix: 'Custom: ',
};

/**
 * Heuristic role/layer suggestions for search result cards (planning only).
 * @param {object} city
 */
export function suggestRoleAndLayersForCity(city) {
  const pop = city.population ?? 0;
  const continent = city.continent || '';
  const badges = [];
  let role = CUSTOM_DESTINATION_ROLES.CUSTOM_FEEDER_CITY;
  let layers = defaultEnabledLayersForRole(role);

  const coastal =
    ['North America', 'Europe', 'Asia', 'Oceania'].includes(continent) && pop >= 200_000;
  const remote = continent === 'Africa' || continent === 'Oceania';
  const cargoCandidate = remote || pop < 500_000;

  if (pop >= 1_000_000) {
    role = CUSTOM_DESTINATION_ROLES.CUSTOM_E2E_CANDIDATE;
    badges.push('1M+', 'E2E');
  } else if (coastal) {
    role = CUSTOM_DESTINATION_ROLES.CUSTOM_E2M_CANDIDATE;
    badges.push('E2M coastal');
  } else if (cargoCandidate && pop < 1_000_000) {
    role = CUSTOM_DESTINATION_ROLES.CUSTOM_RARE_EARTH_CARGO;
    badges.push('Cargo / remote');
  } else if (pop >= 500_000) {
    role = CUSTOM_DESTINATION_ROLES.CUSTOM_HYPERLOOP_STOP;
    badges.push('Hyperloop');
  } else {
    badges.push('Feeder');
  }

  layers = defaultEnabledLayersForRole(role);
  layers.forEach((t) => {
    const label = formatLayerTagLabel(t);
    if (!badges.includes(label)) badges.push(label);
  });

  return { role, layers, badges };
}

export function formatPopulation(pop) {
  if (pop == null || !Number.isFinite(pop)) return null;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${Math.round(pop / 1000)}k`;
  return String(pop);
}

export function formatCoordinates(lat, lon) {
  if (lat == null || lon == null) return null;
  return `${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°`;
}
