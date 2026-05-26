import { describe, it, expect } from 'vitest';
import {
  generateIntegratedRoutes,
  generateE2ERoutes,
  generateE2MRoutes,
  generateLoopRegionalRoutes,
  isE2EHubNode,
  deduplicateEdges,
  findDuplicateEdges,
  findOrphanMineralHubs,
  auditGraphIntegrity,
  integratedEdgeKey,
  createIntegratedEdge,
  EDGE_MODES,
  EDGE_TYPES,
} from '../graph/index.js';
import { classifyCity } from '../modes/classifyLocation.js';
import { DEFAULT_MINERAL_HUBS } from '../data/mineralHubs.js';
import { CURATED_NETWORK_CITIES } from '../data/worldCities.js';
import { buildPlanetaryHyperloopGraph } from '../graph/buildPlanetaryHyperloopGraph.js';
import { getMapRoiHubs } from '../data/worldCities.js';
import { findNearest, hasNodeCoordinates } from '../graph/index.js';

function sampleCities() {
  return CURATED_NETWORK_CITIES.map((c) =>
    classifyCity({
      ...c,
      city_id: c.id,
      latitude: c.lat,
      longitude: c.lon,
    })
  );
}

describe('geoDistance (Phase 2)', () => {
  it('hasNodeCoordinates detects valid lat/lon', () => {
    expect(hasNodeCoordinates({ lat: 10, lon: 20 })).toBe(true);
    expect(hasNodeCoordinates({ latitude: 10, longitude: 20 })).toBe(true);
    expect(hasNodeCoordinates({ lat: null, lon: 20 })).toBe(false);
  });

  it('findNearest ignores origin when IDs match', () => {
    const city = { id: 'net:test:xx', lat: 0, lon: 0 };
    const result = findNearest(city, [city, { id: 'net:other:xx', lat: 1, lon: 1 }], {
      originId: 'net:test:xx',
    });
    expect(result?.node.id).toBe('net:other:xx');
  });
});

describe('integratedGraphTypes (Phase 2)', () => {
  it('createIntegratedEdge produces deterministic ids', () => {
    const edge = createIntegratedEdge({
      origin: 'a',
      destination: 'b',
      mode: 'e2e',
      route_type: 'global',
      corridor_type: 'passenger',
    });
    expect(edge.id).toBe(integratedEdgeKey('a', 'b', 'e2e', 'global'));
    expect(edge.mode).toBe('e2e');
    expect(edge.origin_id).toBe('a');
    expect(edge.destination_id).toBe('b');
  });

  it('createIntegratedEdge rejects same origin and destination', () => {
    expect(
      createIntegratedEdge({
        origin: 'a',
        destination: 'a',
        mode: 'e2e',
        route_type: 'global',
      })
    ).toBeNull();
  });
});

describe('generateE2ERoutes (Phase 2)', () => {
  const cities = sampleCities();
  const e2eHubs = cities.filter((c) => c.e2e_eligible);

  it('only uses E2E eligible hubs', () => {
    const routes = generateE2ERoutes(cities, { maxPairs: 50 });
    expect(routes.length).toBeGreaterThan(0);
    routes.forEach((r) => {
      expect(r.mode).toBe('e2e');
      expect(r.route_type).toBe('global');
    });
    const hubIds = new Set(e2eHubs.map((h) => h.id));
    routes.forEach((r) => {
      expect(hubIds.has(r.origin_id) || hubIds.has(r.destination_id)).toBe(true);
    });
  });

  it('avoids duplicate A/B pairs', () => {
    const routes = generateE2ERoutes(e2eHubs, { maxPairs: 100 });
    const pairKeys = routes.map((r) => [r.origin_id, r.destination_id].sort().join('__'));
    expect(new Set(pairKeys).size).toBe(pairKeys.length);
  });

  it('respects maxPairs', () => {
    const routes = generateE2ERoutes(e2eHubs, { maxPairs: 5 });
    expect(routes.length).toBeLessThanOrEqual(5);
  });

  it('skips missing coordinates', () => {
    const routes = generateE2ERoutes(
      [{ name: 'Ghost', e2e_eligible: true, isE2EHub: true }],
      { maxPairs: 10 }
    );
    expect(routes).toEqual([]);
  });

  it('isE2EHubNode recognizes eligibility flags', () => {
    expect(isE2EHubNode({ isE2EHub: true })).toBe(true);
    expect(isE2EHubNode({ e2e_eligible: true })).toBe(true);
    expect(isE2EHubNode({ enabledModes: ['auto', 'loop', 'e2e'] })).toBe(true);
    expect(isE2EHubNode({ population: 100 })).toBe(false);
  });
});

