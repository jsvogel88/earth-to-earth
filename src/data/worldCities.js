/**
 * Global city registry (GeoNames-derived list).
 * Source file: src/data/world-cities.csv
 *
 * Columns: name, country, subcountry, geonameid
 * Coordinates are not in the CSV — join via geonameid or PHASE1_MANUAL_COORDS until enriched.
 *
 * Used by: Route Optimizer (CSV registry) + Network Map (CURATED_NETWORK_CITIES / getMapRoiHubs).
 * No routes, edges, or graph logic in this module.
 */

import csvText from './world-cities.csv?raw';
import { normalizeCityKey, PHASE1_MANUAL_COORDS } from './hyperloopPhase1Coordinates.js';
import { enrichWorldCityRecord, getEnrichmentMeta } from './economics/loadEconomics.js';

/** @typedef {import('./economics/loadEconomics.js').WorldCity & object} WorldCity */

let _cached = null;

function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

/** Canonical country slugs for networkCityId / worldCityKey (feeder vs CSV vs manual). */
const COUNTRY_CANONICAL = {
  'tanzania, united republic of': 'tanzania',
  'united republic of tanzania': 'tanzania',
  'democratic republic of the congo': 'dr congo',
  'dr congo': 'dr congo',
  'drc': 'dr congo',
  'congo, democratic republic of the': 'dr congo',
  'republic of the congo': 'republic of the congo',
  'united states': 'usa',
  'united states of america': 'usa',
  'u.s.a.': 'usa',
  'united kingdom': 'uk',
  'great britain': 'uk',
  'uae': 'uae',
  'united arab emirates': 'uae',
  'south korea': 'south korea',
  "korea, republic of": 'south korea',
  'north korea': 'north korea',
  "korea, democratic people's republic of": 'north korea',
  'hong kong sar': 'hong kong',
  'ivory coast': "côte d'ivoire",
  "cote d'ivoire": "côte d'ivoire",
  'russia': 'russia',
  'russian federation': 'russia',
};

export function normalizeCountryKey(country) {
  const base = String(country || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  return COUNTRY_CANONICAL[base] || base;
}

/** Stable key for dedup / lookup: name|country */
export function worldCityKey(name, country) {
  return `${normalizeCityKey(name)}|${normalizeCountryKey(country)}`;
}

/**
 * Parse raw CSV text into city records.
 * @param {string} text
 * @returns {WorldCity[]}
 */
export function parseWorldCitiesCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const [name, country, subcountry, geonameidStr] = parseCsvLine(lines[i]);
    if (!name?.trim()) continue;

    const geonameid = Number.parseInt(geonameidStr, 10);
    const key = worldCityKey(name, country);
    const manual = PHASE1_MANUAL_COORDS[normalizeCityKey(name)];

    rows.push({
      name: name.trim(),
      country: (country || '').trim(),
      subcountry: (subcountry || '').trim(),
      geonameid: Number.isFinite(geonameid) ? geonameid : null,
      id: `gn_${geonameidStr || i}`,
      latitude: manual?.lat ?? null,
      longitude: manual?.lon ?? null,
      hasCoordinates: Boolean(manual?.lat != null && manual?.lon != null),
    });
  }
  return rows;
}

/** All world cities (~33k). Parsed once and cached. */
export function loadWorldCities() {
  if (!_cached) {
    _cached = parseWorldCitiesCsv(csvText);
  }
  return _cached;
}

/** Cities that already have lat/lon from PHASE1_MANUAL_COORDS (or future GeoNames enrich). */
export function loadWorldCitiesWithCoordinates() {
  return loadWorldCities().filter((c) => c.hasCoordinates);
}

/** Full registry with economic + coords from cached enrichment (npm run enrich:economic). */
export function loadWorldCitiesEnriched() {
  return loadWorldCities().map(enrichWorldCityRecord);
}

export function loadWorldCitiesEnrichedWithCoordinates({ minPopulation = 0 } = {}) {
  return loadWorldCitiesEnriched().filter(
    (c) => c.hasCoordinates && (c.population ?? 0) >= minPopulation
  );
}

export function isEconomicsEnriched() {
  const meta = getEnrichmentMeta();
  return meta?.status !== 'pending' && meta?.worldCityCount > 0;
}

export { enrichWorldCityRecord, getEnrichmentMeta };

export function getWorldCityByGeonameId(geonameid) {
  const id = Number(geonameid);
  return loadWorldCities().find((c) => c.geonameid === id) ?? null;
}

export function findWorldCitiesByName(name, { country, limit = 50 } = {}) {
  const key = normalizeCityKey(name);
  const countryKey = country ? normalizeCountryKey(country) : null;
  const out = [];
  for (const city of loadWorldCities()) {
    if (normalizeCityKey(city.name) !== key && !normalizeCityKey(city.name).includes(key)) continue;
    if (countryKey && normalizeCountryKey(city.country) !== countryKey) continue;
    out.push(city);
    if (out.length >= limit) break;
  }
  return out;
}

export const WORLD_CITIES_CSV_PATH = 'src/data/world-cities.csv';

export const WORLD_CITIES_SCHEMA = {
  name: 'City name',
  country: 'Country (English)',
  subcountry: 'Region / admin area',
  geonameid: 'GeoNames ID (for coordinate enrichment)',
};

// ---------------------------------------------------------------------------
// Curated network registry — identity + coordinates only (no routes / edges)
// ---------------------------------------------------------------------------

