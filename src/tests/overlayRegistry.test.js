import { describe, it, expect } from 'vitest';
import {
  buildOverlayCatalog,
  OVERLAY_CATEGORIES,
  DATA_SOURCE_TYPES,
  isPlanningOverlay,
  isOverlayVisibleAtZoom,
} from '../layers/overlayRegistry.js';
import { buildPlanetaryHyperloopGraph } from '../graph/index.js';

describe('overlay registry', () => {
  it('loads catalog with valid categories', () => {
    const catalog = buildOverlayCatalog();
    expect(catalog.length).toBeGreaterThan(10);
    const categories = new Set(Object.values(OVERLAY_CATEGORIES));
    catalog.forEach((entry) => {
      expect(categories.has(entry.category), entry.id).toBe(true);
      expect(entry.dataSource).toBeTruthy();
    });
  });

  it('marks planning overlays as preview-only', () => {
    const planning = buildOverlayCatalog().filter((o) =>
      o.id.includes('global_connectivity') || o.id.includes('custom')
    );
    expect(planning.length).toBeGreaterThan(0);
    planning.forEach((o) => expect(isPlanningOverlay(o)).toBe(true));
  });

  it('planning manual overlays use planning data source', () => {
    const gcc = buildOverlayCatalog().find((o) => o.id === 'overlay_global_connectivity');
    expect(gcc?.dataSource).toBe(DATA_SOURCE_TYPES.PLANNING_MANUAL);
    expect(gcc?.previewOnly).toBe(true);
  });

  it('respects zoom visibility rules', () => {
    const zone = buildOverlayCatalog().find((o) => o.id === 'overlay_robotaxi_zones');
    expect(isOverlayVisibleAtZoom(zone, 3)).toBe(false);
    expect(isOverlayVisibleAtZoom(zone, 5)).toBe(true);
  });

  it('does not mutate official graph when building catalog', () => {
    const graph = buildPlanetaryHyperloopGraph({ activeE2EHubs: [] });
    const edgeCountBefore = graph.edges.length;
    buildOverlayCatalog();
    expect(graph.edges.length).toBe(edgeCountBefore);
  });
});
