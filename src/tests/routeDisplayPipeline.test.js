import { describe, it, expect } from 'vitest';
import { classifyRouteFamily, ROUTE_FAMILIES } from '../graph/classifyRouteFamily.js';
import { filterRoutesByView } from '../graph/filterRoutesByView.js';
import { filterRoutesByZoom } from '../graph/filterRoutesByZoom.js';
import { filterRoutesByTier } from '../graph/filterRoutesByTier.js';
import { buildRouteDisplayPipeline } from '../graph/buildRouteDisplayPipeline.js';
import adapter from '../data/canonicalTransportAdapter.js';

describe('classifyRouteFamily', () => {
  it('identifies all six families', () => {
    expect(classifyRouteFamily({ mode: 'e2e_starship', routeType: 'global_backbone' })).toBe(
      ROUTE_FAMILIES.E2E_GLOBAL_ARC
    );
    expect(
      classifyRouteFamily({ mode: 'hyperloop', routeType: 'continental_spine' })
    ).toBe(ROUTE_FAMILIES.CONTINENTAL_SPINE);
    expect(classifyRouteFamily({ mode: 'hyperloop', routeType: 'branch' })).toBe(
      ROUTE_FAMILIES.FEEDER_BRANCH
    );
    expect(classifyRouteFamily({ mode: 'regional_loop', routeType: 'regional_loop' })).toBe(
      ROUTE_FAMILIES.REGIONAL_LOOP
    );
    expect(classifyRouteFamily({ mode: 'e2m', routeType: 'cargo_spine' })).toBe(
      ROUTE_FAMILIES.E2M_CARGO
    );
    expect(classifyRouteFamily({ mode: 'robotaxi', routeType: 'local' })).toBe(
      ROUTE_FAMILIES.ROBOTAXI_LOCAL
    );
  });
});

describe('filterRoutesByView', () => {
  const edges = adapter.getAllEdges();

  it('hides E2E arcs in Loop view', () => {
    const visible = filterRoutesByView(edges, 'LOOP', classifyRouteFamily);
    expect(visible.every((e) => classifyRouteFamily(e) !== 'E2E_GLOBAL_ARC')).toBe(true);
  });

  it('hides feeders in Civilization Grid view', () => {
    const visible = filterRoutesByView(edges, 'CIVILIZATION_GRID', classifyRouteFamily);
    expect(visible.every((e) => classifyRouteFamily(e) !== 'FEEDER_BRANCH')).toBe(true);
  });
});

describe('filterRoutesByZoom', () => {
  const edges = adapter.getAllEdges();

  it('hides feeders at planetary zoom in grid mode', () => {
    const visible = filterRoutesByZoom(edges, 2, classifyRouteFamily, 'CIVILIZATION_GRID');
    expect(visible.every((e) => classifyRouteFamily(e) !== 'FEEDER_BRANCH')).toBe(true);
  });
});

describe('filterRoutesByTier', () => {
  const edges = adapter.getAllEdges();

  it('shows only tier 1 at planetary zoom', () => {
    const visible = filterRoutesByTier(edges, 2);
    expect(visible.every((e) => (e.tier ?? 2) === 1)).toBe(true);
  });
});

describe('buildRouteDisplayPipeline', () => {
  it('returns paths and arcs for grid view at regional zoom', () => {
    const result = buildRouteDisplayPipeline({ viewMode: 'CIVILIZATION_GRID', zoom: 7 });
    expect(result.arcs.length).toBeGreaterThan(0);
    expect(result.cargoArcs.length).toBeGreaterThan(0);
    expect(result.trunkPaths.length + result.loopPaths.length).toBeGreaterThan(0);
    expect(result.stats.visibleEdges).toBeGreaterThan(0);
  });

  it('loop view has no E2E arcs and includes feeder paths at zoom 7', () => {
    const result = buildRouteDisplayPipeline({
      viewMode: 'LOOP',
      zoom: 7,
      simulationYear: 2075,
    });
    expect(result.arcs.length).toBe(0);
    expect(result.feederPaths.length).toBeGreaterThan(100);
    expect(result.loopPaths.length).toBeGreaterThan(50);
  });

  it('path coordinates are [lng, lat]', () => {
    const result = buildRouteDisplayPipeline({ viewMode: 'LOOP', zoom: 7 });
    const sample = result.feederPaths[0] ?? result.loopPaths[0];
    expect(sample.from[0]).toBeGreaterThan(-180);
    expect(sample.from[0]).toBeLessThanOrEqual(180);
    expect(sample.from[1]).toBeGreaterThanOrEqual(-90);
    expect(sample.from[1]).toBeLessThanOrEqual(90);
  });

  it('does not expose 33k city nodes', () => {
    expect(adapter.nodes.length).toBeLessThan(5000);
  });
});
