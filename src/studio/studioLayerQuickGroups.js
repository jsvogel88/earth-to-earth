/**
 * Quick layer focus chips for the studio Layers tab (existing flags only).
 */

import {
  INTEGRATED_VIEW_FOCUS,
  getViewFocusLayerPatch,
} from '../ui/integratedGridFilters.js';
import { applyStarbaseVisionPreview } from '../layers/starbaseLayerPresets.js';
import { LAYER_VIEW_PRESET_IDS, applyLayerViewPreset } from '../ui/layerViewPresets.js';

export const STUDIO_LAYER_QUICK_GROUPS = [
  {
    id: 'integrated_grid',
    label: 'Full Grid',
    testId: 'studio-quick-integrated-grid',
    buildPatch: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID),
  },
  {
    id: 'e2e',
    label: 'E2E Passenger',
    testId: 'studio-quick-e2e',
    buildPatch: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2E),
  },
  {
    id: 're2e',
    label: 'RE2E / Cargo',
    testId: 'studio-quick-re2e',
    buildPatch: () => ({
      ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL),
      showRareEarthHubs: true,
    }),
  },
  {
    id: 'hyperloop',
    label: 'Hyperloop Spine',
    testId: 'studio-quick-hyperloop',
    buildPatch: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.HYPERLOOP),
  },
  {
    id: 'starbase',
    label: 'Starbase System',
    testId: 'studio-quick-starbase',
    buildPatch: () => applyStarbaseVisionPreview({}, true),
  },
  {
    id: 'robotaxi',
    label: 'Local / Auto',
    testId: 'studio-quick-robotaxi',
    buildPatch: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.AUTO),
  },
  {
    id: LAYER_VIEW_PRESET_IDS.PASSENGER,
    label: 'Passenger View',
    testId: 'studio-quick-passenger',
    buildPatch: () => applyLayerViewPreset(LAYER_VIEW_PRESET_IDS.PASSENGER)?.layerState ?? {},
  },
  {
    id: LAYER_VIEW_PRESET_IDS.CARGO_INDUSTRIAL,
    label: 'Cargo / Industrial',
    testId: 'studio-quick-cargo',
    buildPatch: () => applyLayerViewPreset(LAYER_VIEW_PRESET_IDS.CARGO_INDUSTRIAL)?.layerState ?? {},
  },
  {
    id: LAYER_VIEW_PRESET_IDS.PLANNING,
    label: 'Planning View',
    testId: 'studio-quick-planning',
    buildPatch: () => applyLayerViewPreset(LAYER_VIEW_PRESET_IDS.PLANNING)?.layerState ?? {},
  },
];

/**
 * @param {string} groupId
 * @param {object} currentLayerState
 */
export function applyStudioLayerQuickGroup(groupId, currentLayerState = {}) {
  const group = STUDIO_LAYER_QUICK_GROUPS.find((g) => g.id === groupId);
  if (!group) return null;
  return {
    layerState: { ...currentLayerState, ...group.buildPatch() },
    statusMessage: `Layers: ${group.label}`,
  };
}
