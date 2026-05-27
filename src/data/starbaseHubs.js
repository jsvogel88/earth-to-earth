import { normalizeCityKey } from './hyperloopPhase1Cities.js';
import { loadWorldCitiesEnrichedWithCoordinates } from './worldCities.js';

/**
 * Starbase Hub System — seed dataset (data-only).
 * These are strategic nodes (some conceptual). Do not imply conceptual hubs are real.
 */

export const STARBASE_PLANETS = {
  EARTH: 'EARTH',
  ORBIT: 'ORBIT',
  MOON: 'MOON',
  MARS: 'MARS',
  ASTEROID: 'ASTEROID',
  FUTURE: 'FUTURE',
};

export const STARBASE_STATUS = {
  ACTIVE: 'ACTIVE',
  CONCEPTUAL: 'CONCEPTUAL',
  FUTURE: 'FUTURE',
  MARS_FUTURE: 'MARS_FUTURE',
};

export const STARBASE_CLASSES = {
  PRIME: 'PRIME',
  PASSENGER: 'PASSENGER',
  INDUSTRIAL: 'INDUSTRIAL',
  RESOURCE: 'RESOURCE',
  ORBITAL: 'ORBITAL',
  FUELING: 'FUELING',
  ASTEROID: 'ASTEROID',
  LUNAR: 'LUNAR',
  MARS: 'MARS',
  PETABOND: 'PETABOND',
};

export const NETWORK_ROLES = [
  'E2E',
  'RE2E',
  'HYPERLOOP',
  'AUTO_FSD',
  'E2O',
  'E2F',
  'E2A',
  'E2L',
  'E2MARS',
  'MARS_HYPERLOOP',
  'PETABOND_EXPORT',
];

let _worldCityIndex = null;

function getWorldCityIndex() {
  if (_worldCityIndex) return _worldCityIndex;
  const idx = new Map();
  for (const c of loadWorldCitiesEnrichedWithCoordinates({ minPopulation: 0 })) {
    const key = normalizeCityKey(c.name);
    idx.set(key, { lat: c.latitude, lon: c.longitude });
  }
  _worldCityIndex = idx;
  return idx;
}

function withCoords(hub) {
  if (hub.coordinates?.length === 2) return hub;
  const idx = getWorldCityIndex();
  const key = hub.worldCityKey ?? (hub.worldCityName ? normalizeCityKey(hub.worldCityName) : null);
  const rec = key ? idx.get(key) : null;
  if (rec?.lat != null && rec.lon != null) {
    return { ...hub, coordinates: [rec.lon, rec.lat] };
  }
  return hub;
}

