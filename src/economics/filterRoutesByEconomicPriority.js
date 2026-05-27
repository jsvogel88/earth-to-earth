/**
 * Economic priority filtering — reduces clutter at planetary zoom.
 */

import { percentileThreshold } from './scoreUtils.js';

/**
 * @param {number} zoom
 * @param {string} viewMode
 */
export function economicPercentileForContext(zoom, viewMode) {
  const z = Number(zoom) || 2;
  if (viewMode === 'ROBOTAXI') return 0;
  if (viewMode === 'E2E' || viewMode === 'E2E_STARSHIP') return z <= 3 ? 0.85 : z <= 5 ? 0.7 : 0;
  if (viewMode === 'E2M' || viewMode === 'E2M_ORBITAL') return z <= 5 ? 0.65 : 0.35;
  if (viewMode === 'LOOP') return z <= 5 ? 0.7 : z <= 8 ? 0.45 : 0;
  if (viewMode === 'HYPERLOOP_CORE') return z <= 3 ? 0.88 : z <= 5 ? 0.72 : 0.4;
  // CIVILIZATION_GRID
  if (z <= 3) return 0.9;
  if (z <= 5) return 0.75;
  if (z <= 8) return 0.5;
  return 0;
}

/**
 * @param {object} edge
 * @param {object} routeScore
 * @param {string} viewMode
 */
function scoreForView(edge, routeScore, viewMode) {
  if (!routeScore) return 0;
  switch (viewMode) {
    case 'E2E':
    case 'E2E_STARSHIP':
      return routeScore.passengerImportance ?? 0;
    case 'E2M':
    case 'E2M_ORBITAL':
      return routeScore.cargoImportance ?? 0;
    case 'LOOP':
      return routeScore.routeImportance ?? 0;
    default:
      return routeScore.civilizationImportance ?? 0;
  }
}

/**
 * @param {object[]} edges
 * @param {object} options
 * @param {string} options.viewMode
 * @param {number} options.zoom
 * @param {Map<string, object>} options.edgeScores
 */
export function filterRoutesByEconomicPriority(
  edges,
  { viewMode, zoom, edgeScores }
) {
  const percentile = economicPercentileForContext(zoom, viewMode);
  if (percentile <= 0 || !edges?.length) return edges ?? [];

  const values = edges.map((e) => scoreForView(e, edgeScores.get(e.id), viewMode));
  const threshold = percentileThreshold(values, percentile);

  return edges.filter((e) => {
    const score = scoreForView(e, edgeScores.get(e.id), viewMode);
    if (e.tier === 1 && viewMode === 'CIVILIZATION_GRID' && zoom <= 3) {
      return score >= threshold * 0.85;
    }
    return score >= threshold;
  });
}
