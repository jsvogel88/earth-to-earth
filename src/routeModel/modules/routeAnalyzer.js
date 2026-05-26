import defaults from '../data/defaults.json';
import citiesData from '../data/cities.json';
import {
  isEconomicsEnriched,
  loadWorldCitiesEnrichedWithCoordinates,
} from '../../data/worldCities.js';
import { toRouteModelCity } from '../../data/economics/loadEconomics.js';
import {
  haversineDistanceKm,
  haversineDistanceMiles,
  orbitalFlightHours,
  conventionalFlightHours,
  timeSavingsHours,
} from '../utils/geography.js';
import {
  getConstraintTag,
  passengerDemand,
  cargoDemandKg,
  routeRevenue,
  strategicScore,
} from '../utils/economics.js';
import { excludeOverlayRecordsFromRouteInputs } from '../excludeOverlayRecords.js';

export const STARSHIP_MIN_DISTANCE_MILES = 1400;

let cachedDefaults = { ...defaults };

export function loadCities() {
  return citiesData.map((c) => ({ ...c }));
}

/** Hub cities from world registry + economic enrichment (requires npm run enrich:economic). */
export function loadCitiesFromWorldRegistry({ minPopulation = 100_000 } = {}) {
  if (!isEconomicsEnriched()) return loadCities();
  return loadWorldCitiesEnrichedWithCoordinates({ minPopulation }).map(toRouteModelCity);
}

export function getDefaults() {
  return { ...cachedDefaults };
}

export function setDefaults(partial) {
  cachedDefaults = { ...cachedDefaults, ...partial };
}

export function routeKey(originCode, destCode) {
  return `${originCode}-${destCode}`;
}

export function analyzeRoute(origin, destination, config = cachedDefaults) {
  const distanceKm = haversineDistanceKm(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );
  const distanceMiles = haversineDistanceMiles(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  if (distanceMiles < STARSHIP_MIN_DISTANCE_MILES) {
    return null;
  }

  const orbitalHours = orbitalFlightHours(distanceKm, config.orbitalVelocity);
  const conventionalHours = conventionalFlightHours(
    distanceKm,
    config,
    origin.tier,
    destination.tier
  );
  const timeSavings = timeSavingsHours(conventionalHours, orbitalHours);
  const constraint = getConstraintTag(timeSavings);
  const paxDemand = passengerDemand(origin, destination, timeSavings);
  const cargoKg = cargoDemandKg(origin, destination, timeSavings, distanceKm);
  const revenue = routeRevenue(
    paxDemand,
    cargoKg,
    config,
    origin.airportCapacity,
    destination.airportCapacity
  );
  const strategic = strategicScore(origin, destination, timeSavings, constraint);

  return {
    id: routeKey(origin.code, destination.code),
    originCode: origin.code,
    destCode: destination.code,
    originName: origin.name,
    destName: destination.name,
    distanceKm,
    distanceMiles,
    orbitalHours,
    conventionalHours,
    timeSavingsHours: timeSavings,
    constraint,
    passengerDemand: paxDemand,
    cargoKg,
    revenue,
    strategicScore: strategic,
    origin,
    destination,
  };
}

export function analyzeNetwork(selectedCities, config = cachedDefaults) {
  const cities = excludeOverlayRecordsFromRouteInputs(selectedCities);
  const routes = [];
  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const route = analyzeRoute(cities[i], cities[j], config);
      if (route) routes.push(route);
    }
  }
  return routes;
}

export function getTopRoutes(routes, limit = 20, sortBy = 'revenue') {
  const sorted = [...routes].sort((a, b) => {
    switch (sortBy) {
      case 'timeSavings':
        return b.timeSavingsHours - a.timeSavingsHours;
      case 'distance':
        return b.distanceKm - a.distanceKm;
      case 'strategic':
        return b.strategicScore - a.strategicScore;
      default:
        return b.revenue - a.revenue;
    }
  });
  return sorted.slice(0, limit);
}

export function getTotalNetworkRevenue(routes) {
  return routes.reduce((sum, r) => sum + r.revenue, 0);
}

export function getRouteByEndpoints(routes, originName, destName) {
  return routes.find(
    (r) =>
      (r.originName === originName && r.destName === destName) ||
      (r.originName === destName && r.destName === originName)
  );
}

export function buildRouteLookup(routes) {
  const byName = new Map();
  for (const r of routes) {
    byName.set(`${r.originName}|${r.destName}`, r);
    byName.set(`${r.destName}|${r.originName}`, r);
  }
  return byName;
}
