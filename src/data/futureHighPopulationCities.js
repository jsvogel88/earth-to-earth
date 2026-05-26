/**
 * Future high-population Hyperloop / potential E2E hub candidates (planning overlay only).
 * Coordinates from cityCoordinateLookup (curated manual + coverage supplements).
 * Population values are seed metadata for planning; validate via GeoNames import later.
 */

import { normalizeNodeId } from './hyperloopPhase1Cities.js';
import { lookupCityCoordinates } from './cityCoordinateLookup.js';
import { PLANNING_DEMO_MIN_ZOOM } from './mapLayerDefaults.js';

/** Active ROI E2E hubs — excluded from future overlay */
export const ACTIVE_E2E_HUB_NAMES = new Set(
  [
    'New York', 'London', 'Los Angeles', 'San Francisco', 'Tokyo', 'Singapore', 'Dubai',
    'Hong Kong', 'Shanghai', 'Paris', 'Frankfurt', 'Amsterdam', 'Toronto', 'Chicago', 'Miami',
    'Dallas', 'Houston', 'Mexico City', 'São Paulo', 'Buenos Aires', 'Sydney', 'Melbourne',
    'Seoul', 'Mumbai', 'Delhi', 'Bangkok', 'Istanbul', 'Tel Aviv', 'Riyadh', 'Johannesburg',
    'Lagos',
  ].map((n) => n.toLowerCase())
);

/**
 * Seed list: cities with known coords in PHASE1 + metro population ≥ ~1M (planning metadata).
 * Add rows when GeoNames import confirms population/coordinates.
 */
export const FUTURE_HIGH_POPULATION_SEEDS = [
  { name: 'Beijing', population: 21540000 },
  { name: 'Cairo', population: 10200000 },
  { name: 'Jakarta', population: 10770000 },
  { name: 'Barcelona', population: 1636000 },
  { name: 'Madrid', population: 6751000 },
  { name: 'Rome', population: 2873000 },
  { name: 'Atlanta', population: 4987151 },
  { name: 'Denver', population: 715522 },
  { name: 'Seattle', population: 753675 },
  { name: 'Vancouver', population: 2642825 },
  { name: 'Boston', population: 692600 },
  { name: 'Philadelphia', population: 1603797 },
  { name: 'Washington DC', population: 705749 },
  { name: 'Baltimore', population: 585708 },
  { name: 'Montreal', population: 1780000 },
  { name: 'Osaka', population: 2691000 },
  { name: 'Busan', population: 3449000 },
  { name: 'Ho Chi Minh City', population: 9400000 },
  { name: 'Hanoi', population: 8053000 },
  { name: 'Kuala Lumpur', population: 1989000 },
  { name: 'Dhaka', population: 22478000 },
  { name: 'Karachi', population: 16094000 },
  { name: 'Kolkata', population: 14974000 },
  { name: 'Bengaluru', population: 12425000 },
  { name: 'Chennai', population: 11503000 },
  { name: 'Hyderabad', population: 10494000 },
  { name: 'Pune', population: 7764000 },
  { name: 'Rio de Janeiro', population: 6748000 },
  { name: 'Santiago', population: 6310000 },
  { name: 'Bogotá', population: 7743000 },
  { name: 'Brasília', population: 3057000 },
  { name: 'Nairobi', population: 4922000 },
  { name: 'Casablanca', population: 3712000 },
  { name: 'Abuja', population: 1238000 },
  { name: 'Accra', population: 2291000 },
  { name: 'Brisbane', population: 2560000 },
  { name: 'Auckland', population: 1657000 },
  { name: 'Guangzhou', population: 18676000 },
  { name: 'Shenzhen', population: 17560000 },
  { name: 'Chongqing', population: 32000000 },
  { name: 'Wuhan', population: 12326000 },
  { name: 'Baghdad', population: 7681000 },
  { name: 'Ankara', population: 5663000 },
];

function lookupCoords(name) {
  return lookupCityCoordinates(name);
}

export function buildFutureHighPopulationCities() {
  const nodes = [];

  FUTURE_HIGH_POPULATION_SEEDS.forEach((seed) => {
    if (ACTIVE_E2E_HUB_NAMES.has(seed.name.toLowerCase())) return;

    const coords = lookupCoords(seed.name);
    const hasCoords =
      coords &&
      typeof coords.lat === 'number' &&
      typeof coords.lon === 'number' &&
      Number.isFinite(coords.lat) &&
      Number.isFinite(coords.lon);

    nodes.push({
      id: normalizeNodeId(seed.name, coords?.country || 'unknown'),
      name: seed.name,
      country: coords?.country || '',
      lat: hasCoords ? coords.lat : null,
      lon: hasCoords ? coords.lon : null,
      population: seed.population,
      nodeType: 'FUTURE_HYPERLOOP_CITY',
      potentialFutureE2EHub: true,
      isActiveE2EHub: false,
      e2eHubPhase: 'future',
      futureRouteUse: [
        'population_growth',
        'regional_demand',
        'future_hyperloop_expansion',
      ],
      nearestE2EHub: null,
      nearestHyperloopTrunk: null,
      nearestSwitchNode: null,
      source: 'futureHighPopulationCities.seed',
      requiresValidation: true,
      needsCoordinates: !hasCoords,
      renderable: hasCoords,
      planningOverlay: true,
      visibleMinZoom: PLANNING_DEMO_MIN_ZOOM,
      tooltip:
        'Potential future E2E / Hyperloop expansion hub — high population.',
    });
  });

  return nodes;
}

/** Curated 1M+ future Hyperloop hub list (planning only). */
export const futureHighPopulationCities = buildFutureHighPopulationCities();

export function getFutureHighPopulationMetrics(nodes) {
  const all = nodes || [];
  const withCoords = all.filter((n) => n.renderable);
  return {
    totalWithCoordinates: withCoords.length,
    totalSeeds: all.length,
    needsCoordinates: all.filter((n) => n.needsCoordinates).length,
    potentialFutureE2eHubs: withCoords.filter((n) => n.potentialFutureE2EHub).length,
  };
}
