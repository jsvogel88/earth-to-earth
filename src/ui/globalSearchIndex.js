/**
 * Global search index for Planetary Mobility OS — cities, hubs, corridors, regions.
 */

import { searchWorldCities } from '../utils/worldCitySearch.js';
import { loadWorldCitiesEnrichedWithCoordinates } from '../data/worldCities.js';
import { hyperloopContinentalCorridors } from '../data/hyperloopContinentalCorridors.js';

/** @typedef {'city'|'hub'|'corridor'|'region'} SearchResultType */

/**
 * @typedef {Object} GlobalSearchResult
 * @property {string} id
 * @property {SearchResultType} type
 * @property {string} title
 * @property {string} subtitle
 * @property {number} [lat]
 * @property {number} [lon]
 * @property {number} [zoom]
 * @property {object} [payload]
 */

const REGION_ENTRIES = [
  { id: 'region:americas', title: 'Americas', subtitle: 'Western hemisphere mobility', lat: 15, lon: -80, zoom: 2.2 },
  { id: 'region:europe-mena', title: 'Europe & MENA', subtitle: 'Transcontinental corridors', lat: 48, lon: 25, zoom: 3 },
  { id: 'region:asia-pacific', title: 'Asia Pacific', subtitle: 'Dense economic gravity', lat: 25, lon: 115, zoom: 2.8 },
  { id: 'region:africa', title: 'Africa', subtitle: 'Emerging logistics spine', lat: 5, lon: 20, zoom: 2.5 },
  { id: 'region:oceania', title: 'Oceania', subtitle: 'Pacific island chains', lat: -25, lon: 140, zoom: 3.5 },
];

function corridorToResult(corridor, index) {
  const name = corridor.corridor || corridor.name || corridor.id || `Corridor ${index + 1}`;
  return {
    id: `corridor:${corridor.id || name}`,
    type: 'corridor',
    title: name,
    subtitle: corridor.continent || 'Hyperloop corridor',
    lat: corridor.lat ?? 25,
    lon: corridor.lon ?? 0,
    zoom: 3.5,
    payload: corridor,
  };
}

/**
 * @param {string} query
 * @param {{ hubs?: object[], limit?: number }} [options]
 * @returns {GlobalSearchResult[]}
 */
export function searchGlobalIndex(query, options = {}) {
  const q = String(query || '').trim();
  const limit = options.limit ?? 12;
  if (!q) return [];

  const results = [];
  const qLower = q.toLowerCase();

  // Hubs (active E2E / ROI)
  const hubs = options.hubs || [];
  hubs.forEach((hub) => {
    const hay = `${hub.name} ${hub.country || ''}`.toLowerCase();
    if (hay.includes(qLower)) {
      results.push({
        id: `hub:${hub.id}`,
        type: 'hub',
        title: hub.name,
        subtitle: hub.country ? `${hub.country} · E2E hub` : 'Transport hub',
        lat: hub.lat,
        lon: hub.lon,
        zoom: 5.5,
        payload: hub,
      });
    }
  });

  // Cities
  const cities = searchWorldCities(q, { limit: 8, requireCoordinates: true });
  cities.forEach((city) => {
    if (city.lat == null || city.lon == null) return;
    results.push({
      id: `city:${city.id || city.name}`,
      type: 'city',
      title: city.name,
      subtitle: [city.country, city.population ? `${(city.population / 1e6).toFixed(1)}M pop` : null]
        .filter(Boolean)
        .join(' · '),
      lat: city.lat,
      lon: city.lon,
      zoom: city.population > 5_000_000 ? 6 : city.population > 1_000_000 ? 7 : 8,
      payload: city,
    });
  });

  // Corridors
  const corridors = Array.isArray(hyperloopContinentalCorridors)
    ? hyperloopContinentalCorridors
    : [];
  corridors.forEach((c, i) => {
    const label = (c.corridor || c.name || c.id || '').toLowerCase();
    if (label && label.includes(qLower)) {
      results.push(corridorToResult(c, i));
    }
  });

  // Regions
  REGION_ENTRIES.forEach((r) => {
    if (r.title.toLowerCase().includes(qLower) || r.subtitle.toLowerCase().includes(qLower)) {
      results.push({ ...r, type: 'region' });
    }
  });

  return results.slice(0, limit);
}

/**
 * Warm index for typeahead (top hubs by population).
 * @param {{ hubs?: object[] }} [options]
 */
export function getSearchSuggestions(options = {}) {
  const hubs = (options.hubs || []).slice(0, 6).map((h) => ({
    id: `hub:${h.id}`,
    type: 'hub',
    title: h.name,
    subtitle: h.country || 'Hub',
    lat: h.lat,
    lon: h.lon,
    zoom: 5.5,
    payload: h,
  }));

  const cities = loadWorldCitiesEnrichedWithCoordinates()
    .filter((c) => c.hasCoordinates && (c.population ?? 0) > 2_000_000)
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, 6)
    .map((c) => ({
      id: `city:${c.id}`,
      type: 'city',
      title: c.name,
      subtitle: c.country,
      lat: c.lat,
      lon: c.lon,
      zoom: 6,
      payload: c,
    }));

  return [...hubs, ...cities];
}
