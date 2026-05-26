/**
 * Search worldCities registry — read-only, no route generation.
 */

import { loadWorldCitiesEnriched, networkCityId, normalizeCountryKey } from '../data/worldCities.js';
import { normalizeCityKey } from '../data/hyperloopPhase1Coordinates.js';

function normalizeQuery(q) {
  return String(q || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function tokenize(q) {
  return normalizeQuery(q).split(/\s+/).filter(Boolean);
}

/**
 * Simple relevance score (no external fuzzy lib).
 */
function scoreCity(city, query, tokens) {
  const name = normalizeCityKey(city.name);
  const country = normalizeCountryKey(city.country);
  const sub = normalizeCountryKey(city.subcountry || '');
  const full = `${name} ${country} ${sub}`;

  if (!query) return city.population ?? 0;

  if (name === query) return 10000 + (city.population ?? 0);
  if (name.startsWith(query)) return 5000 + (city.population ?? 0);
  if (`${name} ${country}`.startsWith(query)) return 4000 + (city.population ?? 0);
  if (full.includes(query)) return 2000 + (city.population ?? 0);

  let tokenScore = 0;
  tokens.forEach((t) => {
    if (name.startsWith(t)) tokenScore += 800;
    else if (country.includes(t) || sub.includes(t)) tokenScore += 400;
    else if (name.includes(t)) tokenScore += 200;
  });
  return tokenScore + (city.population ?? 0) * 0.001;
}

function passesFilters(city, filters) {
  if (filters.requireCoordinates && !city.hasCoordinates) return false;
  if (filters.minPopulation != null && (city.population ?? 0) < filters.minPopulation) {
    return false;
  }
  if (filters.oneMillionPlus && (city.population ?? 0) < 1_000_000) return false;
  if (filters.continent && city.continent !== filters.continent) return false;
  if (filters.country && normalizeCountryKey(city.country) !== normalizeCountryKey(filters.country)) {
    return false;
  }
  if (filters.rareEarthCandidate) {
    const pop = city.population ?? 0;
    const remote = city.continent === 'Africa' || city.continent === 'Oceania';
    if (pop < 100_000 && !remote) return false;
  }
  if (filters.remoteCandidate) {
    if ((city.population ?? 0) > 500_000 && city.continent !== 'Africa') return false;
  }
  if (filters.e2mCandidate) {
    const coastal =
      city.continent === 'North America' ||
      city.continent === 'Europe' ||
      city.continent === 'Asia' ||
      city.continent === 'Oceania';
    if (!coastal || (city.population ?? 0) < 200_000) return false;
  }
  return true;
}

let _enrichedCache = null;

function getEnrichedCities() {
  if (!_enrichedCache) {
    _enrichedCache = loadWorldCitiesEnriched();
  }
  return _enrichedCache;
}

/**
 * @param {object} [options]
 * @param {string} [options.query]
 * @param {number} [options.limit]
 * @param {object} [options.filters]
 */
export function searchWorldCities(options = {}) {
  const {
    query = '',
    limit = 40,
    filters = {},
  } = options;

  const q = normalizeQuery(query);
  const tokens = tokenize(q);
  const mergedFilters = {
    requireCoordinates: true,
    minPopulation: 0,
    ...filters,
  };

  const scored = [];
  for (const city of getEnrichedCities()) {
    if (!passesFilters(city, mergedFilters)) continue;
    const s = scoreCity(city, q, tokens);
    if (q && s < 100) continue;
    scored.push({
      ...city,
      worldCityId: networkCityId(city.name, city.country),
      searchScore: s,
    });
  }

  scored.sort((a, b) => b.searchScore - a.searchScore);
  return scored.slice(0, limit);
}

export function getContinentList() {
  const set = new Set();
  getEnrichedCities().forEach((c) => {
    if (c.continent) set.add(c.continent);
  });
  return [...set].sort();
}

export function formatCitySearchLine(city) {
  const pop = city.population;
  const popStr =
    pop != null ? ` • ${(pop / 1e6).toFixed(1)}M` : ' • coords only';
  return `${city.name}, ${city.country}${popStr}`;
}
