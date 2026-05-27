/**
 * Zoom-level filter — progressive disclosure by route family and tier.
 * View-mode aware (Phase 7C).
 */

import { classifyRouteFamily } from './classifyRouteFamily.js';
import { isPriorityE2EEdge } from '../map/visualHierarchy.js';
import { applyPlanetaryRouteCap } from './planetaryRouteCap.js';
import { filterUnownedPlanetaryRoutes } from './planetaryTopology.js';

const PLANETARY_ZOOM = 3;

/**
 * @param {object[]} items
 * @param {number} zoom
 * @param {(item: object) => string} classifyFn
 * @param {string | null} [viewMode]
 * @returns {object[]}
 */
export function filterRoutesByZoom(items, zoom, classifyFn, viewMode = null) {
  const z = Number(zoom) || 2;
  const list = items ?? [];

  if (viewMode === 'LOOP') {
    return list.filter((item) => {
      const family = classifyFn(item);
      return family === 'REGIONAL_LOOP' || family === 'FEEDER_BRANCH';
    });
  }

  if (viewMode === 'E2M' || viewMode === 'E2M_ORBITAL') {
    return list.filter((item) => classifyFn(item) === 'E2M_CARGO');
  }

  if (viewMode === 'E2E' || viewMode === 'E2E_STARSHIP') {
    return list.filter((item) => classifyFn(item) === 'E2E_GLOBAL_ARC');
  }

  if (viewMode === 'HYPERLOOP_CORE') {
    return list.filter((item) => {
      const family = classifyFn(item);
      return (
        family === 'CONTINENTAL_SPINE' ||
        family === 'REGIONAL_LOOP' ||
        family === 'FEEDER_BRANCH'
      );
    });
  }

  if (viewMode === 'ROBOTAXI') {
    return list.filter((item) => classifyFn(item) === 'ROBOTAXI_LOCAL');
  }

  if (z < PLANETARY_ZOOM) {
    const owned = filterUnownedPlanetaryRoutes(list, z);
    const planetary = owned.filter((item) => {
      const family = classifyFn(item);
      if (family === 'FEEDER_BRANCH' || family === 'REGIONAL_LOOP') return false;
      if (family === 'ROBOTAXI_LOCAL') return false;
      if (family === 'E2M_CARGO') {
        const imp =
          item.civilizationImportance ??
          item.economicWeight?.gdpGeometricMean ??
          item.importance ??
          0;
        if ((item.tier ?? 2) > 2 && imp < 20) return false;
        if ((item.tier ?? 2) > 1 && imp < 8) return false;
        return true;
      }
      if (family === 'E2E_GLOBAL_ARC' && !isPriorityE2EEdge(item)) return false;
      return family === 'E2E_GLOBAL_ARC' || family === 'CONTINENTAL_SPINE';
    });

    const e2mItems = planetary.filter((item) => classifyFn(item) === 'E2M_CARGO');
    const nonE2m = planetary.filter((item) => classifyFn(item) !== 'E2M_CARGO');
    const topE2m = [...e2mItems]
      .sort(
        (a, b) =>
          (b.civilizationImportance ??
            b.economicWeight?.gdpGeometricMean ??
            b.importance ??
            0) -
          (a.civilizationImportance ??
            a.economicWeight?.gdpGeometricMean ??
            a.importance ??
            0)
      )
      .slice(0, 18);

    return applyPlanetaryRouteCap([...nonE2m, ...topE2m], z, classifyFn);
  }

  if (z <= 5) {
    return list.filter((item) => {
      const family = classifyFn(item);
      if (family === 'FEEDER_BRANCH') return false;
      return family !== 'ROBOTAXI_LOCAL';
    });
  }

  if (z <= 8) {
    return list.filter((item) => classifyFn(item) !== 'ROBOTAXI_LOCAL');
  }

  return list.filter((item) => {
    const family = classifyFn(item);
    return family !== 'E2E_GLOBAL_ARC' || (item.tier ?? 2) === 1;
  });
}
