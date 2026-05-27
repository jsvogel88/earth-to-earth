import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_STUDIO_TAB, STUDIO_TABS } from '../studio/registries/studioTabs.js';
import { getManufacturingPackagesByScale } from '../studio/registries/manufacturingPackageRegistry.js';
import { SCENARIOS, getScenarioById } from '../studio/registries/scenarioRegistry.js';
import { createDefaultStudioState } from '../studio/useStudioState.js';
import LogisticsStudioSidebar from '../studio/LogisticsStudioSidebar.jsx';
import TopMissionBar from '../studio/TopMissionBar.jsx';
import VisionPanel from '../studio/panels/VisionPanel.jsx';
import { formatModeLabelForUI } from '../ui/re2eDisplayLabels.js';

describe('Planetary Logistics Studio Phase 1', () => {
  it('defaults to Vision tab', () => {
    expect(DEFAULT_STUDIO_TAB).toBe(STUDIO_TABS.VISION);
    expect(createDefaultStudioState().activeTab).toBe(STUDIO_TABS.VISION);
  });

  it('manufacturing ladder has 5 scale levels', () => {
    const pkgs = getManufacturingPackagesByScale();
    expect(pkgs).toHaveLength(5);
    expect(pkgs[0].label).toBe('KilaPlant');
    expect(pkgs[4].label).toBe('PetaBond');
  });

  it('scenario registry includes Mars and PetaBond presets', () => {
    expect(getScenarioById('mars-civilization-network')).toBeTruthy();
    expect(getScenarioById('petabond-export-package')).toBeTruthy();
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(8);
  });

  it('RE2E display label maps e2m mode', () => {
    expect(formatModeLabelForUI('e2m')).toBe('RE2E');
  });

  it('Vision panel navigates to modes tab', async () => {
    const user = userEvent.setup();
    const onNavigateTab = vi.fn();
    render(<VisionPanel onNavigateTab={onNavigateTab} />);
    await user.click(screen.getByRole('button', { name: /Transportation Modes/i }));
    expect(onNavigateTab).toHaveBeenCalledWith(STUDIO_TABS.MODES);
  });

  it('sidebar renders Vision by default and switches tabs', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <LogisticsStudioSidebar
        activeTab={STUDIO_TABS.VISION}
        onTabChange={onTabChange}
        studioState={createDefaultStudioState()}
        layersPanel={<div data-testid="layers-embed">layers</div>}
      />
    );
    expect(screen.getByTestId('studio-vision-panel')).toBeInTheDocument();
    await user.click(screen.getByTestId('studio-tab-modes'));
    expect(onTabChange).toHaveBeenCalledWith(STUDIO_TABS.MODES);
  });

  it('TopMissionBar renders studio title', () => {
    render(
      <TopMissionBar
        activeScenarioId="current-default-network"
        missionModeId="current_default"
        viewModeId="earth_map"
      />
    );
    expect(screen.getByText(/Planetary Logistics Studio/i)).toBeInTheDocument();
  });
});
