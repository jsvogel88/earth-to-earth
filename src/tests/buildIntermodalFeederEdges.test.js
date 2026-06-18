import { describe, it, expect } from 'vitest';
import { buildIntermodalFeederEdges, nodeMatchesType } from '../graph/buildIntermodalFeederEdges.js';
import { NODE_TYPES } from '../transportation/registries/nodeTypes.js';
import { GRAPH_MEMBERSHIP } from '../graph/graphMembership.js';
import { buildIntegratedTransportGraph } from '../hooks/useIntegratedTransportGraph.js';

describe('buildIntermodalFeederEdges', () => {
  it('returns empty when disabled', () => {
    expect(buildIntermodalFeederEdges({ nodes: [], existingEdges: [], enabled: false })).toEqual(
      []
    );
  });

  it('nodeMatchesType reads nodeTypes array', () => {
    expect(
      nodeMatchesType({ nodeTypes: [NODE_TYPES.E2E_HUB] }, NODE_TYPES.E2E_HUB)
    ).toBe(true);
  });

  it('skips overlay / custom nodes', () => {
    const edges = buildIntermodalFeederEdges({
      nodes: [
        {
          id: 'custom-1',
          graphMembership: GRAPH_MEMBERSHIP.OVERLAY,
          cityStatus: 'custom_destination',
          nodeTypes: [NODE_TYPES.FEEDER_CITY],
          lat: 40,
          lon: -74,
        },
        {
          id: 'hub-1',
          graphMembership: GRAPH_MEMBERSHIP.OFFICIAL,
          cityStatus: 'official_network_node',
          nodeTypes: [NODE_TYPES.E2E_HUB],
          lat: 41,
          lon: -73,
        },
      ],
      existingEdges: [],
      enabled: true,
    });
    expect(edges.every((e) => !String(e.from).includes('custom'))).toBe(true);
  });

  it('integrated hook sets planetaryEngine when canonical path succeeds', () => {
    const result = buildIntegratedTransportGraph({
      cities: [],
      existingHyperloopGraph: { nodes: [], edges: [] },
      layerState: {},
      options: { useCanonicalGraph: true },
    });
    expect(result.diagnostics?.planetaryEngine).toBe(true);
  });
});
