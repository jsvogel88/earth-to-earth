import { describe, it, expect } from 'vitest';
import { createRenderBuckets } from '../graph/createRenderBuckets.js';
import { buildRouteDisplayPipeline } from '../graph/buildRouteDisplayPipeline.js';
import { isHyperloopOceanCrossing, filterHyperloopPathRecords } from '../graph/hyperloopGeometry.js';
import {
  isCorridorOwnedForPlanetary,
  filterUnownedPlanetaryRoutes,
  regionalTrunkVisibility,
} from '../graph/planetaryTopology.js';
import { computePlanetaryValidation } from '../map/planetaryValidation.js';
import { expandE2MToArcs, shouldRenderE2MAsGroundPath } from '../map/e2mGeometry.js';
import { isPriorityE2EEdge, getE2EArcTilt, getCorridorRouteColor } from '../map/visualHierarchy.js';
import { createE2MLayers, createHyperloopSpineLayers, createE2ELayers } from '../map/deckLayerFactory.js';
import { buildIntermodalHubHalos } from '../layers/planningOverlayLayers.js';
import adapter from '../data/canonicalTransportAdapter.js';

const nodesById = {
  ny: { id: 'ny', name: 'New York', longitude: -74, latitude: 40.7 },
  lon: { id: 'lon', name: 'London', longitude: -0.1, latitude: 51.5 },
  la: { id: 'la', name: 'Los Angeles', longitude: -118, latitude: 34 },
  tk: { id: 'tk', name: 'Tokyo', longitude: 139.7, latitude: 35.7 },
  a: { id: 'a', name: 'Alpha', longitude: 10, latitude: 20 },
  b: { id: 'b', name: 'Beta', longitude: 40, latitude: -10 },
};

describe('Phase 7D geometry buckets', () => {
  it('E2M routes go to ArcLayer bucket', () => {
    const buckets = createRenderBuckets(
      [{ id: 'e1', mode: 'e2m', routeType: 'resource_corridor', fromNodeId: 'a', toNodeId: 'b', distanceKm: 2000 }],
      [],
      nodesById
    );
    expect(buckets.cargoArcs.length).toBe(1);
    expect(buckets.trunkPaths.length).toBe(0);
  });

  it('E2M long-distance routes never go to PathLayer buckets', () => {
    const layers = createE2MLayers({
      arcs: [
        {
          id: 'e2m-long',
          mode: 'e2m',
          routeType: 'cargo_spine',
          sourcePosition: [10, 20],
          targetPosition: [120, -30],
          distanceKm: 9000,
        },
      ],
      zoom: 2,
    });
    expect(layers.some((l) => String(l.id).includes('local-ground'))).toBe(false);
    expect(layers[0].props.greatCircle).toBe(true);
  });

  it('E2E routes go to ArcLayer bucket with gold tones', () => {
    const buckets = createRenderBuckets(
      [{ id: 'e2e1', mode: 'e2e_starship', routeType: 'global_arc', fromNodeId: 'ny', toNodeId: 'lon', tier: 1 }],
      [],
      nodesById
    );
    expect(buckets.arcs.length).toBe(1);
    expect(buckets.arcs[0].sourceColor[0]).toBeGreaterThan(200);
  });

  it('Hyperloop routes go to PathLayer bucket when terrestrial', () => {
    const buckets = createRenderBuckets(
      [
        {
          id: 'h1',
          mode: 'hyperloop',
          routeType: 'continental_spine',
          fromNodeId: 'ny',
          toNodeId: 'la',
          distanceKm: 4000,
        },
      ],
      [],
      nodesById
    );
    expect(buckets.trunkPaths.length).toBe(1);
    const spine = createHyperloopSpineLayers({ paths: [{ path: [[-74, 40], [-118, 34]], mode: 'hyperloop' }], zoom: 4 });
    expect(spine[0].id).toBe('integrated-hyperloop-spine');
  });
});

