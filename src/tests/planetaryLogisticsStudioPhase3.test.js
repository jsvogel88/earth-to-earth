import { describe, it, expect } from 'vitest';
import {
  applyTransportModeFocus,
  applyHubTypeFocus,
  applyPayloadFocus,
} from '../studio/focusLayerBridge.js';
import { applyViewModeFocus } from '../studio/viewModeBridge.js';
import { applyStudioLayerQuickGroup, STUDIO_LAYER_QUICK_GROUPS } from '../studio/studioLayerQuickGroups.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { INTEGRATED_VIEW_FOCUS } from '../ui/integratedGridFilters.js';
import { getViewModeById } from '../studio/registries/viewModeRegistry.js';

describe('Planetary Logistics Studio Phase 3', () => {
  it('mode focus E2E emphasizes passenger arcs', () => {
    const { layerState, plannedOnly } = applyTransportModeFocus('e2e_passenger', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(plannedOnly).toBe(false);
    expect(layerState.showIntegratedE2E).toBe(true);
    expect(layerState.showIntegratedE2M).toBe(false);
    expect(layerState.integratedViewFocus).toBe(INTEGRATED_VIEW_FOCUS.E2E);
  });

  it('hub focus starbase enables vision layers', () => {
    const { layerState } = applyHubTypeFocus('starbase_launch', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(layerState.showStarbaseHubs).toBe(true);
    expect(layerState.showStarbaseConnectivity).toBe(true);
  });

  it('payload focus petabond enables export packages', () => {
    const { layerState } = applyPayloadFocus('petabond_package', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(layerState.showPetabondExportPackages).toBe(true);
  });

  it('infrastructure grid view applies full integrated preset', () => {
    const { layerState, plannedOnly } = applyViewModeFocus('infrastructure_grid', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(plannedOnly).toBe(false);
    expect(layerState.showIntegratedHyperloop).toBe(true);
    expect(layerState.integratedViewFocus).toBe(INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID);
  });

  it('scenario compare view is enabled and navigates to versions', () => {
    const view = getViewModeById('scenario_compare');
    expect(view?.plannedOnly).toBe(false);
    const { navigateTab } = applyViewModeFocus('scenario_compare', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(navigateTab).toBe('versions');
  });

  it('layer quick groups include starbase and re2e', () => {
    expect(STUDIO_LAYER_QUICK_GROUPS.map((g) => g.id)).toEqual(
      expect.arrayContaining(['starbase', 're2e', 'e2e'])
    );
    const { layerState } = applyStudioLayerQuickGroup('starbase', {});
    expect(layerState.showStarbaseHubs).toBe(true);
  });

  it('unwired mode returns plannedOnly without changing layers', () => {
    const before = { showIntegratedE2E: true };
    const result = applyTransportModeFocus('rail_freight', before, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(result?.plannedOnly).toBe(true);
    expect(result?.layerState).toBe(before);
  });
});
