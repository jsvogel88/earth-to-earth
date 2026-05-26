/**
 * Planetary Transport OS — layer state defaults (delegates to layer registry).
 */

import { TRANSPORT_MODES, DEFAULT_TRANSPORT_MODE } from './transportOperatingSystem.js';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';

export const DEFAULT_MAP_DISPLAY_MODE = DEFAULT_TRANSPORT_MODE;

/** @typedef {ReturnType<typeof buildDefaultLayerState>} PlanningLayerState */

export const DEFAULT_PLANNING_LAYER_STATE = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);

export const DEFAULT_E2E_LAYER_STATE = buildDefaultLayerState(TRANSPORT_MODES.E2E_STARSHIP);

export const DEFAULT_HYPERLOOP_LAYER_STATE = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);

export const DEFAULT_E2M_LAYER_STATE = buildDefaultLayerState(TRANSPORT_MODES.E2M_ORBITAL);

export const DEFAULT_CIVILIZATION_LAYER_STATE = buildDefaultLayerState(TRANSPORT_MODES.CIVILIZATION_GRID);

export const DEFAULT_ROBOTAXI_LAYER_STATE = buildDefaultLayerState(TRANSPORT_MODES.ROBOTAXI);

export function layerDefaultsForTransportMode(mode) {
  return buildDefaultLayerState(mode);
}

/** Global demo: planning nodes visible from world zoom */
export const PLANNING_DEMO_MIN_ZOOM = 1;
