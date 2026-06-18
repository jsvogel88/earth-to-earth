import { describe, it, expect } from 'vitest';
import {
  buildSyntheticStrategicFeeders,
  findNodeForWorldCityKey,
} from '../graph/buildSyntheticStrategicFeeders.js';
import { buildIntegratedTransportGraph } from '../hooks/useIntegratedTransportGraph.js';
import { getIntegratedGraph } from '../data/canonicalTransportAdapter.js';

describe('buildSyntheticStrategicFeeders', () => {
  it('returns no edges when disabled', () => {
    const canonical = getIntegratedGraph();
    const edges = buildSyntheticStrategicFeeders({
      nodes: canonical.nodes,
      existingEdges: canonical.edges,
      enabled: false,
    });
    expect(edges).toEqual([]);
  });

  it('finds canonical nodes for strategic world-city keys', () => {
    const canonical = getIntegratedGraph();
    const london = findNodeForWorldCityKey(canonical.nodes, 'london');
    expect(london?.id).toBeTruthy();
  });

  it('may add conceptual E2E feeders when enabled and endpoints exist', () => {
    const canonical = getIntegratedGraph();
    const edges = buildSyntheticStrategicFeeders({
      nodes: canonical.nodes,
      existingEdges: canonical.edges,
      enabled: true,
    });
    for (const edge of edges) {
      expect(edge.synthetic).toBe(true);
      expect(edge.strategicFeeder).toBe(true);
      expect(edge.id).toMatch(/^synthetic-feeder:/);
    }
  });

  it('integrated hook records syntheticFeederCount when flag is on', () => {
    const result = buildIntegratedTransportGraph({
      cities: [],
      existingHyperloopGraph: { nodes: [], edges: [] },
      layerState: {},
      options: { useCanonicalGraph: true, synthesizeStrategicFeeders: true },
    });
    expect(result.diagnostics?.syntheticFeederCount).toBeGreaterThanOrEqual(0);
    if (result.diagnostics.syntheticFeederCount > 0) {
      expect(
        result.diagnostics.warnings.some((w) => w.includes('Synthetic strategic feeders'))
      ).toBe(true);
    }
  });
});
