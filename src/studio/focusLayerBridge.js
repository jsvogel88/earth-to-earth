/**
 * Studio focus → layerState (modes, hubs, payloads). Uses existing layer flags only.
 */

import {
  INTEGRATED_GRID_PRESET,
  INTEGRATED_VIEW_FOCUS,
  getViewFocusLayerPatch,
} from '../ui/integratedGridFilters.js';
import { applyStarbaseVisionPreview } from '../layers/starbaseLayerPresets.js';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { getTransportationModeById } from './registries/transportationModeLibrary.js';
import { getHubTypeById } from './registries/hubTypeRegistry.js';
import { getPayloadTypeById } from './registries/payloadTypeRegistry.js';

/** @type {Record<string, () => object>} */
const MODE_LAYER_BUILDERS = {
  e2e_passenger: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2E),
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2E,
  }),
  e2m_moon: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
    showE2MLayer: true,
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
  }),
  e2m_mars: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
    showE2MLayer: true,
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
  }),
  hyperloop_trunk: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.HYPERLOOP),
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.HYPERLOOP,
  }),
  hyperloop_feeder: () => ({
    showIntegratedHyperloop: true,
    showIntegratedLoop: true,
    showFeeders: true,
    showIntegratedE2E: false,
    showIntegratedE2M: true,
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.HYPERLOOP,
  }),
  regional_loop: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.LOOP),
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.LOOP,
  }),
  robotaxi: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.AUTO),
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.AUTO,
  }),
  re2e: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL),
    showRareEarthHubs: true,
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL,
  }),
  petabond_routes: () =>
    applyStarbaseVisionPreview(
      {
        ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
        showPetabondExportPackages: true,
        integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
      },
      true
    ),
};

/** @type {Record<string, () => object>} */
const HUB_LAYER_BUILDERS = {
  e2e_passenger: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2E),
  e2e_cargo: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2E),
  e2m_launch: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
  starbase_launch: () =>
    applyStarbaseVisionPreview(
      { ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M) },
      true
    ),
  hyperloop_hub: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.HYPERLOOP),
  re2e_resource: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL),
    showRareEarthHubs: true,
    showIntegratedMineralHubs: true,
  }),
  petabond_deployment: () =>
    applyStarbaseVisionPreview(
      {
        showPetabondExportPackages: true,
        showIntegratedE2M: true,
      },
      true
    ),
  gigafactory_hub: () => ({
    showIntegratedE2M: true,
    showIntegratedMineralHubs: true,
    showIntegratedHyperloop: true,
  }),
  terafab_hub: () =>
    applyStarbaseVisionPreview(
      {
        showIntegratedE2M: true,
        showIntegratedHyperloop: true,
        showIntegratedMineralHubs: true,
      },
      true
    ),
};

/** @type {Record<string, () => object>} */
const PAYLOAD_LAYER_BUILDERS = {
  passengers: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2E),
  settlers: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
  general_freight: () => getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
  habitat_modules: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
    showStarbaseHubs: true,
  }),
  mining_equipment: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL),
    showIntegratedMineralHubs: true,
  }),
  rare_earths: () => ({
    ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL),
    showRareEarthHubs: true,
  }),
  factory_modules: () => ({
    showIntegratedE2M: true,
    showIntegratedHyperloop: true,
    showIntegratedMineralHubs: true,
  }),
  petabond_package: () =>
    applyStarbaseVisionPreview(
      {
        showPetabondExportPackages: true,
        ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
      },
      true
    ),
  emergency_supplies: () => ({
    showIntegratedE2M: true,
    showRemoteCargoRoutes: true,
  }),
};

function civBaseLayerState(currentLayerState, transportMode) {
  if (transportMode === TRANSPORT_MODES.CIVILIZATION_GRID) {
    return { ...buildDefaultLayerState(transportMode), ...INTEGRATED_GRID_PRESET };
  }
  return { ...currentLayerState };
}

function mergeFocus(currentLayerState, transportMode, buildPatch) {
  const base = civBaseLayerState(currentLayerState, transportMode);
  return { ...base, ...buildPatch() };
}

/**
 * @param {string} modeId
 * @param {object} currentLayerState
 * @param {{ transportMode?: string }} [options]
 */
export function applyTransportModeFocus(modeId, currentLayerState = {}, options = {}) {
  const mode = getTransportationModeById(modeId);
  if (!mode) return null;
  const build = MODE_LAYER_BUILDERS[modeId];
  if (!mode.wired || !build) {
    return {
      layerState: currentLayerState,
      statusMessage: `${mode.label} — planned (not wired to map layers yet)`,
      plannedOnly: true,
    };
  }
  return {
    layerState: mergeFocus(currentLayerState, options.transportMode, build),
    statusMessage: `Mode focus: ${mode.label}`,
    plannedOnly: false,
  };
}

/**
 * @param {string} hubTypeId
 * @param {object} currentLayerState
 * @param {{ transportMode?: string }} [options]
 */
export function applyHubTypeFocus(hubTypeId, currentLayerState = {}, options = {}) {
  const hub = getHubTypeById(hubTypeId);
  const build = HUB_LAYER_BUILDERS[hubTypeId];
  if (!hub || !build) return null;
  if (hub.plannedOnly) {
    return {
      layerState: currentLayerState,
      statusMessage: `${hub.label} — registry preview (limited map layers)`,
      plannedOnly: true,
    };
  }
  return {
    layerState: mergeFocus(currentLayerState, options.transportMode, build),
    statusMessage: `Hub focus: ${hub.label}`,
    plannedOnly: false,
  };
}

/**
 * @param {string} payloadId
 * @param {object} currentLayerState
 * @param {{ transportMode?: string }} [options]
 */
export function applyPayloadFocus(payloadId, currentLayerState = {}, options = {}) {
  const payload = getPayloadTypeById(payloadId);
  const build = PAYLOAD_LAYER_BUILDERS[payloadId];
  if (!payload || !build) return null;
  return {
    layerState: mergeFocus(currentLayerState, options.transportMode, build),
    statusMessage: `Payload focus: ${payload.label}`,
    plannedOnly: false,
  };
}
