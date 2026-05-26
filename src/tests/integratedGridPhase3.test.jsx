import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { DEFAULT_TRANSPORT_MODE } from '../data/transportOperatingSystem.js';
import {
  INTEGRATED_VIEW_FOCUS,
  INTEGRATED_VIEW_FOCUS_LABELS,
  getViewFocusLayerPatch,
  isNodeVisibleInIntegratedFilters,
  isEdgeVisibleInIntegratedFilters,
  filterIntegratedGraph,
} from '../ui/integratedGridFilters.js';
import { parseMineralSiteList } from '../features/parsing/mineralSiteMatcher.js';
import { DEFAULT_MINERAL_HUBS } from '../data/mineralHubs.js';
import { classifyCity } from '../modes/classifyLocation.js';
import { CURATED_NETWORK_CITIES } from '../data/worldCities.js';
import { buildPlanetaryHyperloopGraph } from '../graph/buildPlanetaryHyperloopGraph.js';
import { getMapRoiHubs } from '../data/worldCities.js';
import SelectedLocationPanel from '../components/pmos/SelectedLocationPanel.jsx';
import {
  resolveSelectedLocation,
  getConnectedEdgesForLocation,
  deriveDisplayModes,
} from '../ui/resolveSelectedLocation.js';
import { buildIntegratedTransportGraph } from '../hooks/useIntegratedTransportGraph.js';
import { MODE_TEST_CONTRACTS } from './modeTestContracts.js';

function sampleClassifiedCities() {
  return CURATED_NETWORK_CITIES.slice(0, 12).map((c) =>
    classifyCity({
      ...c,
      city_id: c.id,
      latitude: c.lat,
      longitude: c.lon,
    })
  );
}

function buildCheckpointGraph() {
  const cities = sampleClassifiedCities();
  const planetary = buildPlanetaryHyperloopGraph({
    activeE2EHubs: getMapRoiHubs().slice(0, 8),
    runConnectivityRepair: true,
  });
  return buildIntegratedTransportGraph({
    cities,
    mineralHubs: DEFAULT_MINERAL_HUBS,
    existingHyperloopGraph: planetary,
    layerState: buildDefaultLayerState(TRANSPORT_MODES.CIVILIZATION_GRID),
  });
}

describe('useIntegratedTransportGraph / buildIntegratedTransportGraph (Phase 3 checkpoint)', () => {
  it('returns nodes, edges, diagnostics, isReady, and visible filter views', () => {
    const graph = buildCheckpointGraph();
    expect(graph.isReady).toBe(true);
    expect(graph.error).toBeNull();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.diagnostics.totalNodes).toBe(graph.nodes.length);
    expect(graph.diagnostics.totalEdges).toBe(graph.edges.length);
    expect(graph.visibleNodes.length).toBeGreaterThan(0);
    expect(graph.visibleEdges.length).toBeGreaterThan(0);
    expect(graph.diagnostics.orphanMineralHubCount).toBe(0);
  });

  it('includes E2M route edges in the integrated graph', () => {
    const graph = buildCheckpointGraph();
    expect(graph.diagnostics.e2mRouteCount).toBeGreaterThan(0);
    const e2mEdges = graph.edges.filter((e) => e.mode === 'e2m');
    expect(e2mEdges.length).toBeGreaterThan(0);
    expect(e2mEdges.some((e) => ['feeder', 'resource', 'industrial'].includes(e.route_type))).toBe(
      true
    );
  });

  it('does not create auto intercity route edges', () => {
    const graph = buildCheckpointGraph();
    const autoEdges = graph.edges.filter((e) => e.mode === 'auto');
    expect(autoEdges.length).toBe(0);
  });

  it('returns safe empty graph on invalid input without throwing', () => {
    const graph = buildIntegratedTransportGraph({ cities: null, mineralHubs: null });
    expect(graph.isReady).toBe(true);
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
    expect(graph.diagnostics.warnings?.length).toBeGreaterThan(0);
  });
});

