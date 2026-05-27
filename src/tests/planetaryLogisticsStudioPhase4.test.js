import { describe, it, expect } from 'vitest';
import { applyPlanetLogisticsFocus } from '../studio/planetLayerBridge.js';
import { getSimulationPresetById, SIMULATION_TIMELINE_PRESETS } from '../studio/simulationStudioBridge.js';
import { filterEdgesByPayloadFocus, getPayloadFilterFamilies } from '../studio/payloadRouteFilter.js';
import { applyViewModeFocus } from '../studio/viewModeBridge.js';
import { buildVersionCompareDetail } from '../studio/versionCompareDetail.js';
import { listOffWorldHubsForPlanet, STUDIO_PLANETS } from '../studio/registries/planetRegistry.js';
import { classifyRouteFamily, ROUTE_FAMILIES } from '../graph/classifyRouteFamily.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { saveStudioVersion } from '../studio/studioVersionStore.js';

describe('Planetary Logistics Studio Phase 4', () => {
  it('Mars planet focus applies million-people scenario layers', () => {
    const { layerState, missionModeId } = applyPlanetLogisticsFocus(STUDIO_PLANETS.MARS, {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(missionModeId).toBe('mars_civilization');
    expect(layerState.showStarbaseHubs).toBe(true);
  });

  it('lists off-world moon hubs in roster', () => {
    const moonHubs = listOffWorldHubsForPlanet(STUDIO_PLANETS.MOON);
    expect(moonHubs.length).toBeGreaterThan(0);
    expect(moonHubs.every((h) => h.lunar)).toBe(true);
  });

  it('simulation presets include 2075 multi-planetary', () => {
    const preset = getSimulationPresetById('multiplanetary_2075');
    expect(preset?.year).toBe(2075);
    expect(SIMULATION_TIMELINE_PRESETS).toHaveLength(5);
  });

  it('payload filter keeps E2E arcs for passengers', () => {
    const edges = [
      { id: 'a', mode: 'e2e_starship' },
      { id: 'b', mode: 'e2m' },
    ];
    const filtered = filterEdgesByPayloadFocus(edges, 'passengers', classifyRouteFamily);
    expect(filtered).toHaveLength(1);
    expect(classifyRouteFamily(filtered[0])).toBe(ROUTE_FAMILIES.E2E_GLOBAL_ARC);
  });

  it('earth globe view returns map pitch patch', () => {
    const result = applyViewModeFocus('earth_globe', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(result?.mapViewPatch?.pitch).toBeGreaterThan(0);
  });

  it('planet view navigates to planet tab', () => {
    const result = applyViewModeFocus('planet_view', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(result?.navigateTab).toBe('planet');
  });

  it('version compare detail includes before/after values', () => {
    const entry = saveStudioVersion({
      layerState: { showStarbaseHubs: false },
      studioState: {},
      label: 'Compare test',
    });
    const detail = buildVersionCompareDetail({ showStarbaseHubs: true }, entry.id);
    expect(detail.rows.some((r) => r.key === 'showStarbaseHubs')).toBe(true);
    expect(detail.rows[0].current).toBe(true);
    expect(detail.rows[0].saved).toBe(false);
  });

  it('payload filter families defined for petabond', () => {
    expect(getPayloadFilterFamilies('petabond_package')).toContain(ROUTE_FAMILIES.E2M_CARGO);
  });
});
