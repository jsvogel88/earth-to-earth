import { describe, it, expect } from 'vitest';
import { buildPlanetaryHyperloopGraph } from '../graph/buildPlanetaryHyperloopGraph.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';
import {
  isCoreHyperloopWebPath,
  filterVisiblePaths,
} from '../graph/visibleGraphFilter.js';
import {
  assertGraphIntegrity,
  cloneGraphSnapshot,
} from './helpers/graphAssertions.js';
import { getMapRoiHubs } from '../data/worldCities.js';

describe('graph builders — planetary hyperloop', () => {
  const sampleHubs = getMapRoiHubs().slice(0, 6);

  it('buildPlanetaryHyperloopGraph returns a valid frozen graph', () => {
    const graph = buildPlanetaryHyperloopGraph({
      activeE2EHubs: sampleHubs,
      runConnectivityRepair: true,
    });

    expect(graph).toBeTruthy();
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
    expect(Array.isArray(graph.paths)).toBe(true);
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.paths.length).toBeGreaterThan(0);
  });

  it('has no duplicate IDs, orphan edges, and reports connectivity metrics', () => {
    const graph = buildPlanetaryHyperloopGraph({ activeE2EHubs: sampleHubs });
    const stats = assertGraphIntegrity(graph);

    expect(stats.nodeCount).toBeGreaterThan(0);
    expect(stats.edgeCount).toBeGreaterThan(0);
    expect(stats.largestComponentSize).toBeGreaterThan(0);
    expect(graph.connectivity?.largestComponentSize ?? stats.largestComponentSize).toBeGreaterThan(
      0
    );
  });

  it('includes through-routes and trunk corridors in Hyperloop Web layer state', () => {
    const graph = buildPlanetaryHyperloopGraph({ activeE2EHubs: sampleHubs });
    const layerState = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);

    const trunkEdges = graph.edges.filter(
      (e) =>
        e.edgeCategory === 'PLANETARY_TRUNK' ||
        e.edgeCategory === 'CONTINENTAL_SPINE' ||
        e.routeClass === 'CONTINENTAL_SPINE'
    );
    expect(trunkEdges.length).toBeGreaterThan(0);

    const throughEdges = graph.edges.filter(
      (e) => e.edgeCategory === 'THROUGH_ROUTE' || e.routeClass === 'THROUGH_ROUTE'
    );
    expect(throughEdges.length).toBeGreaterThan(0);

    const visibleTrunks = graph.paths.filter((p) =>
      isCoreHyperloopWebPath(p, layerState, 5, TRANSPORT_MODES.HYPERLOOP_CORE)
    );
    expect(visibleTrunks.length).toBeGreaterThan(0);
  });

  it('filterVisiblePaths does not mutate the source path array', () => {
    const graph = buildPlanetaryHyperloopGraph({ activeE2EHubs: sampleHubs });
    const layerState = buildDefaultLayerState(TRANSPORT_MODES.E2E_STARSHIP);
    const before = cloneGraphSnapshot(graph);
    const paths = graph.paths.slice(0, 200);

    filterVisiblePaths(paths, {
      layerState,
      mapMode: TRANSPORT_MODES.E2E_STARSHIP,
      zoom: 5,
    });

    expect(cloneGraphSnapshot(graph).nodeIds).toEqual(before.nodeIds);
    expect(cloneGraphSnapshot(graph).edgeKeys).toEqual(before.edgeKeys);
  });
});
