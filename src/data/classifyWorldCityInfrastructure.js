/**
 * World Cities infrastructure classification — planning intelligence only.
 */

import {
  networkCityId,
  getNetworkCityById,
  getNetworkCityByNameCountry,
  CURATED_NETWORK_CITIES,
  loadWorldCitiesEnrichedWithCoordinates,
} from './worldCities.js';
import { INFRASTRUCTURE_ROLES, TRUNK_STATION_ROLES } from './infrastructureRoles.js';
import {
  allInfrastructureTrunks,
  tier1PlanetaryTrunks,
} from './planetaryInfrastructureTrunks.js';
import { GLOBAL_COVERAGE_SEEDS, STRATEGIC_NODE_TYPES } from './globalCoverageRegions.js';
import { FUTURE_HIGH_POPULATION_SEEDS } from './futureHighPopulationCities.js';
import { normalizeCityKey as phase1Key } from './hyperloopPhase1Cities.js';

const TRUNK_CITY_KEYS = new Set();
allInfrastructureTrunks.forEach((trunk) => {
  trunk.nodes.forEach((name) => TRUNK_CITY_KEYS.add(phase1Key(name)));
});

const FUTURE_E2E_KEYS = new Set(
  FUTURE_HIGH_POPULATION_SEEDS.map((s) => phase1Key(s.name))
);

const GATEWAY_KEYS = new Set(
  [
    'London',
    'Istanbul',
    'Singapore',
    'Dubai',
    'Mexico City',
    'Tokyo',
    'Lagos',
    'Johannesburg',
    'Frankfurt',
    'Dallas',
  ].map(phase1Key)
);

/**
 * Classify a world city record or graph node into an infrastructure role.
 * @param {{ name: string, country?: string, population?: number|null, id?: string, networkCityId?: string, nodeType?: string, isE2EHub?: boolean }} city
 */
export function classifyInfrastructureRole(city) {
  if (!city?.name) return INFRASTRUCTURE_ROLES.UNCLASSIFIED_PLANNING_NODE;

  const cityId =
    city.networkCityId ||
    city.id ||
    networkCityId(city.name, city.country || '');
  const nameKey = phase1Key(city.name);

  if (CURATED_NETWORK_CITIES.some((c) => c.id === cityId) || city.isE2EHub) {
    return INFRASTRUCTURE_ROLES.ACTIVE_E2E_HUB;
  }

  const strategic = GLOBAL_COVERAGE_SEEDS.find(
    (s) => networkCityId(s.name, s.country || '') === cityId
  );
  if (strategic) {
    const nt = strategic.nodeType;
    if (nt === STRATEGIC_NODE_TYPES.RARE_EARTH_HUB_CANDIDATE) {
      return INFRASTRUCTURE_ROLES.RARE_EARTH_NODE;
    }
    if (nt === STRATEGIC_NODE_TYPES.ISLAND_ACCESS_NODE) {
      return INFRASTRUCTURE_ROLES.ISLAND_ACCESS_NODE;
    }
    if (
      nt === STRATEGIC_NODE_TYPES.REMOTE_CARGO_NODE ||
      nt === STRATEGIC_NODE_TYPES.ARCTIC_LOGISTICS_NODE ||
      nt === STRATEGIC_NODE_TYPES.OUTBACK_RESOURCE_NODE
    ) {
      return INFRASTRUCTURE_ROLES.SPECIAL_REMOTE_NODE;
    }
  }

  if (FUTURE_E2E_KEYS.has(nameKey)) {
    return INFRASTRUCTURE_ROLES.FUTURE_E2E_CANDIDATE;
  }

  if (GATEWAY_KEYS.has(nameKey)) {
    return INFRASTRUCTURE_ROLES.PLANETARY_TRUNK_NODE;
  }

  if (TRUNK_CITY_KEYS.has(nameKey)) {
    const onTier1 = tier1PlanetaryTrunks.some((t) =>
      t.nodes.some((n) => phase1Key(n) === nameKey)
    );
    return onTier1
      ? INFRASTRUCTURE_ROLES.PLANETARY_TRUNK_NODE
      : INFRASTRUCTURE_ROLES.REGIONAL_TRUNK_NODE;
  }

  const pop = city.population ?? 0;
  if (pop >= 2_000_000) {
    return INFRASTRUCTURE_ROLES.FUTURE_E2E_CANDIDATE;
  }
  if (pop >= 400_000) {
    return INFRASTRUCTURE_ROLES.FEEDER_NODE;
  }

  return INFRASTRUCTURE_ROLES.UNCLASSIFIED_PLANNING_NODE;
}

/**
 * Planning grid points for optional map overlay (no edges).
 * @param {{ minPopulation?: number, limit?: number }} [options]
 */
export function buildWorldCitiesPlanningGrid(options = {}) {
  const { minPopulation = 250_000, limit = 1200 } = options;
  const cities = loadWorldCitiesEnrichedWithCoordinates({ minPopulation });
  const curatedKeys = new Set(
    CURATED_NETWORK_CITIES.map((c) => phase1Key(c.name))
  );

  return cities
    .filter((c) => c.hasCoordinates && c.lat != null && c.lon != null)
    .slice(0, limit)
    .map((c) => {
      const role = classifyInfrastructureRole(c);
      const bypassed =
        TRUNK_STATION_ROLES.has(role) === false &&
        TRUNK_CITY_KEYS.has(phase1Key(c.name)) &&
        !curatedKeys.has(phase1Key(c.name));
      return {
        id: networkCityId(c.name, c.country),
        name: c.name,
        country: c.country,
        lat: c.latitude ?? c.lat,
        lon: c.longitude ?? c.lon,
        population: c.population ?? null,
        infrastructureRole: bypassed
          ? INFRASTRUCTURE_ROLES.BYPASSED_BY_TRUNK
          : role,
        planningOnly: true,
        renderable: true,
      };
    });
}

export function getInfrastructureRoleColor(role) {
  switch (role) {
    case INFRASTRUCTURE_ROLES.ACTIVE_E2E_HUB:
      return [255, 215, 80, 200];
    case INFRASTRUCTURE_ROLES.PLANETARY_TRUNK_NODE:
      return [60, 180, 255, 190];
    case INFRASTRUCTURE_ROLES.REGIONAL_TRUNK_NODE:
      return [0, 210, 230, 170];
    case INFRASTRUCTURE_ROLES.FEEDER_NODE:
      return [0, 255, 140, 120];
    case INFRASTRUCTURE_ROLES.RARE_EARTH_NODE:
      return [255, 190, 40, 160];
    case INFRASTRUCTURE_ROLES.FUTURE_E2E_CANDIDATE:
      return [180, 120, 255, 140];
    case INFRASTRUCTURE_ROLES.ISLAND_ACCESS_NODE:
      return [170, 90, 255, 140];
    case INFRASTRUCTURE_ROLES.SPECIAL_REMOTE_NODE:
      return [255, 150, 40, 140];
    case INFRASTRUCTURE_ROLES.BYPASSED_BY_TRUNK:
      return [120, 140, 180, 90];
    default:
      return [100, 120, 160, 70];
  }
}

export function resolvePlanningCity(name, country) {
  return (
    getNetworkCityByNameCountry(name, country) ||
    getNetworkCityById(networkCityId(name, country))
  );
}
