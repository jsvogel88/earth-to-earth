/**
 * Loop regional route generator — lightweight city-to-hub connectors.
 */

import {
  createIntegratedEdge,
  EDGE_MODES,
  EDGE_TYPES,
  CORRIDOR_TYPES,
  normalizeNodeId,
} from './integratedGraphTypes.js';
import { hasCoordinates, findNearest } from './geoDistance.js';

const DEFAULT_VISIBILITY = { min: 6, max: 22 };

/**
 * @param {object[]} cities
 * @param {object} [context]
 * @param {object} [options]
 * @returns {object[]}
 */
export function generateLoopRegionalRoutes(cities, context = {}, options = {}) {
  const { e2eHubs = [], hyperloopNodes = [] } = context;
  const { maxLoopEdges = 500, maxRadiusKm = 800 } = options;

  const loopCities = (cities ?? []).filter(
    (c) => c.loop_enabled !== false && hasCoordinates(c)
  );

  if (!loopCities.length) return [];

  const anchorNodes = [
    ...(e2eHubs ?? []).filter(hasCoordinates),
    ...(hyperloopNodes ?? []).filter(hasCoordinates),
  ];

  if (!anchorNodes.length) return [];

  const edges = [];
  const usedPairs = new Set();

  const sortedCities = [...loopCities].sort(
    (a, b) => (b.population ?? 0) - (a.population ?? 0)
  );

  for (const city of sortedCities) {
    if (edges.length >= maxLoopEdges) break;

    const cityId = normalizeNodeId(city);
    if (!cityId) continue;

    const nearestE2E = findNearest(city, e2eHubs, { maxKm: maxRadiusKm, originId: cityId });
    const nearestHyperloop = findNearest(city, hyperloopNodes, {
      maxKm: maxRadiusKm,
      originId: cityId,
    });

    let anchor = null;
    let distance_km = null;

    if (nearestE2E && nearestHyperloop) {
      if (nearestE2E.distance_km <= nearestHyperloop.distance_km) {
        anchor = nearestE2E.node;
        distance_km = nearestE2E.distance_km;
      } else {
        anchor = nearestHyperloop.node;
        distance_km = nearestHyperloop.distance_km;
      }
    } else if (nearestE2E) {
      anchor = nearestE2E.node;
      distance_km = nearestE2E.distance_km;
    } else if (nearestHyperloop) {
      anchor = nearestHyperloop.node;
      distance_km = nearestHyperloop.distance_km;
    } else {
      const fallback = findNearest(city, anchorNodes, { maxKm: maxRadiusKm, originId: cityId });
      if (fallback) {
        anchor = fallback.node;
        distance_km = fallback.distance_km;
      }
    }

    if (!anchor) continue;

    const anchorId = normalizeNodeId(anchor);
    if (!anchorId || anchorId === cityId) continue;

    const pairKey = [cityId, anchorId].sort().join('__');
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    const edge = createIntegratedEdge({
      origin: city,
      destination: anchor,
      mode: EDGE_MODES.LOOP,
      route_type: EDGE_TYPES.REGIONAL,
      corridor_type: CORRIDOR_TYPES.LOCAL_ACCESS,
      priority_score: Math.min((city.population ?? 0) / 20_000_000, 1),
      distance_km: distance_km != null ? Math.round(distance_km) : null,
      visibility_by_zoom: DEFAULT_VISIBILITY,
      metadata: { generatedBy: 'generateLoopRegionalRoutes' },
    });

    if (edge) edges.push(edge);
  }

  return edges;
}
