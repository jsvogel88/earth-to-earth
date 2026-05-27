/**
 * Maps studio scenarios and mission modes → layerState patches (non-destructive to graph data).
 */

import { getScenarioById } from './registries/scenarioRegistry.js';
import {
  INTEGRATED_GRID_PRESET,
  INTEGRATED_VIEW_FOCUS,
  getViewFocusLayerPatch,
} from '../ui/integratedGridFilters.js';
import { applyStarbaseVisionPreview } from '../layers/starbaseLayerPresets.js';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';

/** @type {Record<string, { integratedViewFocus?: string, layerPatch?: object, starbaseVision?: boolean, missionModeId?: string }>} */
export const SCENARIO_LAYER_PROFILES = {
  'current-default-network': {
    missionModeId: 'current_default',
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID,
    layerPatch: {},
    starbaseVision: false,
  },
  'mars-civilization-network': {
    missionModeId: 'mars_civilization',
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showRemoteCargoRoutes: false,
      showExtendedRuralLayer: false,
      showIntegratedMineralHubs: true,
    },
    starbaseVision: true,
  },
  'million-people-to-mars': {
    missionModeId: 'mars_civilization',
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID,
    layerPatch: {
      showIntegratedE2E: true,
      showIntegratedE2M: true,
      showIntegratedHyperloop: true,
      showIntegratedLoop: true,
      showIntegratedMineralHubs: true,
      showRemoteCargoRoutes: false,
    },
    starbaseVision: true,
  },
  'petabond-export-package': {
    missionModeId: 'petabond_export',
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showIntegratedE2M: true,
      showIntegratedHyperloop: true,
      showIntegratedMineralHubs: true,
      showRemoteCargoRoutes: false,
    },
    starbaseVision: true,
  },
  'gigafactory-export-network': {
    missionModeId: 'earth_cargo',
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showIntegratedE2M: true,
      showIntegratedMineralHubs: true,
      showIntegratedHyperloop: true,
      showRemoteCargoRoutes: false,
    },
    starbaseVision: false,
  },
  'terafab-heavy-industry-network': {
    missionModeId: 'earth_cargo',
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showIntegratedE2M: true,
      showIntegratedHyperloop: true,
      showIntegratedMineralHubs: true,
    },
    starbaseVision: true,
  },
  'kilaplant-deployment-network': {
    missionModeId: 'earth_cargo',
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showIntegratedE2M: true,
      showIntegratedMineralHubs: true,
      showIntegratedE2E: false,
      showIntegratedLoop: false,
    },
    starbaseVision: false,
  },
  'megaline-deployment-network': {
    missionModeId: 'earth_cargo',
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.HYPERLOOP,
    layerPatch: {
      showIntegratedHyperloop: true,
      showIntegratedE2M: true,
      showIntegratedLoop: true,
    },
    starbaseVision: false,
  },
};

export const MISSION_MODE_SCENARIO_ID = {
  current_default: 'current-default-network',
  earth_passenger: 'current-default-network',
  earth_cargo: 'gigafactory-export-network',
  moon_logistics: 'current-default-network',
  mars_civilization: 'mars-civilization-network',
  re2e_network: 'gigafactory-export-network',
  kilaplant_deployment: 'kilaplant-deployment-network',
  megaline_deployment: 'megaline-deployment-network',
  gigafactory_export: 'gigafactory-export-network',
  terafab_heavy: 'terafab-heavy-industry-network',
  petabond_export: 'petabond-export-package',
  custom: 'current-default-network',
};

/**
 * Extra view-focus patch when mission mode differs from scenario default.
 * @param {string} missionModeId
 */
export function getMissionModeViewFocusPatch(missionModeId) {
  switch (missionModeId) {
    case 'earth_passenger':
      return getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2E);
    case 'earth_cargo':
    case 're2e_network':
      return getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL);
    case 'moon_logistics':
      return getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M);
    default:
      return null;
  }
}

/**
 * @param {string} scenarioId
 * @param {{ transportMode?: string, missionModeId?: string }} [options]
 */
export function buildLayerStateForScenario(scenarioId, options = {}) {
  const scenario = getScenarioById(scenarioId);
  const profile = SCENARIO_LAYER_PROFILES[scenarioId] ?? {};
  const transportMode = options.transportMode ?? TRANSPORT_MODES.CIVILIZATION_GRID;
  const missionModeId =
    options.missionModeId ?? profile.missionModeId ?? 'current_default';

  const base =
    transportMode === TRANSPORT_MODES.CIVILIZATION_GRID
      ? { ...buildDefaultLayerState(transportMode), ...INTEGRATED_GRID_PRESET }
      : { ...buildDefaultLayerState(transportMode) };

  const focus = profile.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
  let layerState = {
    ...base,
    ...getViewFocusLayerPatch(focus),
    ...(profile.layerPatch ?? {}),
    integratedViewFocus: focus,
  };

  const missionFocusPatch = getMissionModeViewFocusPatch(missionModeId);
  if (missionFocusPatch && missionModeId !== profile.missionModeId) {
    layerState = { ...layerState, ...missionFocusPatch };
  }

  for (const key of scenario?.defaultLayers ?? []) {
    layerState[key] = true;
  }

  if (profile.starbaseVision) {
    layerState = applyStarbaseVisionPreview(layerState, true);
  }

  return {
    scenario,
    layerState,
    missionModeId,
    statusMessage: scenario
      ? `Scenario applied: ${scenario.label}`
      : 'Scenario applied',
  };
}

/**
 * @param {string} missionModeId
 * @param {{ transportMode?: string }} [options]
 */
export function buildLayerStateForMissionMode(missionModeId, options = {}) {
  const scenarioId = MISSION_MODE_SCENARIO_ID[missionModeId] ?? 'current-default-network';
  return buildLayerStateForScenario(scenarioId, { ...options, missionModeId });
}