describe('Integrated Grid preset (Phase 3)', () => {
  it('defaults to Civilization / Integrated Grid transport mode', () => {
    expect(DEFAULT_TRANSPORT_MODE).toBe(TRANSPORT_MODES.CIVILIZATION_GRID);
  });

  it('Integrated Grid preset enables strategic modes together', () => {
    const preset = buildDefaultLayerState(TRANSPORT_MODES.CIVILIZATION_GRID);
    expect(preset.showIntegratedE2E).toBe(true);
    expect(preset.showIntegratedE2M).toBe(true);
    expect(preset.showIntegratedHyperloop).toBe(true);
    expect(preset.showIntegratedLoop).toBe(true);
    expect(preset.showIntegratedMineralHubs).toBe(true);
    expect(preset.showRobotaxiLayer).toBe(true);
    expect(preset.showPlanetarySkeleton).toBe(true);
  });

  it('view focus presets exist for integrated modes', () => {
    expect(INTEGRATED_VIEW_FOCUS_LABELS[INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID]).toBe(
      'Integrated Grid'
    );
    expect(INTEGRATED_VIEW_FOCUS_LABELS[INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL]).toBe(
      'Mining / E2M'
    );
    expect(INTEGRATED_VIEW_FOCUS_LABELS[INTEGRATED_VIEW_FOCUS.HYPERLOOP]).toBe('Hyperloop Spine');
  });
});

describe('integrated grid filters on real graph (Phase 3 checkpoint)', () => {
  const graph = buildCheckpointGraph();

  it('E2M filter returns mineral hubs and E2M edges only', () => {
    const { visibleNodes, visibleEdges } = filterIntegratedGraph(graph.nodes, graph.edges, {
      showE2MHubsOnly: true,
      showIntegratedE2M: true,
    });
    expect(visibleNodes.every((n) => n.mineral_hub_id)).toBe(true);
    expect(visibleNodes.length).toBeGreaterThan(0);
    expect(visibleEdges.every((e) => e.mode === 'e2m')).toBe(true);
  });

  it('1M+ filter excludes cities below 1M population', () => {
    const { visibleNodes } = filterIntegratedGraph(graph.nodes, graph.edges, {
      showPopulation1MPlusOnly: true,
    });
    const cityNodes = visibleNodes.filter((n) => !n.mineral_hub_id);
    expect(cityNodes.every((n) => (n.metro_population ?? n.population ?? 0) >= 1_000_000)).toBe(
      true
    );
    const visibleIds = new Set(visibleNodes.map((n) => n.id ?? n.city_id));
    expect(
      graph.nodes.some(
        (n) =>
          !n.mineral_hub_id &&
          (n.metro_population ?? n.population ?? 0) < 1_000_000 &&
          !visibleIds.has(n.id ?? n.city_id)
      )
    ).toBe(true);
  });

  it('feeder route filter returns feeder/resource/industrial edges', () => {
    const { visibleEdges } = filterIntegratedGraph(graph.nodes, graph.edges, {
      showFeederRoutesFilter: true,
      showIntegratedE2M: true,
    });
    const feederLike = visibleEdges.filter((e) =>
      ['feeder', 'resource', 'industrial'].includes(e.route_type)
    );
    expect(feederLike.length).toBeGreaterThan(0);
    const hidden = filterIntegratedGraph(graph.nodes, graph.edges, {
      showFeederRoutesFilter: false,
      showIntegratedE2M: true,
    });
    expect(hidden.visibleEdges.filter((e) => e.route_type === 'feeder').length).toBe(0);
  });

  it('auto filter does not surface auto intercity edges', () => {
    const { visibleEdges } = filterIntegratedGraph(graph.nodes, graph.edges, {
      showIntegratedAuto: true,
    });
    expect(visibleEdges.filter((e) => e.mode === 'auto').length).toBe(0);
  });

  it('does not mutate source graph arrays', () => {
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges.length;
    filterIntegratedGraph(graph.nodes, graph.edges, { showE2MHubsOnly: true });
    expect(graph.nodes.length).toBe(nodeCount);
    expect(graph.edges.length).toBe(edgeCount);
  });
});

describe('integrated grid filters (Phase 3 unit)', () => {
  const city1M = classifyCity({ name: 'Big City', country: 'XX', population: 2_000_000, lat: 0, lon: 0 });
  const citySmall = classifyCity({ name: 'Small', country: 'XX', population: 500_000, lat: 1, lon: 1 });
  const mineral = DEFAULT_MINERAL_HUBS[0];

  it('showE2EEligibleOnly filters non-eligible cities', () => {
    expect(isNodeVisibleInIntegratedFilters(city1M, { showE2EEligibleOnly: true })).toBe(true);
    expect(isNodeVisibleInIntegratedFilters(citySmall, { showE2EEligibleOnly: true })).toBe(false);
  });

  it('showE2M filters mineral hubs and edges', () => {
    expect(isNodeVisibleInIntegratedFilters(mineral, { showIntegratedE2M: true })).toBe(true);
    expect(isNodeVisibleInIntegratedFilters(mineral, { showIntegratedE2M: false })).toBe(false);
    expect(
      isEdgeVisibleInIntegratedFilters({ mode: 'e2m', route_type: 'feeder' }, { showIntegratedE2M: true })
    ).toBe(true);
  });

  it('getViewFocusLayerPatch returns mining/industrial E2M emphasis', () => {
    const patch = getViewFocusLayerPatch(INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL);
    expect(patch.showIntegratedE2M).toBe(true);
    expect(patch.showE2MHubsOnly).toBe(true);
  });
});

