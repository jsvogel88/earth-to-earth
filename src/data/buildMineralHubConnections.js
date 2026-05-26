/**
 * Enrich mineral hubs with nearest support city, port, and E2E hub references.
 * Lightweight best-effort — does not require full port scoring on the city dataset.
 */

import { haversineDistanceKm } from '../routeModel/utils/geography.js';

/**
 * @param {{ latitude?: number, longitude?: number, lat?: number, lon?: number }} node
 * @returns {{ lat: number, lon: number } | null}
 */
function nodeCoords(node) {
  const lat = node?.latitude ?? node?.lat;
  const lon = node?.longitude ?? node?.lon;
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return { lat, lon };
}

/**
 * @param {object} node
 * @returns {string | null}
 */
function nodeId(node) {
  return (
    node?.city_id ??
    node?.id ??
    node?.networkCityId ??
    node?.mineral_hub_id ??
    null
  );
}

/**
 * Find nearest candidate node by haversine distance.
 *
 * @param {object} origin
 * @param {object[]} candidates
 * @param {{ maxKm?: number }} [options]
 * @returns {{ node: object, distance_km: number } | null}
 */
export function findNearestNode(origin, candidates, { maxKm } = {}) {
  const originCoords = nodeCoords(origin);
  if (!originCoords || !candidates?.length) return null;

  let best = null;
  let bestDist = Infinity;

  for (const candidate of candidates) {
    const coords = nodeCoords(candidate);
    if (!coords) continue;

    const distance_km = haversineDistanceKm(
      originCoords.lat,
      originCoords.lon,
      coords.lat,
      coords.lon
    );

    if (maxKm != null && distance_km > maxKm) continue;
    if (distance_km < bestDist) {
      bestDist = distance_km;
      best = candidate;
    }
  }

  if (!best) return null;
  return { node: best, distance_km: bestDist };
}

/**
 * Best-effort port candidates from a city list.
 * @param {object[]} cities
 * @returns {object[]}
 */
function selectPortCandidates(cities) {
  if (!cities?.length) return [];

  const scored = cities.filter(
    (c) =>
      (c.port_score ?? 0) > 0.5 ||
      c.isPort === true ||
      /\bport\b/i.test(c.name ?? '')
  );

  return scored.length > 0 ? scored : cities;
}

/**
 * @param {object} hub
 * @param {{ cities?: object[], e2eHubs?: object[], ports?: object[] }} context
 * @returns {object}
 */
export function enrichMineralHub(hub, { cities = [], e2eHubs = [], ports } = {}) {
  if (!hub) return hub;

  const portCandidates = ports ?? selectPortCandidates(cities);
  const e2eCandidates = e2eHubs?.length
    ? e2eHubs
    : cities.filter((c) => c.e2e_eligible || c.isE2EHub);

  const enriched = { ...hub };

  if (!enriched.nearest_support_city) {
    const nearest = findNearestNode(hub, cities);
    if (nearest) {
      enriched.nearest_support_city = nodeId(nearest.node);
      enriched.nearest_support_city_distance_km = Math.round(nearest.distance_km);
    }
  }

  if (!enriched.nearest_port) {
    const nearest = findNearestNode(hub, portCandidates);
    if (nearest) {
      enriched.nearest_port = nodeId(nearest.node);
      enriched.nearest_port_distance_km = Math.round(nearest.distance_km);
    }
  }

  if (!enriched.nearest_e2e_hub) {
    const nearest = findNearestNode(hub, e2eCandidates);
    if (nearest) {
      enriched.nearest_e2e_hub = nodeId(nearest.node);
      enriched.nearest_e2e_hub_distance_km = Math.round(nearest.distance_km);
    }
  }

  if (!enriched.recommended_connection_type) {
    const remote = enriched.remote_score ?? 0;
    enriched.recommended_connection_type =
      remote > 0.7 ? 'feeder_corridor' : 'regional_trunk';
  }

  return enriched;
}

/**
 * @param {object[]} hubs
 * @param {{ cities?: object[], e2eHubs?: object[], ports?: object[] }} context
 * @returns {object[]}
 */
export function enrichMineralHubs(hubs, context = {}) {
  return (hubs ?? []).map((hub) => enrichMineralHub(hub, context));
}
