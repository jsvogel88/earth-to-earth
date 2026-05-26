/**
 * worldCities.utils.js
 * Search, filter, and lookup utilities for the hardwired world city universe.
 * Import the index (fast) or full dataset (complete) as needed.
 */

/**
 * Normalize a string for fuzzy matching (lowercase, strip accents, strip punctuation).
 */
export function normalizeForSearch(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Search cities by name prefix. Returns matches sorted by:
 *   1. Exact name match
 *   2. Starts-with match
 *   3. Contains match
 * @param {WorldCity[]} cityList  - the city array to search
 * @param {string}      query     - user input
 * @param {number}      limit     - max results (default 10)
 * @param {object}      filters   - optional filter flags
 */
export function searchCities(cityList, query, limit = 10, filters = {}) {
  if (!query || query.length < 2) return [];
  const q = normalizeForSearch(query);

  const {
    hasCoordinates,
    officialOnly,
    candidatesOnly,
    countryFilter,
    excludeDuplicates,
  } = filters;

  let pool = cityList;
  if (hasCoordinates)    pool = pool.filter(c => c.hasCoordinates);
  if (officialOnly)      pool = pool.filter(c => c.isOfficialNetworkNode || c.isE2EHub);
  if (candidatesOnly)    pool = pool.filter(c => c.hubCandidate);
  if (countryFilter)     pool = pool.filter(c => c.normalizedCountry === countryFilter);
  if (excludeDuplicates) pool = pool.filter(c => !c.isDuplicate);

  const exact    = [];
  const startsWith = [];
  const contains   = [];

  for (const city of pool) {
    const n = city.normalizedName;
    if (n === q)              exact.push(city);
    else if (n.startsWith(q)) startsWith.push(city);
    else if (n.includes(q))   contains.push(city);
  }

  return [...exact, ...startsWith, ...contains].slice(0, limit);
}

/**
 * Look up a single city by exact name + country.
 */
export function findCity(cityList, name, country) {
  const n = normalizeForSearch(name);
  const c = normalizeForSearch(country);
  return cityList.find(city =>
    city.normalizedName === n && city.normalizedCountry === c
  ) || null;
}

/**
 * Get all cities within radiusKm of a lat/lon point.
 * Uses cities with coordinates only.
 */
export function getCitiesNearPoint(coordCities, lat, lon, radiusKm) {
  const R = 6371;
  const toR = d => (d * Math.PI) / 180;
  return coordCities.filter(city => {
    if (!city.hasCoordinates) return false;
    const dlat = toR(city.latitude - lat);
    const dlon = toR(city.longitude - lon);
    const a = Math.sin(dlat/2)**2 +
              Math.cos(toR(lat)) * Math.cos(toR(city.latitude)) * Math.sin(dlon/2)**2;
    const dist = R * 2 * Math.asin(Math.sqrt(a));
    return dist <= radiusKm;
  });
}

/**
 * Promote a city's status one level up the promotion path.
 * Returns a new city object (does not mutate).
 */
export function promoteCityStatus(city, PROMOTION_PATH) {
  const idx = PROMOTION_PATH.indexOf(city.cityStatus);
  if (idx === -1 || idx === PROMOTION_PATH.length - 1) return city;
  return { ...city, cityStatus: PROMOTION_PATH[idx + 1] };
}

/**
 * Filter cities by display rules for a given zoom level.
 * Returns a subset appropriate for that zoom.
 */
export function getCitiesForZoom(cityList, zoom, options = {}) {
  const { planningModeEnabled = false } = options;

  if (zoom <= 3) {
    // Planetary: E2E hubs + transfer hubs only
    return cityList.filter(c => c.isE2EHub || c.cityStatus === 'transfer_hub');
  }
  if (zoom <= 5) {
    // Continental: official nodes + top candidates if planning mode
    return cityList.filter(c =>
      c.isOfficialNetworkNode || c.isE2EHub ||
      (planningModeEnabled && c.hubCandidate)
    );
  }
  if (zoom <= 8) {
    // Regional: all official + candidates
    return cityList.filter(c =>
      c.isOfficialNetworkNode || c.isE2EHub || c.hubCandidate
    );
  }
  // City zoom: everything with coordinates
  return cityList.filter(c => c.hasCoordinates);
}
