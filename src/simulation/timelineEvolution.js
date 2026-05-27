/**
 * Timeline evolution — network maturity and visibility thresholds by year.
 */

import { getSimulationGrowthFactor } from '../ui/simulationTimeline.js';
import { classifyRouteFamily } from '../graph/classifyRouteFamily.js';

/**
 * @param {number} year
 */
export function getTimelineNetworkMaturity(year) {
  const growth = getSimulationGrowthFactor(year);
  const y = Number(year) || 2025;

  return {
    year: y,
    globalMaturity: growth,
    passengerDemandScale: y <= 2025 ? 0.55 : y <= 2030 ? 0.72 : y <= 2040 ? 0.88 : y <= 2050 ? 1.05 : 1.35,
    cargoDemandScale: y <= 2025 ? 0.45 : y <= 2030 ? 0.68 : y <= 2040 ? 0.92 : y <= 2050 ? 1.15 : 1.45,
    autoSaturation: y <= 2030 ? 0.25 : y <= 2040 ? 0.55 : y <= 2050 ? 0.82 : 1.0,
    spineExpansion: y <= 2025 ? 0.5 : y <= 2030 ? 0.65 : y <= 2040 ? 0.8 : y <= 2050 ? 0.95 : 1.2,
    loopExpansion: y <= 2030 ? 0.35 : y <= 2040 ? 0.62 : y <= 2050 ? 0.88 : 1.1,
    eraLabel:
      y <= 2025
        ? 'sparse_trunk_early_e2e'
        : y <= 2030
          ? 'regional_loops_emerge'
          : y <= 2040
            ? 'autonomous_saturation'
            : y <= 2050
              ? 'global_intermodal_grid'
              : 'mature_planetary_mobility',
  };
}

/**
 * Minimum route importance (0–100) to appear at this year, by family.
 * @param {number} year
 */
export function getTimelineMinImportanceByFamily(year) {
  const y = Number(year) || 2025;
  if (y >= 2075) {
    return {
      E2E_GLOBAL_ARC: 0,
      CONTINENTAL_SPINE: 0,
      REGIONAL_LOOP: 0,
      FEEDER_BRANCH: 0,
      E2M_CARGO: 0,
      ROBOTAXI_LOCAL: 0,
    };
  }
  if (y >= 2050) {
    return {
      E2E_GLOBAL_ARC: 8,
      CONTINENTAL_SPINE: 12,
      REGIONAL_LOOP: 18,
      FEEDER_BRANCH: 28,
      E2M_CARGO: 15,
      ROBOTAXI_LOCAL: 35,
    };
  }
  if (y >= 2040) {
    return {
      E2E_GLOBAL_ARC: 15,
      CONTINENTAL_SPINE: 22,
      REGIONAL_LOOP: 30,
      FEEDER_BRANCH: 42,
      E2M_CARGO: 25,
      ROBOTAXI_LOCAL: 50,
    };
  }
  if (y >= 2030) {
    return {
      E2E_GLOBAL_ARC: 22,
      CONTINENTAL_SPINE: 35,
      REGIONAL_LOOP: 48,
      FEEDER_BRANCH: 62,
      E2M_CARGO: 38,
      ROBOTAXI_LOCAL: 70,
    };
  }
  return {
    E2E_GLOBAL_ARC: 28,
    CONTINENTAL_SPINE: 48,
    REGIONAL_LOOP: 72,
    FEEDER_BRANCH: 88,
    E2M_CARGO: 45,
    ROBOTAXI_LOCAL: 85,
  };
}

/**
 * @param {object} edge
 * @param {number} year
 * @param {object} [edgeScore]
 */
export function edgeVisibleAtTimeline(edge, year, edgeScore = {}) {
  const family = classifyRouteFamily(edge);
  const minImp = getTimelineMinImportanceByFamily(year)[family] ?? 0;
  const imp = edgeScore.civilizationImportance ?? edgeScore.routeImportance ?? 0;
  return imp >= minImp;
}
