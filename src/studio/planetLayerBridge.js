/**
 * Planet context → layer profiles (Earth logistics on 2D map; Moon/Mars emphasize export corridors).
 */

import { STUDIO_PLANETS } from './registries/planetRegistry.js';
import { buildLayerStateForScenario } from './scenarioLayerEngine.js';
import { applyStarbaseVisionPreview } from '../layers/starbaseLayerPresets.js';
import {
  INTEGRATED_VIEW_FOCUS,
  getViewFocusLayerPatch,
} from '../ui/integratedGridFilters.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';

/**
 * @param {string} planetId
 * @param {object} currentLayerState
 * @param {{ transportMode?: string }} [options]
 */
export function applyPlanetLogisticsFocus(planetId, currentLayerState = {}, options = {}) {
  const transportMode = options.transportMode ?? TRANSPORT_MODES.CIVILIZATION_GRID;

  switch (planetId) {
    case STUDIO_PLANETS.EARTH: {
      const built = buildLayerStateForScenario('current-default-network', { transportMode });
      return {
        layerState: built.layerState,
        statusMessage: 'Planet: Earth — full integrated grid',
        missionModeId: 'current_default',
      };
    }
    case STUDIO_PLANETS.MOON: {
      const built = buildLayerStateForScenario('mars-civilization-network', { transportMode });
      let layerState = {
        ...built.layerState,
        ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
        integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
      };
      layerState = applyStarbaseVisionPreview(layerState, true);
      return {
        layerState,
        statusMessage: 'Planet: Moon — E2M export + Starbase staging (Earth map)',
        missionModeId: 'moon_logistics',
      };
    }
    case STUDIO_PLANETS.MARS: {
      const built = buildLayerStateForScenario('million-people-to-mars', { transportMode });
      return {
        layerState: built.layerState,
        statusMessage: 'Planet: Mars — long-horizon passenger + industrial buildout profile',
        missionModeId: 'mars_civilization',
      };
    }
    default:
      return null;
  }
}
