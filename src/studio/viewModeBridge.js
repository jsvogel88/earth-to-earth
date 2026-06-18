/**
 * Studio view mode → layer / UI behavior (Earth Map, Infrastructure Grid, Compare).
 */

import {
  INTEGRATED_GRID_PRESET,
  INTEGRATED_VIEW_FOCUS,
  getViewFocusLayerPatch,
} from '../ui/integratedGridFilters.js';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { getViewModeById } from './registries/viewModeRegistry.js';
import { STUDIO_TABS } from './registries/studioTabs.js';
import { applyManufacturingPackageToLayerState } from './manufacturingLayerBridge.js';
import { buildLayerStateForScenario } from './scenarioLayerEngine.js';
import { SIMULATION_MODES } from '../simulation/simulationModes.js';

/**
 * @param {string} viewModeId
 * @param {object} currentLayerState
 * @param {{ transportMode?: string }} [options]
 */
export function applyViewModeFocus(viewModeId, currentLayerState = {}, options = {}) {
  const view = getViewModeById(viewModeId);
  if (!view) return null;

  if (view.plannedOnly) {
      return {
        layerState: currentLayerState,
        statusMessage: `${view.label} — planned view (not available yet)`,
        plannedOnly: true,
        navigateTab: null,
        mapViewPatch: null,
      };
  }

  const transportMode = options.transportMode ?? TRANSPORT_MODES.CIVILIZATION_GRID;

  switch (viewModeId) {
    case 'earth_map':
      return {
        layerState: currentLayerState,
        statusMessage: 'View: Earth Map',
        plannedOnly: false,
        navigateTab: null,
        mapViewPatch: null,
      };
    case 'infrastructure_grid': {
      const base =
        transportMode === TRANSPORT_MODES.CIVILIZATION_GRID
          ? { ...buildDefaultLayerState(transportMode), ...INTEGRATED_GRID_PRESET }
          : { ...currentLayerState };
      return {
        layerState: {
          ...base,
          ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID),
          integratedViewFocus: INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID,
        },
        statusMessage: 'View: Infrastructure Grid — full integrated stack visible',
        plannedOnly: false,
        navigateTab: null,
        mapViewPatch: null,
      };
    }
    case 'scenario_compare':
      return {
        layerState: currentLayerState,
        statusMessage: 'View: Scenario Compare — use Versions tab to diff snapshots',
        plannedOnly: false,
        navigateTab: STUDIO_TABS.VERSIONS,
        mapViewPatch: null,
      };
    case 'planet_view':
      return {
        layerState: currentLayerState,
        statusMessage: 'View: Planet — open Planet tab for Moon/Mars logistics',
        plannedOnly: false,
        navigateTab: STUDIO_TABS.PLANET,
        mapViewPatch: null,
      };
    case 'earth_globe':
      return {
        layerState: currentLayerState,
        statusMessage: 'View: Earth Globe — elevated map perspective',
        plannedOnly: false,
        navigateTab: null,
        mapViewPatch: { pitch: 50, bearing: 8 },
      };
    case 'payload_flow': {
      const base =
        transportMode === TRANSPORT_MODES.CIVILIZATION_GRID
          ? { ...buildDefaultLayerState(transportMode), ...INTEGRATED_GRID_PRESET }
          : { ...currentLayerState };
      return {
        layerState: {
          ...base,
          ...getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.E2M),
          showTrafficFlow: true,
          integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2M,
          re2eCorridorFilter: 'resource',
          showFeederRoutesFilter: true,
        },
        statusMessage: 'View: Payload Flow — RE2E resource corridors + flow overlay',
        plannedOnly: false,
        navigateTab: STUDIO_TABS.PAYLOADS,
        mapViewPatch: null,
        simulationModeOverride: SIMULATION_MODES.CARGO,
        payloadFilterActive: Boolean(options.payloadId),
      };
    }
    case 'manufacturing_flow': {
      const mfg = applyManufacturingPackageToLayerState('terafab', currentLayerState) ?? {
        layerState: currentLayerState,
      };
      return {
        layerState: {
          ...mfg.layerState,
          showTrafficFlow: true,
          showIntermodalHubHalos: true,
          re2eCorridorFilter: 'industrial',
          showFeederRoutesFilter: true,
        },
        statusMessage: 'View: Manufacturing Flow — RE2E industrial corridors + TeraFab',
        plannedOnly: false,
        navigateTab: STUDIO_TABS.MANUFACTURING,
        mapViewPatch: null,
        simulationModeOverride: SIMULATION_MODES.CARGO,
        selectedManufacturingPackageId: 'terafab',
      };
    }
    case 'launch_window': {
      const built = buildLayerStateForScenario('million-people-to-mars', { transportMode });
      return {
        layerState: built.layerState,
        statusMessage: 'View: Launch Window — Mars buildout + Starbase staging profile',
        plannedOnly: false,
        navigateTab: STUDIO_TABS.PLANET,
        mapViewPatch: null,
        simulationYear: 2050,
        missionModeId: 'mars_civilization',
        activePlanetId: 'mars',
      };
    }
    default:
      return {
        layerState: currentLayerState,
        statusMessage: `View: ${view.label}`,
        plannedOnly: false,
        navigateTab: null,
        mapViewPatch: null,
      };
  }
}
