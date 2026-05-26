import summary from './worldCities.summary.json';
import official from './worldCities.official.json';
import coords from './worldCities.coords.json';
import countryManifest from './worldCities.countryManifest.json';

export const WORLD_CITIES_SUMMARY = summary;
export const WORLD_CITIES_OFFICIAL = official;
export const WORLD_CITIES_WITH_COORDS = coords;
export const WORLD_CITIES_COUNTRY_MANIFEST = countryManifest;

export function getWorldCitySummary() {
  return WORLD_CITIES_SUMMARY;
}

export function getOfficialWorldCities() {
  return WORLD_CITIES_OFFICIAL;
}

export function getWorldCitiesWithCoords() {
  return WORLD_CITIES_WITH_COORDS;
}

export async function lazyLoadWorldCitySearchIndex() {
  const module = await import('./worldCities.index.json');
  return module.default;
}

export async function lazyLoadFullWorldCitiesGenerated() {
  const module = await import('./worldCities.generated.json');
  return module.default;
}

export async function lazyLoadCountryCities(countrySlug) {
  const module = await import(`./chunks/cities_${countrySlug}.json`);
  return module.default;
}

export * from './worldCities.utils.js';
