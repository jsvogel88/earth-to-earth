import { describe, it, expect, beforeEach } from 'vitest';
import { buildMissionPackageExport } from '../studio/studioMissionExport.js';
import { saveStudioSession, loadStudioSession, clearStudioSession } from '../studio/studioSessionStore.js';
import { diffScenarioAgainstCurrent } from '../studio/scenarioCompareEngine.js';
import { pushCopilotHistory, listCopilotHistory, clearCopilotHistory } from '../studio/copilotHistoryStore.js';
import { applyViewModeFocus } from '../studio/viewModeBridge.js';
import { getViewModeById } from '../studio/registries/viewModeRegistry.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';

describe('Planetary Logistics Studio Phase 5', () => {
  beforeEach(() => {
    localStorage.clear();
    clearCopilotHistory();
    clearStudioSession();
  });

  it('builds mission package export', () => {
    const pkg = buildMissionPackageExport({
      studioState: { activeScenarioId: 'petabond-export-package', missionModeId: 'petabond_export' },
      layerState: { showStarbaseHubs: true },
      simulationYear: 2050,
    });
    expect(pkg.type).toBe('planetary-logistics-studio-mission-package');
    expect(pkg.scenarioId).toBe('petabond-export-package');
    expect(pkg.simulationYear).toBe(2050);
  });

  it('session store round-trips', () => {
    saveStudioSession({
      layerState: { showIntegratedE2E: true },
      studioState: { activeScenarioId: 'current-default-network' },
      simulationYear: 2030,
    });
    const loaded = loadStudioSession();
    expect(loaded?.simulationYear).toBe(2030);
    expect(loaded?.layerState.showIntegratedE2E).toBe(true);
  });

  it('diffs scenario against current layers', () => {
    const { scenario, changedKeys } = diffScenarioAgainstCurrent(
      'mars-civilization-network',
      { showIntegratedE2E: true, showIntegratedE2M: false },
      { transportMode: TRANSPORT_MODES.CIVILIZATION_GRID }
    );
    expect(scenario?.id).toBe('mars-civilization-network');
    expect(changedKeys.length).toBeGreaterThan(0);
  });

  it('payload flow view enables traffic overlay', () => {
    const result = applyViewModeFocus('payload_flow', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(result?.layerState.showTrafficFlow).toBe(true);
    expect(getViewModeById('payload_flow')?.plannedOnly).toBe(false);
  });

  it('launch window view sets mars profile and 2050', () => {
    const result = applyViewModeFocus('launch_window', {}, {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(result?.simulationYear).toBe(2050);
    expect(result?.activePlanetId).toBe('mars');
  });

  it('copilot history stores prompts', () => {
    pushCopilotHistory('Build Mars logistics', 'ok');
    expect(listCopilotHistory()).toHaveLength(1);
    expect(listCopilotHistory()[0].prompt).toContain('Mars');
  });
});
