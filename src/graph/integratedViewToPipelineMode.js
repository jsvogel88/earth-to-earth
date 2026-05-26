/**
 * Map app integrated view focus keys to pipeline view mode constants.
 */

import { INTEGRATED_VIEW_FOCUS } from '../ui/integratedGridFilters.js';

/**
 * @param {string | undefined} integratedViewFocus
 * @returns {string}
 */
export function integratedViewToPipelineMode(integratedViewFocus) {
  switch (integratedViewFocus) {
    case INTEGRATED_VIEW_FOCUS.E2E:
      return 'E2E';
    case INTEGRATED_VIEW_FOCUS.LOOP:
      return 'LOOP';
    case INTEGRATED_VIEW_FOCUS.E2M:
    case INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL:
      return 'E2M';
    case INTEGRATED_VIEW_FOCUS.HYPERLOOP:
      return 'HYPERLOOP_CORE';
    case INTEGRATED_VIEW_FOCUS.AUTO:
      return 'ROBOTAXI';
    case INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID:
    default:
      return 'CIVILIZATION_GRID';
  }
}
