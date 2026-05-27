import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  buildLayerStateForScenario,
  buildLayerStateForMissionMode,
  MISSION_MODE_SCENARIO_ID,
} from '../studio/scenarioLayerEngine.js';
import { applyManufacturingPackageToLayerState } from '../studio/manufacturingLayerBridge.js';
import { resolveCopilotPrompt } from '../studio/copilotActions.js';
import {
  saveStudioVersion,
  listStudioVersions,
  diffLayerStateAgainstVersion,
} from '../studio/studioVersionStore.js';
import MissionCopilotPanel from '../studio/panels/MissionCopilotPanel.jsx';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';

describe('Planetary Logistics Studio Phase 2', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('PetaBond scenario enables Starbase and PETABOND layers', () => {
    const { layerState } = buildLayerStateForScenario('petabond-export-package', {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(layerState.showStarbaseHubs).toBe(true);
    expect(layerState.showPetabondExportPackages).toBe(true);
    expect(layerState.missionModeId).toBeUndefined();
  });

  it('Mars civilization scenario sets RE2E-oriented view focus', () => {
    const { layerState, missionModeId } = buildLayerStateForScenario('mars-civilization-network', {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(missionModeId).toBe('mars_civilization');
    expect(layerState.showIntegratedE2M).toBe(true);
    expect(layerState.showStarbaseConnectivity).toBe(true);
  });

  it('earth passenger mission mode emphasizes E2E', () => {
    const { layerState } = buildLayerStateForMissionMode('earth_passenger', {
      transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    });
    expect(layerState.showIntegratedE2E).toBe(true);
    expect(layerState.showIntegratedE2M).toBe(false);
  });

  it('manufacturing petabond package applies starbase vision', () => {
    const result = applyManufacturingPackageToLayerState('petabond', {});
    expect(result?.layerState.showPetabondExportPackages).toBe(true);
    expect(result?.layerState.showStarbaseHubs).toBe(true);
  });

  it('copilot resolves Mars million prompt to scenario action', () => {
    const { action } = resolveCopilotPrompt('Build a Mars logistics scenario for 1 million people');
    expect(action?.type).toBe('apply_scenario');
    expect(action?.scenarioId).toBe('million-people-to-mars');
  });

  it('copilot cargo prompt maps to earth cargo mission', () => {
    const { action } = resolveCopilotPrompt('show only cargo routes');
    expect(action?.type).toBe('apply_mission');
    expect(action?.missionModeId).toBe('earth_cargo');
  });

  it('mission mode maps to scenario ids', () => {
    expect(MISSION_MODE_SCENARIO_ID.petabond_export).toBe('petabond-export-package');
    expect(MISSION_MODE_SCENARIO_ID.mars_civilization).toBe('mars-civilization-network');
  });

  it('version store saves and diffs layer state', () => {
    const base = { showIntegratedE2E: true, showStarbaseHubs: false };
    const entry = saveStudioVersion({
      layerState: base,
      studioState: { activeScenarioId: 'current-default-network', missionModeId: 'current_default' },
      label: 'Test snapshot',
    });
    expect(entry.id).toMatch(/^v-/);
    expect(listStudioVersions()).toHaveLength(1);
    const diff = diffLayerStateAgainstVersion({ ...base, showStarbaseHubs: true }, entry.id);
    expect(diff.changedKeys).toContain('showStarbaseHubs');
  });

  it('Mission Copilot enables Apply to Map when action exists', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<MissionCopilotPanel onApplyCopilotAction={onApply} />);
    await user.click(screen.getByRole('button', { name: /PETABOND deployment/i }));
    const applyBtn = screen.getByTestId('copilot-apply-map');
    expect(applyBtn).not.toBeDisabled();
    await user.click(applyBtn);
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'apply_scenario', scenarioId: 'petabond-export-package' })
    );
  });
});
