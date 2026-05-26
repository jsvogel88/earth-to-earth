/**
 * Persist parsed city overlays — isolated from transport graph state.
 */

import {
  PARSED_CITY_STORAGE_KEY,
  PARSED_SESSIONS_STORAGE_KEY,
} from './parsingTypes.js';

export { PARSED_CITY_STORAGE_KEY, PARSED_SESSIONS_STORAGE_KEY };

export function loadParsedCities() {
  try {
    const raw = localStorage.getItem(PARSED_CITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((c) => c?.id && c.lat != null && c.lng != null)
      : [];
  } catch {
    return [];
  }
}

export function saveParsedCities(cities) {
  try {
    localStorage.setItem(PARSED_CITY_STORAGE_KEY, JSON.stringify(cities));
    return true;
  } catch {
    return false;
  }
}

export function loadImportSessions() {
  try {
    const raw = localStorage.getItem(PARSED_SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveImportSessions(sessions) {
  try {
    localStorage.setItem(PARSED_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {import('./parsingTypes.js').ParsedCityRecord[]} current
 * @param {import('./parsingTypes.js').ParsedCityRecord[]} toAdd
 */
export function addParsedCities(current, toAdd) {
  const existing = new Set(current.map((c) => c.worldCityId || c.id));
  const added = [];
  const list = [...current];
  for (const city of toAdd) {
    const key = city.worldCityId || city.id;
    if (existing.has(key)) continue;
    const entry = {
      ...city,
      isPreview: false,
      createdAt: city.createdAt || new Date().toISOString(),
    };
    list.push(entry);
    existing.add(key);
    added.push(entry);
  }
  saveParsedCities(list);
  return { list, added };
}

export function removeParsedCity(current, id) {
  const list = current.filter((c) => c.id !== id);
  saveParsedCities(list);
  return list;
}

export function removeAllParsedCities() {
  saveParsedCities([]);
  return [];
}

export function exportParsedCitiesJson(cities, sessions = []) {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      parsedCities: cities,
      importSessions: sessions,
    },
    null,
    2
  );
}

/**
 * @param {string} jsonText
 */
export function importParsedCitiesJson(jsonText) {
  const data = JSON.parse(jsonText);
  const cities = data.parsedCities || data.cities || (Array.isArray(data) ? data : []);
  const sessions = data.importSessions || [];
  if (!Array.isArray(cities)) throw new Error('Invalid parsed cities export');
  const valid = cities.filter((c) => c?.id && c.lat != null && c.lng != null);
  saveParsedCities(valid);
  if (sessions.length) saveImportSessions(sessions);
  return { cities: valid, sessions };
}
