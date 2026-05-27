/**
 * Per integrated-view layer visibility (Phase 7C).
 * Auto/FSD halos only in AUTO mode — never in E2E, E2M, Loop, or Grid.
 */

import { INTEGRATED_VIEW_FOCUS } from '../ui/integratedGridFilters.js';

/**
 * @param {string} viewFocus — INTEGRATED_VIEW_FOCUS value
 * @returns {object}
 */
export function getLayerVisibility(viewFocus) {
  const focus = viewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
  const isAuto = focus === INTEGRATED_VIEW_FOCUS.AUTO;
  const isLoop = focus === INTEGRATED_VIEW_FOCUS.LOOP;
  const isE2e = focus === INTEGRATED_VIEW_FOCUS.E2E;
  const isE2m =
    focus === INTEGRATED_VIEW_FOCUS.E2M ||
    focus === INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL;
  const isGrid = focus === INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
  const isHyperloop = focus === INTEGRATED_VIEW_FOCUS.HYPERLOOP;

  return {
    showE2EArcs: true,
    showSpines: !isE2e,
    showLoops: isLoop || isGrid || isHyperloop,
    showFeeders: isLoop || isGrid,
    showE2MArcs: isE2m || isGrid,
    showAutoFSD: isAuto,
    showNodes: true,
    showLabels: true,
    showSimulationOverlay: false,
  };
}

/**
 * @param {string} viewFocus
 * @param {object} layerState
 * @returns {boolean}
 */
export function shouldShowRobotaxiOverlay(viewFocus, layerState = {}) {
  if (viewFocus === INTEGRATED_VIEW_FOCUS.AUTO) {
    return layerState.showRobotaxiLayer !== false;
  }
  return false;
}

/**
 * @param {string} viewFocus
 * @returns {boolean}
 */
export function shouldShowIntermodalHalos(viewFocus) {
  return viewFocus === INTEGRATED_VIEW_FOCUS.AUTO;
}
