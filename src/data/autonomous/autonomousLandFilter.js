/**
 * Land-only guard for autonomous overlays (robotaxi rings, charging nodes).
 */

/** Open-ocean cells — not coastal waters. */
const OCEAN_BOXES = [
  { name: 'North Atlantic', lonMin: -80, lonMax: -10, latMin: 10, latMax: 65 },
  { name: 'South Atlantic', lonMin: -50, lonMax: 10, latMin: -60, latMax: 10 },
  { name: 'North Pacific West', lonMin: 130, lonMax: 180, latMin: 10, latMax: 65 },
  { name: 'North Pacific East', lonMin: -180, lonMax: -120, latMin: 10, latMax: 65 },
  { name: 'South Pacific West', lonMin: 120, lonMax: 180, latMin: -60, latMax: 10 },
  { name: 'South Pacific East', lonMin: -180, lonMax: -70, latMin: -60, latMax: 10 },
  { name: 'Indian Ocean', lonMin: 40, lonMax: 110, latMin: -60, latMax: 20 },
  { name: 'Central Pacific', lonMin: -170, lonMax: -130, latMin: -20, latMax: 20 },
  { name: 'Mid Atlantic', lonMin: -45, lonMax: -25, latMin: -15, latMax: 15 },
];

const NON_LAND_PLANETS = new Set(['MOON', 'MARS', 'ORBIT', 'ASTEROID', 'FUTURE']);

function pointInOpenOcean(lng, lat) {
  return OCEAN_BOXES.some(
    (box) => lng >= box.lonMin && lng <= box.lonMax && lat >= box.latMin && lat <= box.latMax
  );
}

/**
 * Hub record must have a populated country (cross-ref hub dataset).
 * @param {object} hub
 */
export function hasValidHubCountry(hub = {}) {
  const country = String(hub.country ?? '').trim();
  return country.length >= 2 && !/^(ocean|open ocean|sea|orbit|space)$/i.test(country);
}

/**
 * Strict robotaxi ring placement — country required, no ocean center.
 * @param {object} hub
 */
export function isRobotaxiHubLandEligible(hub) {
  const lat = hub?.lat ?? hub?.latitude;
  const lng = hub?.lng ?? hub?.longitude ?? hub?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (!hasValidHubCountry(hub)) return false;

  const planet = String(hub.planet ?? 'EARTH').toUpperCase();
  if (NON_LAND_PLANETS.has(planet)) return false;

  // Hub record has country → trust dataset (coastal cities must not be rejected by ocean bboxes).
  return true;
}

/**
 * @param {number} lat
 * @param {number} lng
 * @param {object} [hub]
 * @returns {{ onLand: boolean, reason?: string }}
 */
export function evaluateLandPlacement(lat, lng, hub = {}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { onLand: false, reason: 'invalid_coordinates' };
  }

  const planet = String(hub.planet ?? 'EARTH').toUpperCase();
  if (NON_LAND_PLANETS.has(planet)) {
    return { onLand: false, reason: 'off_world' };
  }

  if (!hasValidHubCountry(hub)) {
    if (pointInOpenOcean(lng, lat)) {
      return { onLand: false, reason: 'open_ocean_no_country' };
    }
    return { onLand: false, reason: 'missing_country' };
  }

  return { onLand: true };
}

/**
 * @param {number} lat
 * @param {number} lng
 * @param {object} [hub]
 */
export function isPointOnLand(lat, lng, hub = {}) {
  return evaluateLandPlacement(lat, lng, hub).onLand;
}

/**
 * @param {object} hub
 */
export function isHubOnLand(hub) {
  return isRobotaxiHubLandEligible(hub);
}

/**
 * @param {object[]} nodes
 */
export function filterLandChargingNodes(nodes = []) {
  return nodes.filter((n) => isPointOnLand(n.lat, n.lng, n));
}
