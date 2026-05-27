import { describe, it, expect } from 'vitest';
import {
  getLoopViewData,
  getGridViewData,
  getRegionalLoopPaths,
  getFeederBranchPaths,
  getConnectedGridPaths,
  getConnectedGridArcs,
} from '../data/canonicalTransportAdapter.js';

describe('canonicalTransportAdapter view data', () => {
  it('getLoopViewData returns connected paths, not only nodes', () => {
    const data = getLoopViewData();
    expect(data.paths.length).toBeGreaterThan(0);
    expect(data.stats.pathCount).toBe(data.paths.length);
    expect(data.stats.pathCount).toBeGreaterThan(data.stats.nodeCount / 50);
  });

  it('loop paths have >=2 coords in [lng, lat] order', () => {
    const { paths } = getLoopViewData();
    for (const p of paths.slice(0, 20)) {
      expect(p.path.length).toBeGreaterThanOrEqual(2);
      const [lng, lat] = p.path[0];
      expect(Math.abs(lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(lng)).toBeLessThanOrEqual(180);
    }
  });

  it('getGridViewData includes arcs, e2m arcs, and ground paths only for spine/loop', () => {
    const data = getGridViewData();
    expect(data.arcs.length).toBeGreaterThan(0);
    expect(data.e2mArcs.length).toBeGreaterThan(0);
    expect(data.paths.length).toBeGreaterThan(0);
    expect(data.paths.every((p) => p.renderFamily !== 'E2M')).toBe(true);
    expect(data.stats.arcCount).toBe(data.arcs.length);
    expect(data.stats.pathCount).toBe(data.paths.length);
  });

  it('grid and loop views exclude robotaxi global edges', () => {
    const loop = getLoopViewData();
    const grid = getGridViewData();
    expect(loop.edges.every((e) => e.mode !== 'auto')).toBe(true);
    expect(grid.edges.every((e) => e.mode !== 'auto' && e.mode !== 'robotaxi')).toBe(true);
  });

  it('view node counts stay bounded (no 33k city render)', () => {
    const loop = getLoopViewData();
    const grid = getGridViewData();
    expect(loop.stats.nodeCount).toBeLessThan(5000);
    expect(grid.stats.nodeCount).toBeLessThan(5000);
  });

  it('path helpers return route-ordered sequences', () => {
    const loops = getRegionalLoopPaths();
    const feeders = getFeederBranchPaths();
    const gridPaths = getConnectedGridPaths();
    expect(loops.every((p) => p.path.length >= 2)).toBe(true);
    expect(feeders.every((p) => p.path.length >= 2)).toBe(true);
    expect(gridPaths.length).toBeGreaterThanOrEqual(loops.length);
    expect(getConnectedGridArcs().length).toBeGreaterThan(0);
  });
});