/** Minimal seed set ~35 hubs (Earth + placeholders). */
export const STARBASE_HUBS = [
  // ── Earth — Prime (some conceptual) ───────────────────────────────────────
  {
    id: 'starbase-texas',
    name: 'Starbase Texas',
    worldCityName: 'Brownsville',
    coordinates: [-97.3964, 25.9017],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.ACTIVE,
    starbaseClass: STARBASE_CLASSES.PRIME,
    hubRoles: ['E2E', 'RE2E', 'E2O', 'E2F', 'E2L', 'E2MARS', 'HYPERLOOP', 'AUTO_FSD', 'PETABOND_EXPORT'],
    notes: 'Primary launch + logistics hub (real-world).',
  },
  {
    id: 'cape-canaveral',
    name: 'Cape Canaveral / Florida Space Coast',
    worldCityName: 'Cape Canaveral',
    coordinates: [-80.6043, 28.3922],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.ACTIVE,
    starbaseClass: STARBASE_CLASSES.PRIME,
    hubRoles: ['E2O', 'E2F', 'E2L', 'E2MARS', 'RE2E', 'AUTO_FSD', 'PETABOND_EXPORT'],
    notes: 'Launch hub (real-world).',
  },
  {
    id: 'vandenberg',
    name: 'Vandenberg / California',
    worldCityName: 'Lompoc',
    coordinates: [-120.4579, 34.6391],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.ACTIVE,
    starbaseClass: STARBASE_CLASSES.PRIME,
    hubRoles: ['E2O', 'E2F', 'E2L', 'E2MARS', 'RE2E', 'AUTO_FSD', 'PETABOND_EXPORT'],
    notes: 'Launch hub (real-world).',
  },
  {
    id: 'dubai-spaceport-concept',
    name: 'Dubai / Abu Dhabi Spaceport (Concept)',
    worldCityName: 'Dubai',
    coordinates: [55.2708, 25.2048],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.CONCEPTUAL,
    starbaseClass: STARBASE_CLASSES.PRIME,
    hubRoles: ['E2E', 'RE2E', 'E2O', 'E2F', 'E2L', 'E2MARS', 'HYPERLOOP', 'AUTO_FSD'],
    notes: 'Conceptual hub — do not imply existing infrastructure.',
  },
  {
    id: 'singapore-spaceport-concept',
    name: 'Singapore Spaceport (Concept)',
    worldCityName: 'Singapore',
    coordinates: [103.8198, 1.3521],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.CONCEPTUAL,
    starbaseClass: STARBASE_CLASSES.PRIME,
    hubRoles: ['E2E', 'RE2E', 'E2O', 'E2F', 'E2L', 'E2MARS', 'HYPERLOOP', 'AUTO_FSD'],
    notes: 'Conceptual hub — do not imply existing infrastructure.',
  },
  {
    id: 'pilbara-industrial-space-hub',
    name: 'Australia / Pilbara Industrial Space Hub (Concept)',
    worldCityName: 'Port Hedland',
    coordinates: [118.581, -20.310],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.CONCEPTUAL,
    starbaseClass: STARBASE_CLASSES.INDUSTRIAL,
    hubRoles: ['RE2E', 'E2O', 'E2F', 'PETABOND_EXPORT'],
    notes: 'Industrial/resource hub concept anchored to Pilbara region.',
  },
  {
    id: 'saudi-industrial-corridor',
    name: 'Saudi Industrial Space Corridor (Concept)',
    worldCityName: 'Riyadh',
    coordinates: [46.6753, 24.7136],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.CONCEPTUAL,
    starbaseClass: STARBASE_CLASSES.INDUSTRIAL,
    hubRoles: ['RE2E', 'E2O', 'E2F', 'E2MARS', 'PETABOND_EXPORT'],
    notes: 'Industrial corridor concept.',
  },
  {
    id: 'texas-energy-corridor',
    name: 'Texas Energy Corridor',
    worldCityName: 'Houston',
    coordinates: [-95.3698, 29.7604],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.ACTIVE,
    starbaseClass: STARBASE_CLASSES.INDUSTRIAL,
    hubRoles: ['RE2E', 'HYPERLOOP', 'AUTO_FSD', 'PETABOND_EXPORT'],
    notes: 'Industrial + energy logistics anchor.',
  },

  // ── Earth — E2E passenger hubs (intermodal) ───────────────────────────────
  {
    id: 'e2e-new-york',
    name: 'New York',
    worldCityName: 'New York',
    coordinates: [-74.006, 40.7128],
    planet: STARBASE_PLANETS.EARTH,
    status: STARBASE_STATUS.ACTIVE,
    starbaseClass: STARBASE_CLASSES.PASSENGER,
    hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'],
  },
  { id: 'e2e-london', name: 'London', worldCityName: 'London', coordinates: [-0.1278, 51.5074], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },
  { id: 'e2e-dubai', name: 'Dubai', worldCityName: 'Dubai', coordinates: [55.2708, 25.2048], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },
  { id: 'e2e-singapore', name: 'Singapore', worldCityName: 'Singapore', coordinates: [103.8198, 1.3521], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },
  { id: 'e2e-tokyo', name: 'Tokyo', worldCityName: 'Tokyo', coordinates: [139.6503, 35.6762], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },
  { id: 'e2e-shanghai', name: 'Shanghai', worldCityName: 'Shanghai', coordinates: [121.4737, 31.2304], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },
  { id: 'e2e-hong-kong', name: 'Hong Kong', worldCityName: 'Hong Kong', coordinates: [114.1694, 22.3193], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },
  { id: 'e2e-los-angeles', name: 'Los Angeles', worldCityName: 'Los Angeles', coordinates: [-118.2437, 34.0522], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },
  { id: 'e2e-sao-paulo', name: 'São Paulo', worldCityName: 'São Paulo', coordinates: [-46.6333, -23.5505], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },
  { id: 'e2e-mumbai', name: 'Mumbai', worldCityName: 'Mumbai', coordinates: [72.8777, 19.0760], planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.PASSENGER, hubRoles: ['E2E', 'HYPERLOOP', 'AUTO_FSD', 'RE2E'] },

  // ── Earth — RE2E resource hubs (industrial) ───────────────────────────────
  { id: 're2e-pilbara', name: 'Pilbara', worldCityName: 'Port Hedland', planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.ACTIVE, starbaseClass: STARBASE_CLASSES.RESOURCE, hubRoles: ['RE2E'] },
  { id: 're2e-congo-copper-belt', name: 'Congo Copper Belt', worldCityName: 'Lubumbashi', planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.CONCEPTUAL, starbaseClass: STARBASE_CLASSES.RESOURCE, hubRoles: ['RE2E'] },
  { id: 're2e-norilsk', name: 'Norilsk', worldCityName: 'Norilsk', planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.CONCEPTUAL, starbaseClass: STARBASE_CLASSES.RESOURCE, hubRoles: ['RE2E'] },
  { id: 're2e-mongolia-rare-earth', name: 'Mongolia Rare Earth Belt', worldCityName: 'Hohhot', planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.CONCEPTUAL, starbaseClass: STARBASE_CLASSES.RESOURCE, hubRoles: ['RE2E'] },
  { id: 're2e-chile-lithium', name: 'Chile Lithium Corridor', worldCityName: 'Antofagasta', planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.CONCEPTUAL, starbaseClass: STARBASE_CLASSES.RESOURCE, hubRoles: ['RE2E'] },
  { id: 're2e-indonesia-nickel', name: 'Indonesia Nickel Belt', worldCityName: 'Makassar', planet: STARBASE_PLANETS.EARTH, status: STARBASE_STATUS.CONCEPTUAL, starbaseClass: STARBASE_CLASSES.RESOURCE, hubRoles: ['RE2E'] },

  // ── Orbit / Moon / Mars placeholders (data-model ready, minimal) ──────────
  { id: 'orbit-leo-depot-1', name: 'LEO Depot Alpha', planet: STARBASE_PLANETS.ORBIT, status: STARBASE_STATUS.FUTURE, starbaseClass: STARBASE_CLASSES.FUELING, coordinates: [0, 0], hubRoles: ['E2F', 'E2O'], notes: 'Placeholder: orbital depot (not geospatially meaningful on Earth map).' },
  { id: 'moon-gateway-1', name: 'Lunar Gateway (Concept)', planet: STARBASE_PLANETS.MOON, status: STARBASE_STATUS.FUTURE, starbaseClass: STARBASE_CLASSES.LUNAR, coordinates: [0, 0], hubRoles: ['E2L', 'E2F'], notes: 'Placeholder: lunar gateway.' },
  { id: 'mars-colony-alpha', name: 'Mars Colony Alpha', planet: STARBASE_PLANETS.MARS, status: STARBASE_STATUS.MARS_FUTURE, starbaseClass: STARBASE_CLASSES.MARS, coordinates: [0, 0], hubRoles: ['E2MARS', 'MARS_HYPERLOOP', 'PETABOND_EXPORT'], notes: 'Placeholder: Mars surface node.' },
  { id: 'mars-industrial-zone-1', name: 'Mars Industrial Zone One', planet: STARBASE_PLANETS.MARS, status: STARBASE_STATUS.MARS_FUTURE, starbaseClass: STARBASE_CLASSES.MARS, coordinates: [0, 0], hubRoles: ['MARS_HYPERLOOP', 'PETABOND_EXPORT'], notes: 'Placeholder: Mars industrial node.' },
];

