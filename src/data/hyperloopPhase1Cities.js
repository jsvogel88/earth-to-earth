import { regionalFeederCitiesByHub } from './regionalFeederCities.js';
import {
  hyperloopContinentalCorridors,
  PHASE1_E2E_HUB_NAMES,
} from './hyperloopContinentalCorridors.js';
import { PHASE1_MANUAL_COORDS, normalizeCityKey } from './hyperloopPhase1Coordinates.js';
import { networkCityId } from './worldCities.js';

export { normalizeCityKey };

/** Canonical graph node ID — aliases worldCities.networkCityId */
export function normalizeNodeId(name, country = '') {
  return networkCityId(name, country);
}

const CITY_ALIASES = {
  'washington dc': 'washington, dc',
  'washington, dc': 'washington, dc',
  'sao paulo': 'são paulo',
  'neom / oxagon': 'neom / oxagon',
  bengaluru: 'Bangalore',
  bangalore: 'Bangalore',
  bombay: 'Mumbai',
  calcutta: 'Kolkata',
  rangoon: 'Yangon',
  saigon: 'Ho Chi Minh City',
};

function resolveCoordKey(name) {
  const key = normalizeCityKey(name);
  return CITY_ALIASES[key] || key;
}

/** Canonical display name for graph node identity (aliases → registry name). */
export function resolveCanonicalCityName(name) {
  const key = normalizeCityKey(name);
  const alias = CITY_ALIASES[key];
  if (alias) return alias;
  return name;
}

/** Build coordinate registry from feeders, manual entries, and ROI hubs */
export function buildPhase1CoordinateRegistry(roiHubs = []) {
  const registry = new Map();

  const register = (name, entry) => {
    if (!name || !entry) return;
    const key = resolveCoordKey(name);
    if (
      typeof entry.lat !== 'number' ||
      !Number.isFinite(entry.lat) ||
      typeof entry.lon !== 'number' ||
      !Number.isFinite(entry.lon)
    ) {
      return;
    }
    if (!registry.has(key)) {
      registry.set(key, { ...entry, name });
    }
  };

  Object.entries(PHASE1_MANUAL_COORDS).forEach(([key, entry]) => {
    register(entry.name || key, entry);
  });

  Object.values(regionalFeederCitiesByHub).forEach((hubCorridors) => {
    Object.values(hubCorridors).forEach((cities) => {
      if (!Array.isArray(cities)) return;
      cities.forEach((city) => {
        register(city.name, {
          lat: city.lat,
          lon: city.lon,
          country: city.country,
          continent: inferContinentFromCountry(city.country),
        });
      });
    });
  });

  roiHubs.forEach((hub) => {
    register(hub.name, {
      lat: hub.lat,
      lon: hub.lon,
      country: hub.country,
      continent: inferContinentFromCountry(hub.country),
    });
  });

  return registry;
}

function inferContinentFromCountry(country) {
  const c = String(country || '').toLowerCase();
  if (['usa', 'canada', 'mexico'].some((x) => c.includes(x))) return 'North America';
  if (['uk', 'france', 'germany', 'netherlands', 'belgium', 'spain', 'italy', 'turkey'].some((x) => c.includes(x))) {
    return 'Europe';
  }
  if (['israel', 'uae', 'saudi', 'jordan', 'lebanon', 'syria', 'iraq', 'iran', 'egypt'].some((x) => c.includes(x))) {
    return 'Middle East';
  }
  if (['india', 'pakistan', 'bangladesh', 'sri lanka'].some((x) => c.includes(x))) return 'South Asia';
  if (['china', 'japan', 'korea', 'hong kong', 'taiwan'].some((x) => c.includes(x))) return 'East Asia';
  if (['singapore', 'thailand', 'vietnam', 'indonesia', 'malaysia', 'philippines'].some((x) => c.includes(x))) {
    return 'Southeast Asia';
  }
  if (['brazil', 'argentina', 'chile', 'colombia', 'peru'].some((x) => c.includes(x))) return 'South America';
  if (['nigeria', 'south africa', 'kenya', 'ghana'].some((x) => c.includes(x))) return 'Africa';
  if (['australia', 'new zealand'].some((x) => c.includes(x))) return 'Oceania';
  return 'Unknown';
}

const E2E_SET = new Set(PHASE1_E2E_HUB_NAMES.map((n) => normalizeCityKey(n)));

/**
 * Phase 1 city index from corridor node names + coordinate registry.
 */
export function buildPhase1CityIndex(roiHubs = []) {
  const coordRegistry = buildPhase1CoordinateRegistry(roiHubs);
  const cityMap = new Map();

  hyperloopContinentalCorridors.forEach((corridorDef) => {
    corridorDef.nodes.forEach((nodeName, index) => {
      const key = resolveCoordKey(nodeName);
      const coords = coordRegistry.get(key);
      const isE2E = E2E_SET.has(key) || corridorDef.e2eAnchors?.includes(nodeName);
      const isPrimaryHub = corridorDef.primaryE2EHub === nodeName;
      const isSwitch =
        !isE2E &&
        (index > 0 && index < corridorDef.nodes.length - 1) &&
        corridorDef.nodes.length > 3;

      const existing = cityMap.get(key);
      const corridors = new Set(existing?.corridors || []);
      corridors.add(corridorDef.corridor);

      const nearestE2EHubs = new Set(existing?.nearestE2EHubs || []);
      if (corridorDef.primaryE2EHub) nearestE2EHubs.add(corridorDef.primaryE2EHub);
      corridorDef.e2eAnchors?.forEach((h) => nearestE2EHubs.add(h));

      cityMap.set(key, {
        name: nodeName,
        country: coords?.country || existing?.country || '',
        continent: corridorDef.continent || coords?.continent || existing?.continent,
        phase: 1,
        nodeType: isE2E
          ? 'GLOBAL_STARSHIP_HUB'
          : isSwitch
            ? 'SWITCH_TRANSFER_NODE'
            : isPrimaryHub
              ? 'CONTINENTAL_HYPERLOOP_HUB'
              : 'FEEDER_CITY',
        parentE2EHub: corridorDef.primaryE2EHub,
        nearestE2EHubs: [...nearestE2EHubs],
        primaryCorridor: existing?.primaryCorridor || corridorDef.corridor,
        alternateCorridors: [...corridors],
        corridors: [...corridors],
        isE2EHub: isE2E,
        isSwitchNode: isSwitch || existing?.isSwitchNode,
        allowsSplitOff: true,
        lat: coords?.lat ?? existing?.lat ?? null,
        lon: coords?.lon ?? existing?.lon ?? null,
        needsCoordinates: !(coords?.lat != null && coords?.lon != null),
        renderable: coords?.lat != null && coords?.lon != null,
        tier: isE2E ? 0 : isSwitch ? 2 : isPrimaryHub ? 1 : 3,
      });
    });
  });

  return [...cityMap.values()];
}
