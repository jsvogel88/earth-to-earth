/**
 * Corridor priority scoring — remote / rural global visibility without spaghetti.
 * Read-only; used by infrastructureVisibility.js
 */

const TRUNK_CATEGORIES = new Set([
  'CONTINENTAL_SPINE',
  'PLANETARY_TRUNK',
  'REGIONAL_TRUNK',
  'CORRIDOR_CHAIN',
  'PLANETARY_GATEWAY',
  'INTERCONTINENTAL_GATEWAY',
  'THROUGH_ROUTE',
]);

/**
 * @param {object} path
 * @returns {number}
 */
export function scoreCorridorPath(path) {
  if (!path) return 0;
  let score = 0;

  const cat = path.edgeCategory || '';
  if (TRUNK_CATEGORIES.has(cat)) score += 85;
  if (path.routeClass === 'CONTINENTAL_SPINE') score += 40;
  if (path.isIntercontinentalGateway) score += 45;
  if (path.isThroughCorridor) score += 25;

  if (cat === 'GLOBAL_COVERAGE_CORRIDOR') score += 55;
  if (cat === 'EXTENDED_RURAL') score += 35;
  if (path.routeClass === 'RARE_EARTH_RESOURCE' || path.routeClass === 'CRITICAL_MINERALS') {
    score += 30;
  }
  if (path.routeClass === 'ARCTIC_LOGISTICS' || path.routeClass === 'OUTBACK_RESOURCE') {
    score += 28;
  }
  if (path.cargoPriority) score += 15;
  if (path.specialCrossing || path.tunnelRequired) score += 10;

  const miles = path.distanceMiles ?? 0;
  if (miles >= 400 && miles <= 2500) score += 12;
  if (miles > 2500) score += 6;

  if (path.infrastructureTier === 1) score += 20;
  if (path.infrastructureTier === 2) score += 12;

  return score;
}

/**
 * Minimum score to show a remote / overlay corridor at a given zoom.
 * @param {number} zoom
 */
export function remoteCorridorMinScore(zoom) {
  if (zoom >= 6) return 20;
  if (zoom >= 4) return 32;
  if (zoom >= 2.5) return 42;
  return 52;
}

export function isPriorityRemoteCorridorVisible(path, zoom) {
  return scoreCorridorPath(path) >= remoteCorridorMinScore(zoom);
}