/** @typedef {object} NetworkCity
 * @property {string} id
 * @property {string} name
 * @property {string} country
 * @property {number} lat
 * @property {number} lon
 * @property {number|null} [population]
 * @property {string} [continent]
 * @property {string} [region]
 * @property {string[]} [aliases]
 */

export function networkCityId(name, country) {
  const countrySlug = normalizeCountryKey(country)
    .replace(/,/g, '')
    .replace(/\s+/g, '-');
  const nameSlug = normalizeCityKey(name).replace(/\s+/g, '-');
  return `net:${nameSlug}:${countrySlug}`;
}

const _curatedNetworkRows = [
  ['New York', 'USA', 40.7128, -74.006, 8335897, 'North America', 'Northeast US'],
  ['London', 'UK', 51.5074, -0.1278, 8982000, 'Europe', 'Western Europe'],
  ['Los Angeles', 'USA', 34.0522, -118.2437, 3990456, 'North America', 'US West'],
  ['San Francisco', 'USA', 37.7749, -122.4194, 883305, 'North America', 'US West'],
  ['Tokyo', 'Japan', 35.6762, 139.6503, 13960000, 'Asia', 'East Asia'],
  ['Singapore', 'Singapore', 1.3521, 103.8198, 5686000, 'Asia', 'Southeast Asia'],
  ['Dubai', 'UAE', 25.2048, 55.2708, 3137000, 'Asia', 'Middle East'],
  ['Hong Kong', 'Hong Kong', 22.3193, 114.1694, 7500000, 'Asia', 'East Asia'],
  ['Shanghai', 'China', 31.2304, 121.4737, 27058000, 'Asia', 'East Asia'],
  ['Paris', 'France', 48.8566, 2.3522, 2161000, 'Europe', 'Western Europe'],
  ['Frankfurt', 'Germany', 50.1109, 8.6821, 753000, 'Europe', 'Western Europe'],
  ['Amsterdam', 'Netherlands', 52.3676, 4.9041, 873000, 'Europe', 'Western Europe'],
  ['Toronto', 'Canada', 43.6629, -79.3957, 2930000, 'North America', 'Canada'],
  ['Chicago', 'USA', 41.8781, -87.6298, 2693976, 'North America', 'US Midwest'],
  ['Miami', 'USA', 25.7617, -80.1918, 467963, 'North America', 'US Southeast'],
  ['Dallas', 'USA', 32.7767, -96.797, 1343000, 'North America', 'US South'],
  ['Houston', 'USA', 29.7604, -95.3698, 2300000, 'North America', 'US South'],
  ['Mexico City', 'Mexico', 19.4326, -99.1332, 8918000, 'North America', 'Mexico'],
  ['São Paulo', 'Brazil', -23.5505, -46.6333, 12252000, 'South America', 'Brazil'],
  ['Buenos Aires', 'Argentina', -34.6037, -58.3816, 2890151, 'South America', 'Argentina'],
  ['Sydney', 'Australia', -33.8688, 151.2093, 5312000, 'Oceania', 'Australia'],
  ['Melbourne', 'Australia', -37.8136, 144.9631, 5078193, 'Oceania', 'Australia'],
  ['Seoul', 'South Korea', 37.5665, 126.978, 9776000, 'Asia', 'East Asia'],
  ['Mumbai', 'India', 19.0876, 72.8691, 20411000, 'Asia', 'South Asia'],
  ['Delhi', 'India', 28.6139, 77.209, 16787941, 'Asia', 'South Asia'],
  ['Bangkok', 'Thailand', 13.7563, 100.5018, 8305000, 'Asia', 'Southeast Asia'],
  ['Istanbul', 'Turkey', 41.0082, 28.9784, 15462000, 'Europe', 'Eurasia'],
  ['Tel Aviv', 'Israel', 32.0853, 34.7818, 460000, 'Asia', 'Middle East'],
  ['Riyadh', 'Saudi Arabia', 24.7136, 46.6753, 7676654, 'Asia', 'Middle East'],
  ['Johannesburg', 'South Africa', -26.2041, 28.0473, 5634800, 'Africa', 'Southern Africa'],
  ['Lagos', 'Nigeria', 6.5244, 3.3792, 15388000, 'Africa', 'West Africa'],
];

export const CURATED_NETWORK_CITIES = _curatedNetworkRows.map(
  ([name, country, lat, lon, population, continent, region]) => ({
    id: networkCityId(name, country),
    name,
    country,
    lat,
    lon,
    population,
    continent,
    region,
    aliases: [],
    hasCoordinates: true,
  })
);

const _networkById = new Map(CURATED_NETWORK_CITIES.map((c) => [c.id, c]));
const _networkByKey = new Map(
  CURATED_NETWORK_CITIES.map((c) => [worldCityKey(c.name, c.country), c])
);

export function getNetworkCityById(id) {
  return _networkById.get(id) ?? null;
}

export function getNetworkCityByNameCountry(name, country) {
  return _networkByKey.get(worldCityKey(name, country)) ?? null;
}

/** Active ROI / E2E hub cities for the network map (canonical registry). */
export function getActiveE2EHubCities() {
  return CURATED_NETWORK_CITIES;
}

/** Deck.gl hub record: numeric id for pick/layers + canonical network city id. */
export function toMapHubRecord(city, numericId) {
  return {
    id: numericId,
    networkCityId: city.id,
    name: city.name,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
    population: city.population,
    continent: city.continent,
    region: city.region,
  };
}

export function getMapRoiHubs() {
  return getActiveE2EHubCities().map((city, index) => toMapHubRecord(city, index));
}
