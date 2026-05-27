import { describe, it, expect } from 'vitest';
import { validateTransportGraph } from '../transportation/validators/graphValidation.js';
import { normalizeGraphEdge } from '../graph/normalizeGraphMember.js';

describe('graphValidation', () => {
  it('flags duplicate node and edge ids', () => {
    const result = validateTransportGraph(
      [
        { id: 'a', latitude: 0, longitude: 0, modes: ['e2e_starship'] },
        { id: 'a', latitude: 1, longitude: 1 },
      ],
      [{ id: 'e1', fromNodeId: 'a', toNodeId: 'b', mode: 'e2e_starship' }]
    );
    expect(result.errors.some((e) => e.type === 'DUPLICATE_NODE_ID')).toBe(true);
  });

  it('flags E2E ground geometry violations', () => {
    const edge = {
      id: 'bad-e2e',
      mode: 'e2e_starship',
      taxonomyMode: 'e2e_starship',
      routeType: 'global_arc',
      fromNodeId: 'a',
      toNodeId: 'b',
      geometryType: 'ground',
      renderAsArc: false,
    };
    const result = validateTransportGraph(
      [
        { id: 'a', latitude: 0, longitude: 0 },
        { id: 'b', latitude: 1, longitude: 1 },
      ],
      [edge]
    );
    expect(result.errors.some((e) => e.type === 'E2E_GROUND_VIOLATION')).toBe(true);
  });

  it('accepts normalized E2E arcs', () => {
    const edge = normalizeGraphEdge({
      id: 'good-e2e',
      mode: 'e2e_starship',
      routeType: 'global_arc',
      fromNodeId: 'a',
      toNodeId: 'b',
      distanceKm: 5000,
    });
    const result = validateTransportGraph(
      [
        { id: 'a', latitude: 0, longitude: 0 },
        { id: 'b', latitude: 1, longitude: 1 },
      ],
      [edge]
    );
    expect(result.valid).toBe(true);
    expect(edge.geometryType).toBe('arc');
  });
});
