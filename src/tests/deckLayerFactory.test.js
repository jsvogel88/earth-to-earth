import { describe, it, expect } from 'vitest';
import {
  createIntegratedGraphLayers,
  createE2ELayers,
  createE2MLayers,
  createLoopLayers,
  INTEGRATED_LAYER_IDS,
} from '../map/deckLayerFactory.js';
import { buildNodeCoordinateIndex, integratedEdgesToRenderData } from '../map/integratedEdgePaths.js';

describe('deckLayerFactory (Phase 4)', () => {
  const nodes = [
    { id: 'city-a', name: 'City A', e2e_eligible: true, lat: 40, lon: -74 },
    { mineral_hub_id: 'hub-1', name: 'Mine', lat: 35, lon: -118, strategic_score: 0.9 },
  ];

  const edges = [
    {
      mode: 'e2e',
      route_type: 'global',
      origin_id: 'city-a',
      destination_id: 'city-b',
      priority_score: 0.8,
    },
    {
      mode: 'e2m',
      route_type: 'feeder',
      origin_id: 'hub-1',
      destination_id: 'city-a',
      priority_score: 0.6,
    },
    {
      mode: 'loop',
      route_type: 'regional',
      origin_id: 'city-a',
      destination_id: 'city-c',
    },
    { mode: 'auto', route_type: 'local', origin_id: 'city-a', destination_id: 'city-d' },
    { mode: 'hyperloop', route_type: 'trunk', origin_id: 'city-a', destination_id: 'city-e' },
  ];

  const nodesWithB = [
    ...nodes,
    { id: 'city-b', name: 'City B', e2e_eligible: true, lat: 34, lon: -118 },
    { id: 'city-c', name: 'City C', lat: 41, lon: -87 },
  ];

  it('creates E2E arc layer when e2e edges are visible', () => {
    const index = buildNodeCoordinateIndex(nodesWithB);
    const { arcs } = integratedEdgesToRenderData(
      edges.filter((e) => e.mode === 'e2e'),
      index
    );
    const layers = createE2ELayers({ arcs, zoom: 2 });
    expect(layers.length).toBe(1);
    expect(layers[0].id).toBe(INTEGRATED_LAYER_IDS.E2E_ROUTES);
    expect(layers[0].props.data.length).toBe(1);
  });

  it('creates E2M path layer for feeder edges', () => {
    const index = buildNodeCoordinateIndex(nodesWithB);
    const { paths } = integratedEdgesToRenderData(
      edges.filter((e) => e.mode === 'e2m'),
      index
    );
    const layers = createE2MLayers({ paths, zoom: 5 });
    expect(layers[0].id).toBe(INTEGRATED_LAYER_IDS.E2M_ROUTES);
    expect(layers[0].props.data[0].path.length).toBe(2);
  });

  it('does not create loop layers at global zoom', () => {
    const index = buildNodeCoordinateIndex(nodesWithB);
    const { paths } = integratedEdgesToRenderData(
      edges.filter((e) => e.mode === 'loop'),
      index
    );
    expect(createLoopLayers({ paths, zoom: 1 }).length).toBe(0);
    expect(createLoopLayers({ paths, zoom: 8 }).length).toBe(1);
  });

  it('createIntegratedGraphLayers excludes auto intercity edges', () => {
    const spine = [
      {
        path: [
          [-74, 40],
          [-118, 34],
        ],
        routeClass: 'PLANETARY_TRUNK',
        edgeType: 'TRUNK',
      },
    ];
    const layers = createIntegratedGraphLayers({
      nodes: nodesWithB,
      edges,
      visibleNodes: nodesWithB,
      visibleEdges: edges,
      hyperloopSpinePaths: spine,
      activeFilters: {
        showIntegratedE2E: true,
        showIntegratedE2M: true,
        showIntegratedLoop: true,
        showIntegratedHyperloop: true,
        showIntegratedMineralHubs: true,
      },
      zoom: 8,
    });
    const ids = layers.map((l) => l.id);
    expect(ids).toContain(INTEGRATED_LAYER_IDS.HYPERLOOP_SPINE);
    expect(ids).toContain(INTEGRATED_LAYER_IDS.E2E_ROUTES);
    expect(ids).toContain(INTEGRATED_LAYER_IDS.E2M_ROUTES);
    expect(ids).not.toContain('integrated-auto-routes');
  });

  it('handles empty graph safely', () => {
    expect(createIntegratedGraphLayers({ nodes: [], edges: [], zoom: 2 })).toEqual([]);
  });

  it('handles missing coordinates safely', () => {
    const layers = createIntegratedGraphLayers({
      nodes: [{ id: 'x' }],
      edges: [{ mode: 'e2e', origin_id: 'x', destination_id: 'y', route_type: 'global' }],
      visibleNodes: [],
      visibleEdges: [{ mode: 'e2e', origin_id: 'x', destination_id: 'y', route_type: 'global' }],
      zoom: 2,
    });
    const routeLayer = layers.find((l) => l.id === INTEGRATED_LAYER_IDS.E2E_ROUTES);
    expect(routeLayer?.props?.data?.length ?? 0).toBe(0);
  });
});