describe('SelectedLocationPanel with integrated graph (Phase 3 checkpoint)', () => {
  const graph = buildCheckpointGraph();
  const e2eCity = graph.nodes.find((n) => n.e2e_eligible && !n.mineral_hub_id && n.name);

  it('renders city modes and route counts from real connected edges', () => {
    const location = resolveSelectedLocation(e2eCity);
    const connectedEdges = getConnectedEdgesForLocation(location, graph.edges);
    expect(connectedEdges.length).toBeGreaterThan(0);

    render(
      <SelectedLocationPanel
        selectedLocation={location}
        integratedGraph={graph}
        connectedEdges={connectedEdges}
      />
    );

    expect(screen.getByText(location.name)).toBeTruthy();
    const modes = deriveDisplayModes(location, connectedEdges);
    if (location.e2e_eligible) expect(modes).toContain('e2e');
    if (location.auto_enabled) expect(modes).toContain('auto');
    const routeLine =
      screen.queryByTestId('route-count-e2e') ?? screen.queryByTestId('route-count-hyperloop');
    expect(routeLine).toBeTruthy();
  });

  it('renders mineral hub with real E2M feeder edges and nearest node fields', () => {
    const hubNode = graph.nodes.find((n) => n.mineral_hub_id && n.name === 'Mountain Pass') ??
      graph.nodes.find((n) => n.mineral_hub_id);
    const location = resolveSelectedLocation(hubNode);
    const connectedEdges = getConnectedEdgesForLocation(location, graph.edges);

    render(
      <SelectedLocationPanel
        selectedLocation={location}
        integratedGraph={graph}
        connectedEdges={connectedEdges}
      />
    );

    expect(screen.getByText(location.name)).toBeTruthy();
    expect(screen.getByText(/E2M Mineral Hub/i)).toBeTruthy();
    expect(connectedEdges.filter((e) => e.mode === 'e2m').length).toBeGreaterThan(0);
    if (location.nearest_support_city) {
      expect(screen.getByTestId('nearest-support-city').textContent).not.toMatch(/Not yet assigned/);
    }
  });
});

describe('SelectedLocationPanel (Phase 3)', () => {
  it('renders empty state when selectedLocation is null', () => {
    render(<SelectedLocationPanel selectedLocation={null} />);
    expect(screen.getByTestId('selected-location-panel-empty')).toBeTruthy();
  });

  it('handles missing nearest fields gracefully', () => {
    const hub = { ...DEFAULT_MINERAL_HUBS[0], nearest_support_city: null, nearest_port: null, nearest_e2e_hub: null };
    render(<SelectedLocationPanel selectedLocation={hub} allNodes={[]} />);
    expect(screen.getAllByText(/Not yet assigned/).length).toBe(3);
  });
});

describe('mode contract — E2M routes (Phase 3 checkpoint)', () => {
  it('E2M mode expects routes, not nodesOnly', () => {
    const e2m = MODE_TEST_CONTRACTS.find((c) => c.id === 'mode_e2m_orbital');
    expect(e2m?.expectedGraphBehavior).toBe('routes');
    expect(e2m?.createsIntercityEdges).toBe(true);
  });

  it('Auto / robotaxi remains overlay-only without intercity edges', () => {
    const auto = MODE_TEST_CONTRACTS.find((c) => c.id === 'mode_robotaxi');
    expect(auto?.expectedGraphBehavior).toBe('overlayOnly');
    expect(auto?.createsIntercityEdges).toBe(false);
  });
});

describe('mineralSiteMatcher (Phase 3)', () => {
  it('matches exact mineral hub name', () => {
    const { matched } = parseMineralSiteList('Mountain Pass');
    expect(matched.length).toBe(1);
    expect(matched[0].matchedHubId).toContain('mountain-pass');
  });

  it('returns unresolved for unknown sites', () => {
    const { unresolved } = parseMineralSiteList('Totally Fake Mine XYZ');
    expect(unresolved.length).toBe(1);
    expect(unresolved[0].status).toBe('unresolved');
  });
});
