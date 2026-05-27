import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildCustomConnectionPreviews } from '../src/layers/customConnectionPreview.js';
import { CONNECTION_MODES } from '../src/data/customDestinationConstants.js';
import {
  FORBIDDEN_OFFICIAL_GRAPH_FIELDS,
  isValidPreviewSegment,
} from '../src/layers/previewSegmentContract.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function graphFingerprint(graph) {
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    pathCount: graph.paths?.length ?? 0,
    edgeIds: graph.edges.map((e) => e.id).sort().join('|'),
  };
}

describe('customConnectionPreview graph isolation', () => {
  it('preview segments never include graph edge fields', () => {
    const segments = buildCustomConnectionPreviews({
      customDestinations: [
        { id: 'x', lat: 10, lon: 10, connectionMode: CONNECTION_MODES.NEAREST_TRUNK },
      ],
      graphNodes: [
        { id: 't', lat: 11, lon: 11, renderable: true, tier: 1, isSwitchNode: true, name: 'T' },
      ],
      layerState: {},
    });
    for (const s of segments) {
      assert.equal(isValidPreviewSegment(s), true);
      for (const key of FORBIDDEN_OFFICIAL_GRAPH_FIELDS) {
        assert.equal(s[key], undefined);
      }
    }
  });

  it('buildPlanetaryHyperloopGraph output unchanged after preview build', async () => {
    const server = await createServer({
      root,
      logLevel: 'error',
      server: { middlewareMode: true },
      appType: 'custom',
    });

    try {
      const mod = await server.ssrLoadModule('/src/graph/buildPlanetaryHyperloopGraph.js');
      const graphBefore = mod.buildPlanetaryHyperloopGraph();
      const fpBefore = graphFingerprint(graphBefore);

      buildCustomConnectionPreviews({
        customDestinations: [
          {
            id: 'preview-test',
            name: 'Preview Test',
            lat: 48.85,
            lon: 2.35,
            connectionMode: CONNECTION_MODES.NEAREST_TRUNK,
          },
          {
            id: 'preview-test-2',
            lat: 35.68,
            lon: 139.69,
            connectionMode: CONNECTION_MODES.NEAREST_REGIONAL_HUB,
          },
        ],
        graphNodes: graphBefore.nodes,
        layerState: {
          showPlanetaryTrunks: true,
          showRegionalTrunks: true,
          showGateways: true,
          showThroughRoutes: true,
          showFeeders: true,
        },
      });

      const graphAfter = mod.buildPlanetaryHyperloopGraph();
      const fpAfter = graphFingerprint(graphAfter);

      assert.equal(fpAfter.nodeCount, fpBefore.nodeCount);
      assert.equal(fpAfter.edgeCount, fpBefore.edgeCount);
      assert.equal(fpAfter.pathCount, fpBefore.pathCount);
      assert.equal(fpAfter.edgeIds, fpBefore.edgeIds);
    } finally {
      await server.close();
    }
  });
});
