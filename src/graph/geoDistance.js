/**
 * Dependency-free geographic distance helpers for graph route generation.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * @param {object} node
 * @returns {number | null}
 */
export function getLat(node) {
  const lat = node?.latitude ?? node?.lat;
  return lat != null && Number.isFinite(lat) ? lat : null;
}

/**
 * @param {object} node
 * @returns {number | null}
 */
export function getLon(node) {
  const lon = node?.longitude ?? node?.lon;
  return lon != null && Number.isFinite(lon) ? lon : null;
}

/**
 * @param {object} node
 * @returns {boolean}
 */
export function hasCoordinates(node) {
  return getLat(node) != null && getLon(node) != null;
}

/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number}
 */
export function haversineDistanceKmCoords(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

/**
 * @param {object} a
 * @param {object} b
 * @returns {number | null}
 */
export function haversineDistanceKm(a, b) {
  const lat1 = getLat(a);
  const lon1 = getLon(a);
  const lat2 = getLat(b);
  const lon2 = getLon(b);
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  return haversineDistanceKmCoords(lat1, lon1, lat2, lon2);
}

/**
 * @param {object} origin
 * @param {object[]} candidates
 * @returns {Array<{ node: object, distance_km: number }>}
 */
export function sortByDistance(origin, candidates) {
  if (!candidates?.length) return [];

  return candidates
    .map((node) => {
      const distance_km = haversineDistanceKm(origin, node);
      if (distance_km == null) return null;
      return { node, distance_km };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance_km - b.distance_km);
}

/**
 * @param {object} origin
 * @param {object[]} candidates
 * @param {{ maxKm?: number, originId?: string }} [options]
 * @returns {{ node: object, distance_km: number } | null}
 */
export function findNearest(origin, candidates, { maxKm, originId } = {}) {
  if (!hasCoordinates(origin) || !candidates?.length) return null;

  const resolvedOriginId =
    originId ??
    origin?.mineral_hub_id ??
    origin?.networkCityId ??
    origin?.city_id ??
    origin?.id ??
    null;

  let best = null;
  let bestDist = Infinity;

  for (const candidate of candidates) {
    if (!hasCoordinates(candidate)) continue;

    const candidateId =
      candidate?.mineral_hub_id ??
      candidate?.networkCityId ??
      candidate?.city_id ??
      candidate?.id ??
      null;

    if (resolvedOriginId && candidateId && resolvedOriginId === candidateId) continue;

    const distance_km = haversineDistanceKm(origin, candidate);
    if (distance_km == null) continue;
    if (maxKm != null && distance_km > maxKm) continue;

    if (distance_km < bestDist) {
      bestDist = distance_km;
      best = candidate;
    }
  }

  if (!best) return null;
  return { node: best, distance_km: bestDist };
}