describe('Phase 7D ocean + Atlantic rules', () => {
  it('blocks hyperloop ocean crossings', () => {
    expect(
      isHyperloopOceanCrossing(nodesById.la, nodesById.tk, { mode: 'hyperloop', distanceKm: 8800 })
    ).toBe(true);
    const { violations } = filterHyperloopPathRecords([
      { path: [[-118, 34], [139.7, 35.7]], mode: 'hyperloop', distanceKm: 8800 },
    ]);
    expect(violations.length).toBe(1);
  });

  it('NY-London E2E is priority arc with tilt, not white hyperloop path', () => {
    const edge = {
      id: 'edge:e2e_starship:new-york--london',
      fromNodeId: 'node:city:new-york',
      toNodeId: 'node:city:london',
    };
    expect(isPriorityE2EEdge(edge)).toBe(true);
    expect(getE2EArcTilt({ fromName: 'New York', toName: 'London' })).toBeGreaterThan(0);
    const hyperColor = getCorridorRouteColor({ mode: 'hyperloop', routeType: 'continental_spine' });
    expect(hyperColor[2]).toBeGreaterThan(200);
    const e2eLayers = createE2ELayers({
      arcs: [{ sourcePosition: [-74, 40], targetPosition: [-0.1, 51.5], ...edge }],
      zoom: 2,
    });
    expect(e2eLayers[0].props.greatCircle).toBe(true);
  });
});

describe('Phase 7D planetary pruning', () => {
  it('planetary zoom hides dangling stubs via ownership filter', () => {
    const edges = adapter.getAllEdges();
    const owned = filterUnownedPlanetaryRoutes(edges, 2);
    expect(owned.length).toBeLessThan(edges.length);
  });

  it('planetary zoom route count <= 40', () => {
    const result = buildRouteDisplayPipeline({
      viewMode: 'CIVILIZATION_GRID',
      zoom: 2,
      simulationYear: 2075,
    });
    expect(result.stats.visibleEdges).toBeLessThanOrEqual(40);
    const routeCount =
      result.arcs.length + result.cargoArcs.length + result.trunkPaths.length;
    expect(routeCount).toBeLessThanOrEqual(40);
  });

  it('validation reports zero E2M path violations in pipeline', () => {
    const result = buildRouteDisplayPipeline({
      viewMode: 'CIVILIZATION_GRID',
      zoom: 2,
      simulationYear: 2075,
    });
    expect(result.validation.geometry.e2mPathViolations).toBe(0);
    expect(result.validation.geometry.hyperloopOceanViolations).toBe(0);
  });

  it('major regional trunk metadata resolves for canonical edges', () => {
    const result = buildRouteDisplayPipeline({
      viewMode: 'CIVILIZATION_GRID',
      zoom: 2,
      simulationYear: 2075,
    });
    const regions = regionalTrunkVisibility(result.stats.visibleEdges ? adapter.getAllEdges().filter((e) => isCorridorOwnedForPlanetary(e, 2)) : []);
    expect(regions.asia || regions.northAmerica || regions.europe).toBe(true);
  });
});

describe('Phase 7D halos + local ground', () => {
  it('Auto halos only include planetary anchors at low zoom', () => {
    const halos = buildIntermodalHubHalos(
      [
        { id: 'node:city:new-york', name: 'New York', lat: 40.7, lon: -74, isE2EHub: true, tier: 1 },
        { id: 'node:city:omaha', name: 'Omaha', lat: 41.2, lon: -96, tier: 3 },
      ],
      2
    );
    expect(halos.length).toBe(1);
    expect(halos[0].name).toBe('New York');
  });

  it('local E2M ground PathLayer only under 100km for explicit types', () => {
    expect(
      shouldRenderE2MAsGroundPath({
        routeType: 'local_port_connector',
        distanceKm: 90,
      })
    ).toBe(true);
    expect(
      shouldRenderE2MAsGroundPath({
        routeType: 'local_port_connector',
        distanceKm: 150,
      })
    ).toBe(false);
    expect(expandE2MToArcs({ routeType: 'port_connector', path: [[0, 0], [1, 1]] }).length).toBe(1);
  });

  it('computePlanetaryValidation aggregates geometry counts', () => {
    const v = computePlanetaryValidation({
      buckets: { arcs: [{}], cargoArcs: [{}], trunkPaths: [{}] },
      visibleEdges: [],
      zoom: 2,
    });
    expect(v.geometry.e2eArcsRendered).toBeGreaterThan(0);
    expect(v.topology.visiblePlanetaryRouteCount).toBe(3);
  });
});
