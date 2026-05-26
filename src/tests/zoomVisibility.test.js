import { describe, it, expect } from 'vitest';
import {
  ZOOM_TIERS,
  getZoomTier,
  filterEdgesByZoom,
  filterNodesByZoom,
  isEdgeVisibleAtZoomTier,
} from '../modes/zoomVisibility.js';
import { EDGE_MODES } from '../graph/integratedGraphTypes.js';

describe('zoomVisibility (Phase 4)', () => {
  const sampleEdges = [
    { mode: EDGE_MODES.E2E, route_type: 'global', priority_score: 0.9, origin_id: 'a', destination_id: 'b' },
    { mode: EDGE_MODES.E2E, route_type: 'global', priority_score: 0.1, origin_id: 'c', destination_id: 'd' },
    { mode: EDGE_MODES.E2M, route_type: 'feeder', priority_score: 0.5, origin_id: 'h1', destination_id: 'a' },
    { mode: EDGE_MODES.LOOP, route_type: 'regional', priority_score: 0.4, origin_id: 'a', destination_id: 'e' },
    { mode: EDGE_MODES.AUTO, route_type: 'local', origin_id: 'a', destination_id: 'f' },
    { mode: EDGE_MODES.HYPERLOOP, route_type: 'trunk', origin_id: 'a', destination_id: 'g' },
  ];

  it('getZoomTier maps zoom ranges', () => {
    expect(getZoomTier(1)).toBe(ZOOM_TIERS.GLOBAL);
    expect(getZoomTier(5)).toBe(ZOOM_TIERS.REGIONAL);
    expect(getZoomTier(9)).toBe(ZOOM_TIERS.CITY);
    expect(getZoomTier(12)).toBe(ZOOM_TIERS.LOCAL);
  });

  it('global zoom hides loop clutter and auto edges; keeps trunk hyperloop', () => {
    const filtered = filterEdgesByZoom(sampleEdges, 1);
    expect(filtered.some((e) => e.mode === EDGE_MODES.LOOP)).toBe(false);
    expect(filtered.some((e) => e.mode === EDGE_MODES.AUTO)).toBe(false);
    expect(filtered.some((e) => e.mode === EDGE_MODES.HYPERLOOP)).toBe(true);
    expect(filtered.some((e) => e.mode === EDGE_MODES.E2E)).toBe(true);
  });

  it('regional zoom shows E2M feeder edges', () => {
    const filtered = filterEdgesByZoom(sampleEdges, 5);
    expect(filtered.some((e) => e.mode === EDGE_MODES.E2M)).toBe(true);
  });

  it('city zoom shows loop regional routes', () => {
    const filtered = filterEdgesByZoom(sampleEdges, 8);
    expect(filtered.some((e) => e.mode === EDGE_MODES.LOOP)).toBe(true);
  });

  it('does not mutate source edge array', () => {
    const copy = [...sampleEdges];
    filterEdgesByZoom(sampleEdges, 2);
    expect(sampleEdges).toEqual(copy);
  });

  it('filterNodesByZoom includes edge endpoints', () => {
    const nodes = [
      { id: 'a', name: 'Alpha', e2e_eligible: true, lat: 0, lon: 0 },
      { id: 'h1', mineral_hub_id: 'h1', name: 'Hub', strategic_score: 0.9, lat: 1, lon: 1 },
    ];
    const edges = filterEdgesByZoom(sampleEdges, 5);
    const visible = filterNodesByZoom(nodes, edges, 5);
    expect(visible.some((n) => n.id === 'a' || n.mineral_hub_id === 'h1')).toBe(true);
  });

  it('local tier allows full integrated edge context', () => {
    expect(isEdgeVisibleAtZoomTier({ mode: 'loop', route_type: 'regional' }, ZOOM_TIERS.LOCAL)).toBe(
      true
    );
  });
});
