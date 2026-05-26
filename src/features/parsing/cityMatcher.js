/**
 * City matching against world registry + read-only map node fallback.
 */

import {
  loadWorldCitiesEnrichedWithCoordinates,
  networkCityId,
  worldCityKey,
  normalizeCountryKey,
  getNetworkCityByNameCountry,
  CURATED_NETWORK_CITIES,
} from '../../data/worldCities.js';
import { normalizeCityKey } from '../../data/hyperloopPhase1Coordinates.js';
import { parseCityCountryLine } from './parsingUtils.js';

let _coordIndex = null;
let _nameIndex = null;

function buildIndexes() {
  if (_coordIndex) return;
  _coordIndex = new Map();
  _nameIndex = new Map();

  const cities = loadWorldCitiesEnrichedWithCoordinates({ minPopulation: 0 });
  for (const city of cities) {
    if (!city.hasCoordinates) continue;
    const key = worldCityKey(city.name, city.country);
    const existing = _coordIndex.get(key);
    if (!existing || (city.population ?? 0) > (existing.population ?? 0)) {
      _coordIndex.set(key, city);
    }
    const nameKey = normalizeCityKey(city.name);
    if (!_nameIndex.has(nameKey)) _nameIndex.set(nameKey, []);
    _nameIndex.get(nameKey).push(city);
  }
}

function scoreMatch(city, cityName, countryName, tokens) {
  const name = normalizeCityKey(city.name);
  const country = normalizeCountryKey(city.country);
  const queryName = normalizeCityKey(cityName);
  const queryCountry = countryName ? normalizeCountryKey(countryName) : '';

  if (name === queryName && (!queryCountry || country === queryCountry)) {
    return 10000 + (city.population ?? 0);
  }
  if (name.startsWith(queryName)) return 5000 + (city.population ?? 0);
  if (queryCountry && country === queryCountry && name.includes(queryName)) {
    return 3000 + (city.population ?? 0);
  }

  let tokenScore = 0;
  tokens.forEach((t) => {
    if (name.startsWith(t)) tokenScore += 800;
    else if (country.includes(t)) tokenScore += 400;
    else if (name.includes(t)) tokenScore += 200;
  });
  return tokenScore + (city.population ?? 0) * 0.001;
}

/**
 * @param {object} city
 * @param {string} rawInput
 * @param {'exact'|'fuzzy'|'alias'} matchedBy
 * @param {number} confidence
 */
function resolveWorldCityId(name, country) {
  const curated = country ? getNetworkCityByNameCountry(name, country) : null;
  if (curated?.id) return curated.id;
  const byName = getNetworkCityByNameCountry(name, country || '');
  if (byName?.id) return byName.id;
  return networkCityId(name, country);
}

export function toParsedCityFromWorld(city, rawInput, matchedBy, confidence) {
  const lat = city.latitude ?? city.lat;
  const lng = city.longitude ?? city.lon;
  const wId = resolveWorldCityId(city.name, city.country);
  return {
    id: `parsed:${wId}`,
    city: city.name,
    country: city.country,
    lat,
    lng,
    population: city.population ?? null,
    source: 'parsed',
    parsingConfidence: confidence,
    matchedBy,
    suggestedRole: '',
    worldCityId: wId,
    rawInput,
  };
}

/**
 * @param {object} node — map/graph node (read-only)
 * @param {string} rawInput
 */
function toParsedCityFromMapNode(node, rawInput) {
  const lat = node.lat ?? node.latitude;
  const lng = node.lon ?? node.longitude ?? node.lng;
  const name = node.name || node.city || '';
  const country = node.country || '';
  const wId = node.networkCityId || node.id || networkCityId(name, country);
  return {
    id: `parsed:${wId}`,
    city: name,
    country,
    lat,
    lng,
    population: node.population ?? null,
    source: 'mapFallback',
    parsingConfidence: 0.75,
    matchedBy: 'existingMapNode',
    suggestedRole: '',
    worldCityId: wId.startsWith('net:') ? wId : networkCityId(name, country),
    rawInput,
  };
}

/**
 * @param {string} line
 * @param {object} [options]
 * @param {object[]} [options.mapNodes]
 */
