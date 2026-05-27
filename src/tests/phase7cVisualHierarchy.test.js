import { describe, it, expect } from 'vitest';
import { getLayerVisibility } from '../map/layerVisibility.js';
import { INTEGRATED_VIEW_FOCUS } from '../ui/integratedGridFilters.js';
import { filterRoutesByZoom } from '../graph/filterRoutesByZoom.js';
import { classifyRouteFamily } from '../graph/classifyRouteFamily.js';
import { buildRouteDisplayPipeline } from '../graph/buildRouteDisplayPipeline.js';
import { getLoopViewData } from '../data/canonicalTransportAdapter.js';
import { filterRoutesByView } from '../graph/filterRoutesByView.js';
import adapter from '../data/canonicalTransportAdapter.js';

describe('Phase 7C layer visibility', () => {
  it('Auto/FSD only in AUTO focus', () => {
    expect(getLayerVisibility(INTEGRATED_VIEW_FOCUS.AUTO).showAutoFSD).toBe(true);
    expect(getLayerVisibility(INTEGRATED_VIEW_FOCUS.E2E).showAutoFSD).toBe(false);
    expect(getLayerVisibility(INTEGRATED_VIEW_FOCUS.E2M).showAutoFSD).toBe(false);
    expect(getLayerVisibility(INTEGRATED_VIEW_FOCUS.LOOP).showAutoFSD).toBe(false);
    expect(getLayerVisibility(INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID).showAutoFSD).toBe(false);
  });

  it('Loop view shows loop families at planetary zoom', () => {
    const edges = buildRouteDisplayPipeline({
      viewMode: 'LOOP',
      zoom: 2,
      simulationYear: 2075,
    });
    expect(edges.loopPaths.length + edges.feederPaths.length).toBeGreaterThan(0);
  });

  it('getLoopViewData has connected paths at default zoom context', () => {
    const data = getLoopViewData();
    expect(data.paths.length).toBeGreaterThan(0);
    expect(data.paths[0].path.length).toBeGreaterThanOrEqual(2);
  });

  it('planetary grid caps visible edges', () => {
    const result = buildRouteDisplayPipeline({
      viewMode: 'CIVILIZATION_GRID',
      zoom: 2,
      simulationYear: 2075,
    });
    expect(result.stats.visibleEdges).toBeLessThanOrEqual(40);
  });
});

describe('filterRoutesByZoom view modes', () => {
  it('LOOP mode keeps regional loops at zoom 2', () => {
    const edges = filterRoutesByView(adapter.getAllEdges(), 'LOOP', classifyRouteFamily);
    const visible = filterRoutesByZoom(edges, 2, classifyRouteFamily, 'LOOP');
    expect(visible.length).toBeGreaterThan(50);
  });
});
