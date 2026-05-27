import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isE2MRouteFamily,
  isE2MLocalGroundRoute,
  shouldRenderE2MAsGroundPath,
  expandE2MToArcs,
  validateE2MRenderLayers,
  E2M_LOCAL_GROUND_ROUTE_TYPES,
} from '../map/e2mGeometry.js';
import { createRenderBuckets } from '../graph/createRenderBuckets.js';
import { pipelineBucketsToCanonicalDeck } from '../graph/pipelineDeckBridge.js';
import { integratedEdgesToRenderData, buildNodeCoordinateIndex } from '../map/integratedEdgePaths.js';
import {
  createE2MLayers,
  createHyperloopSpineLayers,
  createE2ELayers,
  INTEGRATED_LAYER_IDS,
} from '../map/deckLayerFactory.js';

describe('e2mGeometry', () => {
  it('recognizes E2M route families', () => {
    expect(isE2MRouteFamily({ mode: 'e2m', routeType: 'cargo_spine' })).toBe(true);
    expect(isE2MRouteFamily({ mode: 'cargo', routeType: 'resource_corridor' })).toBe(true);
    expect(isE2MRouteFamily({ mode: 'hyperloop', routeType: 'continental_spine' })).toBe(false);
  });

  it('allows ground PathLayer only for explicit local connector types', () => {
    expect(
      shouldRenderE2MAsGroundPath({
        mode: 'e2m',
        routeType: 'local_port_connector',
        distanceKm: 12,
      })
    ).toBe(true);
    expect(
      shouldRenderE2MAsGroundPath({
        mode: 'e2m',
        routeType: 'cargo_spine',
        distanceKm: 1200,
      })
    ).toBe(false);
    expect(E2M_LOCAL_GROUND_ROUTE_TYPES.has('terminal_ground_connector')).toBe(true);
  });

  it('expands long-distance segments to arc pairs', () => {
    const arcs = expandE2MToArcs({
      id: 'e2m-test',
      mode: 'e2m',
      routeType: 'resource_corridor',
      path: [
        [10, 20],
        [30, 40],
        [50, 60],
      ],
    });
    expect(arcs.length).toBe(2);
    expect(arcs[0].sourcePosition).toEqual([10, 20]);
    expect(arcs[0].targetPosition).toEqual([30, 40]);
  });
});

describe('E2M render buckets', () => {
  const nodesById = {
    a: { id: 'a', name: 'Alpha', longitude: 10, latitude: 20 },
    b: { id: 'b', name: 'Beta', longitude: 40, latitude: -10 },
  };

  it('routes E2M cargo into arc bucket, not ground path bucket', () => {
    const buckets = createRenderBuckets(
      [
        {
          id: 'edge-e2m-1',
          mode: 'e2m',
          routeType: 'cargo_spine',
          fromNodeId: 'a',
          toNodeId: 'b',
          distanceKm: 1800,
        },
      ],
      [],
      nodesById
    );

    expect(buckets.cargoArcs.length).toBe(1);
    expect(buckets.cargoArcs[0].sourcePosition).toEqual([10, 20]);
    expect(buckets.trunkPaths.length).toBe(0);
  });

  it('pipeline bridge emits canonicalE2mArcs and empty canonicalE2mPaths', () => {
    const deck = pipelineBucketsToCanonicalDeck({
      arcs: [],
      trunkPaths: [],
      loopPaths: [],
      feederPaths: [],
      cargoArcs: [
        {
          id: 'edge-e2m-1',
          from: [10, 20],
          to: [40, -10],
          fromName: 'Alpha',
          toName: 'Beta',
          mode: 'e2m',
          routeType: 'resource_corridor',
        },
      ],
    });

    expect(deck.canonicalE2mArcs.length).toBe(1);
    expect(deck.canonicalE2mArcs[0].sourcePosition).toEqual([10, 20]);
    expect(deck.canonicalE2mPaths).toEqual([]);
  });
});

describe('integrated edge routing', () => {
  it('puts E2M edges in e2mArcs bucket, not ground paths', () => {
    const nodes = [
      { id: 'hub-1', name: 'Mine', lat: 35, lon: -118 },
      { id: 'city-a', name: 'City A', lat: 40, lon: -74 },
    ];
    const index = buildNodeCoordinateIndex(nodes);
    const { paths, e2mArcs, arcs } = integratedEdgesToRenderData(
      [
        {
          mode: 'e2m',
          route_type: 'resource_corridor',
          origin_id: 'hub-1',
          destination_id: 'city-a',
          distance_km: 3900,
        },
        {
          mode: 'loop',
          route_type: 'regional',
          origin_id: 'city-a',
          destination_id: 'hub-1',
        },
      ],
      index
    );

    expect(e2mArcs.length).toBe(1);
    expect(paths.every((p) => p.mode !== 'e2m')).toBe(true);
    expect(arcs.every((a) => a.mode !== 'e2m')).toBe(true);
  });
});

describe('deckLayerFactory geometry', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('creates E2M ArcLayer for long-distance cargo routes', () => {
    const layers = createE2MLayers({
      arcs: [
        {
          id: 'e2m-arc-1',
          mode: 'e2m',
          routeType: 'cargo_spine',
          sourcePosition: [-118, 35],
          targetPosition: [-74, 40],
          distanceKm: 3900,
        },
      ],
      zoom: 5,
    });

    expect(layers.length).toBe(1);
    expect(layers[0].id).toBe(INTEGRATED_LAYER_IDS.E2M_ROUTES);
    expect(layers[0].props.greatCircle).toBe(true);
    expect(layers[0].props.data[0].sourcePosition).toEqual([-118, 35]);
  });

  it('does not put long-distance E2M in PathLayer', () => {
    const layers = createE2MLayers({
      arcs: [
        {
          id: 'e2m-bad',
          mode: 'e2m',
          routeType: 'resource_corridor',
          sourcePosition: [10, 20],
          targetPosition: [120, -30],
          distanceKm: 9000,
        },
      ],
      zoom: 2,
    });

    expect(layers.some((l) => String(l.id).includes('local-ground'))).toBe(false);
    validateE2MRenderLayers(layers[0]?.props?.data ?? [], []);
  });

  it('hyperloop remains PathLayer and E2E remains ArcLayer', () => {
    const spine = createHyperloopSpineLayers({
      paths: [
        {
          path: [
            [-74, 40],
            [-118, 34],
          ],
          routeClass: 'CONTINENTAL_SPINE',
        },
      ],
      zoom: 4,
    });
    const e2e = createE2ELayers({
      arcs: [
        {
          sourcePosition: [-74, 40],
          targetPosition: [-0.1, 51.5],
          civilizationImportance: 80,
        },
      ],
      zoom: 4,
    });

    expect(spine[0].id).toBe(INTEGRATED_LAYER_IDS.HYPERLOOP_SPINE);
    expect(e2e[0].id).toBe(INTEGRATED_LAYER_IDS.E2E_ROUTES);
    expect(e2e[0].props.greatCircle).toBe(true);
  });
});
