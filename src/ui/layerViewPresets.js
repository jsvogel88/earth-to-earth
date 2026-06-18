/**
 * Smart layer presets for Integrated / Civilization Grid views.
 * Uses existing layerRegistry flags only.
 */

import {
  INTEGRATED_GRID_PRESET,
  INTEGRATED_VIEW_FOCUS,
  getViewFocusLayerPatch,
} from './integratedGridFilters.js';
import { applyStarbaseVisionPreview } from '../layers/starbaseLayerPresets.js';

export const LAYER_VIEW_PRESET_IDS = {
  PASSENGER: 'passenger_view',
  CARGO_INDUSTRIAL: 'cargo_industrial_view',
  FULL_CIVILIZATION: 'full_civilization_grid',
  PLANNING: 'planning_view',
  DEBUG: 'debug_view',
};

export const LAYER_VIEW_PRESETS = [
  {
    id: LAYER_VIEW_PRESET_IDS.PASSENGER,
    label: 'Passenger View',
    description: 'E2E Starship arcs + feeders + hyperloop trunk context',
    buildLayerState: (current = {}) => ({
      ...current,
      ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2E),
      showE2EFeeders: true,
      showIntegratedHyperloop: true,
      showStarbaseHubs: false,
      showIntegratedE2M: false,
      showIntegratedMineralHubs: false,
    }),
  },
  {
    id: LAYER_VIEW_PRESET_IDS.CARGO_INDUSTRIAL,
    label: 'Cargo / Industrial View',
    description: 'RE2E / E2M arcs, resource corridors, mineral hubs',
    buildLayerState: (current = {}) => ({
      ...current,
      ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL),
      showRareEarthHubs: true,
      showE2MLayer: true,
      showIntegratedMineralHubs: true,
      showPetabondExportPackages: true,
      re2eCorridorFilter: 'all',
      showFeederRoutesFilter: true,
      ...applyStarbaseVisionPreview({}, true),
    }),
  },
  {
    id: LAYER_VIEW_PRESET_IDS.FULL_CIVILIZATION,
    label: 'Full Civilization Grid',
    description: 'All integrated systems (default civilization profile)',
    buildLayerState: (current = {}) => ({
      ...current,
      ...INTEGRATED_GRID_PRESET,
    }),
  },
  {
    id: LAYER_VIEW_PRESET_IDS.PLANNING,
    label: 'Planning View',
    description: 'Planning grid, dashed overlays, custom + parsed visible',
    buildLayerState: (current = {}) => ({
      ...current,
      showWorldCitiesPlanningGrid: true,
      showCustomDestinations: true,
      showCustomDestinationLabels: true,
      showParsedCities: true,
      showPlanningRoutes: true,
      showIntegratedE2E: true,
      showIntegratedHyperloop: true,
      integratedViewFocus: INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID,
    }),
  },
  {
    id: LAYER_VIEW_PRESET_IDS.DEBUG,
    label: 'Debug View',
    description: 'Diagnostics overlays + full grid skeleton',
    buildLayerState: (current = {}) => ({
      ...current,
      ...INTEGRATED_GRID_PRESET,
      showTrafficFlow: true,
      showPlanetarySkeleton: true,
      showGlobalConnectivityCorridors: true,
    }),
  },
];

/**
 * @param {string} presetId
 * @param {object} [currentLayerState]
 */
export function applyLayerViewPreset(presetId, currentLayerState = {}) {
  const preset = LAYER_VIEW_PRESETS.find((p) => p.id === presetId);
  if (!preset) return null;
  return {
    layerState: preset.buildLayerState(currentLayerState),
    label: preset.label,
  };
}
