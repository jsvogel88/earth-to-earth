/**
 * Planetary zoom route cap (≤ 40 paths) — Phase 7C negative space rule.
 */

import { classifyRouteFamily, ROUTE_FAMILIES } from './classifyRouteFamily.js';
import { inferCorridorId, isPriorityE2EEdge } from '../map/visualHierarchy.js';
import { isCorridorOwnedForPlanetary } from './planetaryTopology.js';

const PLANETARY_MAX = 40;
const PLANETARY_ZOOM_THRESHOLD = 3;
const PLANETARY_LABEL_MAX = 20;
const PLANETARY_HALO_TIER_MAX = 1;

const ELIGIBLE_FAMILIES = new Set([
  'E2E_GLOBAL_ARC',
  'CONTINENTAL_SPINE',
  'E2M_CARGO',
]);

export { PLANETARY_MAX, PLANETARY_LABEL_MAX, PLANETARY_HALO_TIER_MAX };

/**
 * @param {object[]} items
 * @param {number} zoom
 * @param {(item: object) => string} classifyFn
 * @returns {object[]}
 */
export function applyPlanetaryRouteCap(items, zoom, classifyFn = classifyRouteFamily) {
  const z = Number(zoom) || 2;
  if (z >= PLANETARY_ZOOM_THRESHOLD) return items ?? [];

  let candidates = (items ?? []).filter((item) => {
    const family = classifyFn(item);
    if (!isCorridorOwnedForPlanetary(item, z)) return false;
    if (family === ROUTE_FAMILIES.E2M_CARGO) {
      const imp =
        item.civilizationImportance ??
        item.economicWeight?.gdpGeometricMean ??
        item.importance ??
        0;
      return (item.tier ?? 2) <= 2 || imp >= 8;
    }
    if (family === 'E2E_GLOBAL_ARC') {
      return isPriorityE2EEdge(item);
    }
    if (!ELIGIBLE_FAMILIES.has(family)) return false;
    const corridorId = item.corridorId ?? inferCorridorId(item);
    if (!corridorId) return false;
    const imp =
      item.civilizationImportance ??
      item.economicWeight?.gdpGeometricMean ??
      item.importance ??
      0;
    return imp >= 50 || (item.tier ?? 2) === 1;
  });

  candidates.sort(
    (a, b) =>
      (b.civilizationImportance ?? b.economicWeight?.gdpGeometricMean ?? 0) -
      (a.civilizationImportance ?? a.economicWeight?.gdpGeometricMean ?? 0)
  );

  const visible = candidates.slice(0, PLANETARY_MAX);

  if (import.meta.env?.DEV && candidates.length > PLANETARY_MAX) {
    console.info(
      `[PLANETARY PRUNE] ${visible.length} routes shown, ${candidates.length - visible.length} pruned`
    );
  }

  return visible;
}