describe('generateE2MRoutes (Phase 2)', () => {
  const cities = sampleCities();
  const e2eHubs = cities.filter((c) => c.e2e_eligible);

  it('every mineral hub gets at least one edge when city context exists', () => {
    const routes = generateE2MRoutes(DEFAULT_MINERAL_HUBS.slice(0, 10), {
      cities,
      e2eHubs,
      allNodes: [...cities, ...DEFAULT_MINERAL_HUBS.slice(0, 10)],
    });
    expect(routes.length).toBeGreaterThan(0);
    const hubIdsWithEdges = new Set();
    routes.forEach((r) => hubIdsWithEdges.add(r.origin_id));
    DEFAULT_MINERAL_HUBS.slice(0, 10).forEach((hub) => {
      expect(hubIdsWithEdges.has(hub.mineral_hub_id)).toBe(true);
    });
  });

  it('edges are mode e2m with feeder/resource/industrial types', () => {
    const routes = generateE2MRoutes(DEFAULT_MINERAL_HUBS.slice(0, 5), {
      cities,
      e2eHubs,
      allNodes: cities,
    });
    const routeTypes = new Set(routes.map((r) => r.route_type));
    expect(routes.every((r) => r.mode === 'e2m')).toBe(true);
    expect(routeTypes.has('feeder') || routeTypes.has('resource') || routeTypes.has('industrial')).toBe(
      true
    );
  });

  it('avoids duplicate support city/port/e2e edges to same destination', () => {
    const hub = {
      ...DEFAULT_MINERAL_HUBS[0],
      nearest_support_city: cities[0].id,
      nearest_port: cities[0].id,
      nearest_e2e_hub: cities[0].id,
    };
    const routes = generateE2MRoutes([hub], { cities, e2eHubs, allNodes: cities });
    const destIds = routes.map((r) => r.destination_id);
    expect(new Set(destIds).size).toBe(destIds.length);
    expect(routes.length).toBe(1);
  });

  it('does not crash if nearest fields are missing', () => {
    const hub = { ...DEFAULT_MINERAL_HUBS[0] };
    delete hub.nearest_support_city;
    delete hub.nearest_port;
    delete hub.nearest_e2e_hub;
    expect(() =>
      generateE2MRoutes([hub], { cities, e2eHubs, allNodes: cities })
    ).not.toThrow();
  });

  it('skips invalid coordinate hubs gracefully', () => {
    const routes = generateE2MRoutes(
      [{ mineral_hub_id: 'e2m:bad:xx', e2m_enabled: true, name: 'Bad' }],
      { cities, e2eHubs, allNodes: cities }
    );
    expect(routes).toEqual([]);
  });
});

describe('generateLoopRegionalRoutes (Phase 2)', () => {
  const cities = sampleCities();
  const e2eHubs = cities.filter((c) => c.e2e_eligible);

  it('creates mode loop edges', () => {
    const routes = generateLoopRegionalRoutes(cities, { e2eHubs }, { maxLoopEdges: 50 });
    expect(routes.length).toBeGreaterThan(0);
    expect(routes.every((r) => r.mode === 'loop')).toBe(true);
    expect(routes.every((r) => r.route_type === 'regional')).toBe(true);
  });

  it('respects maxLoopEdges', () => {
    const routes = generateLoopRegionalRoutes(cities, { e2eHubs }, { maxLoopEdges: 3 });
    expect(routes.length).toBeLessThanOrEqual(3);
  });

  it('does not create auto edges', () => {
    const routes = generateLoopRegionalRoutes(cities, { e2eHubs });
    expect(routes.some((r) => r.mode === 'auto')).toBe(false);
  });

  it('skips missing coordinates', () => {
    const routes = generateLoopRegionalRoutes(
      [{ loop_enabled: true, name: 'NoCoords' }],
      { e2eHubs }
    );
    expect(routes).toEqual([]);
  });
});

describe('graphIntegrity (Phase 2)', () => {
  it('detects and removes duplicates', () => {
    const edges = [
      createIntegratedEdge({
        origin: 'a',
        destination: 'b',
        mode: 'e2e',
        route_type: 'global',
      }),
      createIntegratedEdge({
        origin: 'b',
        destination: 'a',
        mode: 'e2e',
        route_type: 'global',
      }),
    ];
    expect(findDuplicateEdges(edges).length).toBe(1);
    const { edges: deduped, duplicateCountRemoved } = deduplicateEdges(edges);
    expect(deduped.length).toBe(1);
    expect(duplicateCountRemoved).toBe(1);
  });

  it('detects orphan mineral hubs', () => {
    const nodes = [
      { mineral_hub_id: 'e2m:orphan:xx', e2m_enabled: true, nodeType: 'e2m_hub' },
      { id: 'net:connected:xx', isE2EHub: true },
    ];
    const edges = [
      createIntegratedEdge({
        origin: 'net:connected:xx',
        destination: 'net:other:xx',
        mode: 'e2e',
        route_type: 'global',
      }),
    ];
    const orphans = findOrphanMineralHubs(nodes, edges);
    expect(orphans.length).toBe(1);
    expect(orphans[0].mineral_hub_id).toBe('e2m:orphan:xx');
  });

  it('does not treat every small city as orphan', () => {
    const nodes = [
      { id: 'net:small:xx', population: 5000, auto_enabled: true, loop_enabled: true },
    ];
    const edges = [];
    const audit = auditGraphIntegrity(nodes, edges);
    expect(audit.orphanNodeCount).toBe(0);
  });
});

