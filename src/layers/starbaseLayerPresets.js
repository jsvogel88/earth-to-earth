/**
 * Starbase layer presets — non-breaking preview bundles for Visualization toggles.
 */

export const STARBASE_VISION_PREVIEW_KEYS = [
  'showStarbaseHubs',
  'showStarbaseLabels',
  'showPetabondExportPackages',
  'showStarbaseConnectivity',
];

export const STARBASE_VISION_PREVIEW_ON = {
  showStarbaseHubs: true,
  showStarbaseLabels: true,
  showPetabondExportPackages: true,
  showStarbaseConnectivity: true,
};

export const STARBASE_VISION_PREVIEW_OFF = {
  showStarbaseHubs: false,
  showStarbaseLabels: false,
  showPetabondExportPackages: false,
  showStarbaseConnectivity: false,
};

/** @param {Record<string, boolean>} layerState */
export function isStarbaseVisionPreviewActive(layerState) {
  return STARBASE_VISION_PREVIEW_KEYS.every((k) => layerState?.[k] === true);
}

/**
 * @param {Record<string, boolean>} layerState
 * @param {boolean} enabled
 */
export function applyStarbaseVisionPreview(layerState, enabled) {
  return {
    ...layerState,
    ...(enabled ? STARBASE_VISION_PREVIEW_ON : STARBASE_VISION_PREVIEW_OFF),
  };
}