function enrichHubMeta(hub) {
  const isEarth = hub.planet === STARBASE_PLANETS.EARTH;
  const coords = hub.coordinates;
  const lon = coords?.[0];
  const lat = coords?.[1];
  const isPlaceholderCoords =
    coords?.length === 2 && Math.abs(lat) < 0.01 && Math.abs(lon) < 0.01;
  const hasValidEarthCoords =
    isEarth &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    !isPlaceholderCoords;
  const realm = isEarth
    ? 'earth'
    : hub.planet === STARBASE_PLANETS.ORBIT
      ? 'orbital'
      : hub.planet === STARBASE_PLANETS.MOON
        ? 'lunar'
        : hub.planet === STARBASE_PLANETS.MARS
          ? 'mars'
          : 'offworld';

  return {
    ...hub,
    realm,
    nonEarth: !isEarth,
    orbital: hub.planet === STARBASE_PLANETS.ORBIT,
    lunar: hub.planet === STARBASE_PLANETS.MOON,
    mars: hub.planet === STARBASE_PLANETS.MARS,
    earthRenderable: hasValidEarthCoords,
  };
}

/** True when hub may appear on the 2D Earth map. */
export function isEarthRenderableHub(hub) {
  return enrichHubMeta(withCoords(hub)).earthRenderable;
}

export function isOffWorldHub(hub) {
  return enrichHubMeta(withCoords(hub)).nonEarth;
}

export function listStarbaseHubs() {
  return STARBASE_HUBS.map((h) => enrichHubMeta(withCoords(h)));
}

/** Earth map layer source — excludes orbit/moon/mars placeholders. */
export function listEarthStarbaseHubs() {
  return listStarbaseHubs().filter((h) => h.earthRenderable);
}

export function countOffWorldStarbaseHubs() {
  return listStarbaseHubs().filter((h) => h.nonEarth).length;
}

export function getStarbaseHubById(id) {
  return listStarbaseHubs().find((h) => h.id === id) ?? null;
}

export function getStarbaseHubsByRole(role) {
  return listStarbaseHubs().filter((h) => (h.hubRoles ?? []).includes(role));
}

export function getPetabondExportHubs() {
  return getStarbaseHubsByRole('PETABOND_EXPORT');
}

export function shouldRenderStarbaseAtZoom(hub, zoom) {
  const z = Number(zoom) || 2;
  if (!hub.earthRenderable && !isEarthRenderableHub(hub)) return false;
  if (z < 3) return hub.starbaseClass === STARBASE_CLASSES.PRIME || (hub.hubRoles ?? []).includes('E2E');
  if (z < 5) return hub.starbaseClass !== STARBASE_CLASSES.RESOURCE || hub.status !== STARBASE_STATUS.CONCEPTUAL;
  return true;
}

