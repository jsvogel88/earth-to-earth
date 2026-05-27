/**
 * Maps manufacturing package selection → safe layerState toggles (existing layers only).
 */

import { getManufacturingPackageById } from './registries/manufacturingPackageRegistry.js';
import { applyStarbaseVisionPreview } from '../layers/starbaseLayerPresets.js';
import { INTEGRATED_VIEW_FOCUS, getViewFocusLayerPatch } from '../ui/integratedGridFilters.js';

/** @type {Record<string, { layerPatch: object, starbaseVision?: boolean, integratedViewFocus?: string }>} */
const PACKAGE_LAYER_PROFILES = {
  kilaplant: {
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showIntegratedE2M: true,
      showIntegratedMineralHubs: true,
      showIntegratedE2E: false,
      showIntegratedLoop: false,
    },
  },
  megaline: {
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.HYPERLOOP,
    layerPatch: {
      showIntegratedHyperloop: true,
      showIntegratedE2M: true,
      showIntegratedLoop: true,
    },
  },
  gigafactory: {
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showIntegratedE2M: true,
      showIntegratedHyperloop: true,
      showIntegratedMineralHubs: true,
      showRemoteCargoRoutes: false,
    },
  },
  terafab: {
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showIntegratedE2M: true,
      showIntegratedHyperloop: true,
      showIntegratedMineralHubs: true,
    },
    starbaseVision: true,
  },
  petabond: {
    integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
    layerPatch: {
      showIntegratedE2M: true,
      showIntegratedHyperloop: true,
      showIntegratedMineralHubs: true,
      showRemoteCargoRoutes: false,
    },
    starbaseVision: true,
  },
};

/**
 * @param {string} packageId
 * @param {object} currentLayerState
 */
export function applyManufacturingPackageToLayerState(packageId, currentLayerState = {}) {
  const pkg = getManufacturingPackageById(packageId);
  if (!pkg) return null;

  const profile = PACKAGE_LAYER_PROFILES[packageId] ?? { layerPatch: {} };
  const focus = profile.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.E2M;

  let layerState = {
    ...currentLayerState,
    ...getViewFocusLayerPatch(focus),
    ...(profile.layerPatch ?? {}),
    integratedViewFocus: focus,
  };

  for (const key of pkg.defaultLayers ?? []) {
    layerState[key] = true;
  }

  if (profile.starbaseVision) {
    layerState = applyStarbaseVisionPreview(layerState, true);
  }

  return {
    package: pkg,
    layerState,
    statusMessage: pkg.plannedOnly
      ? `${pkg.label} — registry preview (limited map layers)`
      : `${pkg.label} — map layers updated`,
  };
}