export function matchCityLine(line, options = {}) {
  buildIndexes();
  const parsed = parseCityCountryLine(line);
  const { city: cityName, country: countryName, lat: inlineLat, lng: inlineLng } = parsed;
  const nameKey = normalizeCityKey(cityName);

  if (!cityName) {
    return { match: null, matchedBy: 'unresolved', suggestions: [], reason: 'Empty line' };
  }

  if (inlineLat != null && inlineLng != null && Number.isFinite(inlineLat) && Number.isFinite(inlineLng)) {
    return {
      match: {
        id: `parsed:coord:${cityName}:${inlineLat}:${inlineLng}`,
        city: cityName,
        country: countryName || '',
        lat: inlineLat,
        lng: inlineLng,
        population: null,
        source: 'parsed',
        parsingConfidence: 0.95,
        matchedBy: 'exact',
        suggestedRole: '',
        worldCityId: resolveWorldCityId(cityName, countryName || 'unknown'),
        rawInput: line,
      },
      matchedBy: 'exact',
      suggestions: [],
    };
  }

  const exactKey = worldCityKey(cityName, countryName);
  const exact = _coordIndex.get(exactKey);
  if (exact) {
    return {
      match: toParsedCityFromWorld(exact, line, 'exact', 0.98),
      matchedBy: 'exact',
      suggestions: [],
    };
  }

  let curated = countryName ? getNetworkCityByNameCountry(cityName, countryName) : null;
  if (!curated) {
    curated =
      CURATED_NETWORK_CITIES.find((c) => normalizeCityKey(c.name) === nameKey) ?? null;
  }
  if (curated?.lat != null && curated?.lon != null) {
    return {
      match: {
        id: `parsed:${curated.id}`,
        city: curated.name,
        country: curated.country,
        lat: curated.lat,
        lng: curated.lon,
        population: curated.population ?? null,
        source: 'parsed',
        parsingConfidence: 0.96,
        matchedBy: 'alias',
        suggestedRole: '',
        worldCityId: curated.id,
        rawInput: line,
      },
      matchedBy: 'alias',
      suggestions: [],
    };
  }

  const mapNodes = options.mapNodes || [];
  for (const node of mapNodes) {
    if (!node?.name) continue;
    const nodeName = normalizeCityKey(node.name);
    const nodeCountry = normalizeCountryKey(node.country || '');
    if (nodeName !== nameKey && !nodeName.includes(nameKey) && !nameKey.includes(nodeName)) {
      continue;
    }
    if (countryName && nodeCountry && nodeCountry !== normalizeCountryKey(countryName)) {
      continue;
    }
    const lat = node.lat ?? node.latitude;
    const lng = node.lon ?? node.longitude ?? node.lng;
    if (lat == null || lng == null) continue;
    return {
      match: toParsedCityFromMapNode(node, line),
      matchedBy: 'existingMapNode',
      suggestions: [],
    };
  }

  const tokens = nameKey.split(/\s+/).filter(Boolean);
  const candidates = _nameIndex.get(nameKey) || [];
  const scored = [];

  if (candidates.length) {
    for (const c of candidates) {
      const s = scoreMatch(c, cityName, countryName, tokens);
      if (s >= 100) scored.push({ city: c, score: s });
    }
  } else {
    for (const c of loadWorldCitiesEnrichedWithCoordinates({ minPopulation: 0 })) {
      const s = scoreMatch(c, cityName, countryName, tokens);
      if (s >= 500) scored.push({ city: c, score: s });
      if (scored.length > 80) break;
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  if (best && best.score >= 5000) {
    const matchedName = normalizeCityKey(best.city.name);
    const queryName = nameKey;
    const nameOk =
      matchedName === queryName ||
      matchedName.startsWith(queryName) ||
      queryName.startsWith(matchedName);
    if (nameOk) {
      const confidence = best.score >= 10000 ? 0.92 : 0.78;
      return {
        match: toParsedCityFromWorld(best.city, line, 'fuzzy', confidence),
        matchedBy: 'fuzzy',
        suggestions: scored.slice(0, 5).map((x) => toParsedCityFromWorld(x.city, line, 'fuzzy', 0.5)),
      };
    }
  }

  const suggestions = scored.slice(0, 5).map((x) => toParsedCityFromWorld(x.city, line, 'fuzzy', 0.4));

  return {
    match: null,
    matchedBy: 'unresolved',
    suggestions,
    reason: suggestions.length ? 'No confident match' : 'City not found',
  };
}

/** Reset cached indexes (tests). */
export function resetCityMatcherCache() {
  _coordIndex = null;
  _nameIndex = null;
}
