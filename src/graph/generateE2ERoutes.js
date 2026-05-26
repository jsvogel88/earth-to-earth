/**
 * E2E global route generator — first-pass hub-to-hub arcs.
 */

import {
  createIntegratedEdge,
  EDGE_MODES,
  EDGE_TYPES,
  CORRIDOR_TYPES,
  normalizeNodeId,
} from './integratedGraphTypes.js';
import { hasCoordinates, haversineDistanceKm } from './geoDistance.js';

const DEFAULT_VISIBILITY = { min: 0, max: 22 };

/**
 * @param {object} hub
 * @returns {boolean}
 */
export function isE2EHubNode(hub) {
  if (!hub) return false;
  if (hub.isE2EHub === true) return true;
  if (hub.e2e_eligible === true) return true;
  return Array.isArray(hub.enabledModes) && hub.enabledModes.includes('e2e');
}

/**
 * @param {object} node
 * @param {number} maxPop
 * @returns {number}
 */
function economicScore(node, maxPop) {
  const explicit = node.economicScore ?? node.economic_score;
  if (explicit != null && Number.isFinite(explicit)) return explicit;

  const pop = node.metro_population ?? node.population ?? 0;
  const popFactor = maxPop > 0 ? pop / maxPop : 0;

  return (
    popFactor * 0.4 +
    (node.logistics_score ?? 0) * 0.2 +
    (node.airport_score ?? 0) * 0.2 +
    (node.port_score ?? 0) * 0.2
  );
}

/**
 * @param {object} a
 * @param {object} b
 * @param {number} maxPop
 * @returns {number}
 */
function pairPriorityScore(a, b, maxPop) {
  const scoreA = economicScore(a, maxPop);
  const scoreB = economicScore(b, maxPop);
  const avgEconomic = (scoreA + scoreB) / 2;

  const popA = a.metro_population ?? a.population ?? 0;
  const popB = b.metro_population ?? b.population ?? 0;
  const popScale = maxPop > 0 ? (popA + popB) / (2 * maxPop) : 0;

  const distance_km = haversineDistanceKm(a, b) ?? 0;
  const longDistanceFactor = Math.min(distance_km / 10_000, 1);

  return avgEconomic + popScale * 0.3 + longDistanceFactor * 0.2;
}

/**
 * @param {object[]} e2eHubs
 * @param {object} [options]
 * @returns {object[]}
 */
export function generateE2ERoutes(e2eHubs, options = {}) {
  const {
    maxPairs = 200,
    minDistanceKm = 500,
    maxDistanceKm = null,
    includeRegional = false,
  } = options;

  const hubs = (e2eHubs ?? []).filter(isE2EHubNode).filter(hasCoordinates);
  if (hubs.length < 2) return [];

  const maxPop = Math.max(
    ...hubs.map((h) => h.metro_population ?? h.population ?? 0),
    1
  );

  const pairs = [];

  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const a = hubs[i];
      const b = hubs[j];
      const idA = normalizeNodeId(a);
      const idB = normalizeNodeId(b);
      if (!idA || !idB || idA === idB) continue;

      const distance_km = haversineDistanceKm(a, b);
      if (distance_km == null) continue;
      if (distance_km < minDistanceKm) continue;
      if (maxDistanceKm != null && distance_km > maxDistanceKm) continue;

      pairs.push({
        a,
        b,
        distance_km,
        priority_score: pairPriorityScore(a, b, maxPop),
      });
    }
  }

  pairs.sort((x, y) => y.priority_score - x.priority_score);

  const routeType = includeRegional ? EDGE_TYPES.REGIONAL : EDGE_TYPES.GLOBAL;
  const selected = pairs.slice(0, maxPairs);

  return selected
    .map(({ a, b, distance_km, priority_score }) =>
      createIntegratedEdge({
        origin: a,
        destination: b,
        mode: EDGE_MODES.E2E,
        route_type: routeType,
        corridor_type: CORRIDOR_TYPES.PASSENGER,
        priority_score,
        economic_score: (economicScore(a, maxPop) + economicScore(b, maxPop)) / 2,
        distance_km: Math.round(distance_km),
        visibility_by_zoom: DEFAULT_VISIBILITY,
        metadata: { generatedBy: 'generateE2ERoutes' },
      })
    )
    .filter(Boolean);
}
