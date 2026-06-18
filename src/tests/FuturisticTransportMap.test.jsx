import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TransportControlPanel from '../components/TransportControlPanel.jsx';
import GroupedLegend from '../components/GroupedLegend.jsx';
import App from '../App.jsx';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { buildDefaultLayerState, GROUP_SECTION_TITLES } from '../layers/layerRegistry.js';

const mockHubs = [
  {
    id: 'net:new-york|usa',
    name: 'New York',
    country: 'USA',
    lat: 40.7128,
    lon: -74.006,
    population: 8_000_000,
  },
];

vi.mock('../hooks/useE2EHubRegistry.js', () => ({
  useE2EHubRegistry: () => ({
    activeHubIds: [mockHubs[0].id],
    activeHubs: mockHubs,
    hubFilter: {},
    setHubFilter: vi.fn(),
    candidateCities: [],
    addHub: vi.fn(),
    removeHub: vi.fn(),
    resetToCurated: vi.fn(),
    savePreset: vi.fn(),
    applyPreset: vi.fn(),
    allPresets: [],
    isHubActive: () => true,
  }),
}));

vi.mock('../hooks/useCustomDestinations.js', () => ({
  useCustomDestinations: () => ({
    destinations: [],
    lastAdded: null,
    add: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
    refresh: vi.fn(),
  }),
}));

function renderControlPanel(overrides = {}) {
  const layerState = buildDefaultLayerState(TRANSPORT_MODES.E2E_STARSHIP);
  const setLayerFlag = vi.fn((key, value) => {
    layerState[key] = value;
  });
  return render(
    <TransportControlPanel
      mapDisplayMode={TRANSPORT_MODES.E2E_STARSHIP}
      onMapModeChange={vi.fn()}
      layerState={layerState}
      setLayerFlag={setLayerFlag}
      resetView={vi.fn()}
      metricsCollapsed={false}
      onToggleMetricsCollapsed={vi.fn()}
      hyperloopWebHelper="test helper"
      extendedRuralHelper="rural helper"
      zoom={5}
      remoteVisibleMinZoom={4}
      {...overrides}
    />
  );
}

describe('TransportControlPanel / sidebar', () => {
  it('renders Transport Modes section', () => {
    renderControlPanel();
    expect(screen.getByText(GROUP_SECTION_TITLES.TRANSPORT_MODES)).toBeInTheDocument();
  });

  it('can select E2E and Hyperloop Web modes', async () => {
    const user = userEvent.setup();
    const onMapModeChange = vi.fn();
    renderControlPanel({ onMapModeChange });
    await user.click(screen.getByTestId('mode-btn-mode_hyperloop_core'));
    expect(onMapModeChange).toHaveBeenCalledWith(TRANSPORT_MODES.HYPERLOOP_CORE);
    await user.click(screen.getByTestId('mode-btn-mode_e2e_starship'));
    expect(onMapModeChange).toHaveBeenCalledWith(TRANSPORT_MODES.E2E_STARSHIP);
  });

  it('shows Infrastructure section when Hyperloop mode active', () => {
    renderControlPanel({ mapDisplayMode: TRANSPORT_MODES.HYPERLOOP_CORE });
    expect(screen.getByText(/Infrastructure Layers/i)).toBeInTheDocument();
  });

  it('toggles Robotaxi layer in autonomous mobility group', async () => {
    const user = userEvent.setup();
    const setLayerFlag = vi.fn();
    const layerState = buildDefaultLayerState(TRANSPORT_MODES.ROBOTAXI);
    render(
      <TransportControlPanel
        mapDisplayMode={TRANSPORT_MODES.ROBOTAXI}
        onMapModeChange={vi.fn()}
        layerState={layerState}
        setLayerFlag={setLayerFlag}
        resetView={vi.fn()}
        metricsCollapsed={false}
        onToggleMetricsCollapsed={vi.fn()}
        hyperloopWebHelper=""
        extendedRuralHelper=""
        zoom={5}
        remoteVisibleMinZoom={4}
      />
    );
    const toggle = screen.getByTestId('layer-toggle-showRobotaxiLayer');
    await user.click(toggle);
    expect(setLayerFlag).toHaveBeenCalled();
  });
});

describe('GroupedLegend', () => {
  it('renders grouped legend categories for E2E mode', () => {
    render(
      <GroupedLegend
        mapDisplayMode={TRANSPORT_MODES.E2E_STARSHIP}
        layerState={buildDefaultLayerState(TRANSPORT_MODES.E2E_STARSHIP)}
        hyperloopWebHelper=""
      />
    );
    expect(screen.getByText(/Passenger — E2E Starship/i)).toBeInTheDocument();
  });
});

describe('App + FuturisticTransportMap integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('app renders without crashing', async () => {
    render(<App />);
    expect(await screen.findByTestId('pmos-shell')).toBeInTheDocument();
    expect(screen.getByTestId('pmos-command-bar')).toBeInTheDocument();
    expect(screen.getByTestId('pmos-global-search')).toBeInTheDocument();
  });

  it('map root and container render', async () => {
    render(<App />);
    expect(await screen.findByTestId('transport-map-root')).toBeInTheDocument();
    expect(screen.getByTestId('transport-map-container')).toBeInTheDocument();
  });

  it('command bar modes, dock layers, and legend survive multi-toggle', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('transport-map-root');
    await user.click(screen.getByTestId('pmos-mode-mode_hyperloop_core'));
    await user.click(screen.getByTestId('pmos-mode-mode_e2e_starship'));
    expect(await screen.findByTestId('studio-primary-sidebar')).toBeInTheDocument();
    expect(await screen.findByTestId('logistics-studio-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('studio-vision-panel')).toBeInTheDocument();
    await user.click(screen.getByTestId('studio-tab-layers'));
    const panel = await screen.findByTestId('transport-control-panel');
    const rareEarth = within(panel).queryByTestId('layer-toggle-showRareEarthHubs');
    if (rareEarth) await user.click(rareEarth);
    await user.click(screen.getByText('Legend +'));
    expect(screen.getByTestId('transport-map-root')).toBeInTheDocument();
    expect(screen.getByTestId('grouped-legend')).toBeInTheDocument();
  });
});