describe('generateIntegratedRoutes orchestrator (Phase 2)', () => {
  const cities = sampleCities();

  it('returns nodes, edges, and diagnostics', () => {
    const result = generateIntegratedRoutes({
      cities,
      mineralHubs: DEFAULT_MINERAL_HUBS,
    });
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBeGreaterThan(0);
    expect(result.diagnostics).toBeDefined();
    expect(result.diagnostics.totalNodes).toBe(result.nodes.length);
    expect(result.diagnostics.totalEdges).toBe(result.edges.length);
  });

  it('includes city nodes and mineral hub nodes', () => {
    const result = generateIntegratedRoutes({
      cities,
      mineralHubs: DEFAULT_MINERAL_HUBS.slice(0, 5),
    });
    expect(result.diagnostics.cityCount).toBe(cities.length);
    expect(result.diagnostics.mineralHubCount).toBe(5);
    const mineralIds = new Set(
      result.nodes.filter((n) => n.mineral_hub_id).map((n) => n.mineral_hub_id)
    );
    expect(mineralIds.size).toBe(5);
  });

  it('includes e2e, e2m, and loop routes', () => {
    const result = generateIntegratedRoutes({
      cities,
      mineralHubs: DEFAULT_MINERAL_HUBS.slice(0, 10),
    });
    expect(result.diagnostics.e2eRouteCount).toBeGreaterThan(0);
    expect(result.diagnostics.e2mRouteCount).toBeGreaterThan(0);
    expect(result.diagnostics.loopRouteCount).toBeGreaterThan(0);
  });

  it('preserves existing hyperloop edges when graph provided', () => {
    const hyperloopGraph = buildPlanetaryHyperloopGraph({
      activeE2EHubs: getMapRoiHubs().slice(0, 6),
    });
    const result = generateIntegratedRoutes({
      cities,
      mineralHubs: DEFAULT_MINERAL_HUBS.slice(0, 3),
      existingHyperloopGraph: hyperloopGraph,
    });
    expect(result.diagnostics.hyperloopRouteCount).toBeGreaterThan(0);
  });

  it('diagnostics counts are accurate', () => {
    const result = generateIntegratedRoutes({
      cities,
      mineralHubs: DEFAULT_MINERAL_HUBS.slice(0, 5),
    });
    const e2eCount = result.edges.filter((e) => e.mode === EDGE_MODES.E2E).length;
    const e2mCount = result.edges.filter((e) => e.mode === EDGE_MODES.E2M).length;
    const loopCount = result.edges.filter((e) => e.mode === EDGE_MODES.LOOP).length;
    expect(result.diagnostics.e2eRouteCount).toBe(e2eCount);
    expect(result.diagnostics.e2mRouteCount).toBe(e2mCount);
    expect(result.diagnostics.loopRouteCount).toBe(loopCount);
  });

  it('no duplicate edges remain after orchestration', () => {
    const result = generateIntegratedRoutes({
      cities,
      mineralHubs: DEFAULT_MINERAL_HUBS.slice(0, 10),
    });
    expect(findDuplicateEdges(result.edges).length).toBe(0);
  });

  it('fails gracefully with empty input', () => {
    const result = generateIntegratedRoutes({});
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.diagnostics.warnings?.length).toBeGreaterThan(0);
  });
});

describe('integrated graph smoke (Phase 2)', () => {
  it('produces connected mineral hub graph with zero orphan mineral hubs', () => {
    const cities = sampleCities();
    const { nodes, edges, diagnostics } = generateIntegratedRoutes({
      cities,
      mineralHubs: DEFAULT_MINERAL_HUBS,
    });

    expect(nodes.length).toBeGreaterThan(0);
    expect(edges.length).toBeGreaterThan(0);
    expect(diagnostics.e2mRouteCount).toBeGreaterThan(0);
    expect(diagnostics.mineralHubCount).toBe(DEFAULT_MINERAL_HUBS.length);
    expect(diagnostics.orphanMineralHubCount).toBe(0);
    expect(diagnostics.duplicateEdgeCountRemoved).toBeGreaterThanOrEqual(0);
  });

  it('E2E routes respect min distance', () => {
    const cities = sampleCities();
    const { edges } = generateIntegratedRoutes({ cities, mineralHubs: [] });
    const e2eEdges = edges.filter((e) => e.mode === 'e2e');
    e2eEdges.forEach((edge) => {
      expect(edge.distance_km).toBeGreaterThanOrEqual(500);
    });
  });
});
