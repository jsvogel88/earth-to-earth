import { describe, it, expect } from 'vitest';
import { filterIntegratedGraph } from '../graph/integratedGridFilters.js';
import { buildIntegratedTransportGraph } from '../hooks/useIntegratedTransportGraph.js';
import { DEFAULT_MINERAL_HUBS } from '../data/mineralHubs.js';
import { classifyCity } from '../modes/classifyLocation.js';
import { ZOOM_TIERS, getZoomTier } from '../modes/zoomVisibility.js';
import { buildRouteTooltipHtml } from '../utils/routeTooltip.js';

function buildGraph() {
  const cities = [
    classifyCity({
      id: 'net:test:alpha',
      name: 'Alpha Metro',
      country: 'XX',
      population: 2_500_000,
      lat: 40.7,
      lon: -74,
    }),
    classifyCity({
      id: 'net:test:gamma',
      name: 'Gamma Metro',
      country: 'XX',
      population: 3_000_000,
      lat: 51.5,
      lon: -0.1,
    }),
    classifyCity({
      id: 'net:test:beta',
      name: 'Beta City',
      country: 'XX',
      population: 800_000,
      lat: 34,
      lon: -118,
    }),
  ];
  return buildIntegratedTransportGraph({
    cities,
    mineralHubs: DEFAULT_MINERAL_HUBS.slice(0, 8),
    existingHyperloopGraph: null,
  });
}

describe('integratedGridFilters + zoom (Phase 4)', () => {
  const graph = buildGraph();

  it('E2E filter returns e2e edges only', () => {
    const { visibleEdges } = filterIntegratedGraph({
      nodes: graph.nodes,
      edges: graph.edges,
      activeFilters: {
        showIntegratedE2E: true,
        showIntegratedE2M: false,
        showIntegratedLoop: false,
        showIntegratedHyperloop: false,
      },
      zoom: 5,
    });
    expect(visibleEdges.length).toBeGreaterThan(0);
    expect(visibleEdges.every((e) => e.mode === 'e2e')).toBe(true);
  });

  it('E2M filter returns mineral hubs and e2m edges', () => {
    const { visibleNodes, visibleEdges } = filterIntegratedGraph({
      nodes: graph.nodes,
      edges: graph.edges,
      activeFilters: { showE2MHubsOnly: true, showIntegratedE2M: true },
      zoom: 5,
    });
    expect(visibleNodes.every((n) => n.mineral_hub_id)).toBe(true);
    expect(visibleEdges.every((e) => e.mode === 'e2m')).toBe(true);
  });

  it('feeder filter includes feeder/resource/industrial edges', () => {
    const { visibleEdges } = filterIntegratedGraph({
      nodes: graph.nodes,
      edges: graph.edges,
      activeFilters: { showFeederRoutesFilter: true, showIntegratedE2M: true },
      zoom: 6,
    });
    const feederLike = visibleEdges.filter((e) =>
      ['feeder', 'resource', 'industrial'].includes(e.route_type)
    );
    expect(feederLike.length).toBeGreaterThan(0);
  });

  it('global zoom reduces edge density vs local zoom', () => {
    const global = filterIntegratedGraph({
      nodes: graph.nodes,
      edges: graph.edges,
      activeFilters: {
        showIntegratedE2E: true,
        showIntegratedE2M: true,
        showIntegratedLoop: true,
      },
      zoom: 1,
    });
    const local = filterIntegratedGraph({
      nodes: graph.nodes,
      edges: graph.edges,
      activeFilters: {
        showIntegratedE2E: true,
        showIntegratedE2M: true,
        showIntegratedLoop: true,
      },
      zoom: 12,
    });
    expect(global.zoomTier).toBe(ZOOM_TIERS.GLOBAL);
    expect(getZoomTier(12)).toBe(ZOOM_TIERS.LOCAL);
    expect(local.visibleEdges.length).toBeGreaterThanOrEqual(global.visibleEdges.length);
  });

  it('auto filter does not add auto route edges', () => {
    const { visibleEdges } = filterIntegratedGraph({
      nodes: graph.nodes,
      edges: graph.edges,
      activeFilters: { showIntegratedAuto: true },
      zoom: 10,
    });
    expect(visibleEdges.filter((e) => e.mode === 'auto').length).toBe(0);
  });
});

describe('integrated route tooltip (Phase 4)', () => {
  it('builds tooltip html for integrated edges', () => {
    const html = buildRouteTooltipHtml({
      mode: 'e2m',
      route_type: 'feeder',
      fromName: 'Mountain Pass',
      toName: 'Los Angeles',
      distance_km: 420,
      priority_score: 0.7,
      corridor_type: 'resource',
    });
    expect(html).toContain('E2M');
    expect(html).toContain('Mountain Pass');
  });
});
