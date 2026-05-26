/**
 * Coordinate lookup for curated map lists only (Rare Earth seeds, future 1M+ hubs).
 * Does NOT load or render world-cities.csv — that file is for Route Optimizer / selector testing.
 */

import { normalizeCityKey, PHASE1_MANUAL_COORDS } from './hyperloopPhase1Coordinates.js';
import globalCoverageCoords from './globalCoverageCoordinates.json' with { type: 'json' };
import { GLOBAL_COVERAGE_MANUAL_COORDS } from './globalCoverageManualCoords.js';

const GEO_BY_KEY = globalCoverageCoords;

/**
 * @param {string} name
 * @returns {{ lat: number, lon: number, country?: string, continent?: string } | null}
 */
export function lookupCityCoordinates(name) {
  const key = normalizeCityKey(name);
  const manual = PHASE1_MANUAL_COORDS[key];
  if (manual?.lat != null && manual?.lon != null) {
    return {
      lat: manual.lat,
      lon: manual.lon,
      country: manual.country,
      continent: manual.continent,
    };
  }

  const supplement = GLOBAL_COVERAGE_MANUAL_COORDS[key];
  if (supplement) return supplement;

  const geo = GEO_BY_KEY[key];
  if (geo?.lat != null && geo?.lon != null) {
    return {
      lat: geo.lat,
      lon: geo.lon,
      country: geo.country,
      continent: geo.continent,
    };
  }

  return null;
}
