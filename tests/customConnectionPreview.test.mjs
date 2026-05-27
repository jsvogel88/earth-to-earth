import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  buildCustomConnectionPreviews,
  findNearestAnchor,
  collectVisibleTrunkAnchors,
  collectVisibleRegionalAnchors,
} from '../src/layers/customConnectionPreview.js';
import { CONNECTION_MODES as MODES } from '../src/data/customDestinationConstants.js';
import {
  PREVIEW_TOOLTIP_TEXT,
  isValidPreviewSegment,
  FORBIDDEN_OFFICIAL_GRAPH_FIELDS,
} from '../src/layers/previewSegmentContract.js';
import { excludeOverlayRecordsFromRouteInputs } from '../src/routeModel/excludeOverlayRecords.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const mockNodes = [
  { id: 'trunk-a', name: 'Trunk A', lat: 40, lon: -74, renderable: true, tier: 1, isSwitchNode: true },
  { id: 'trunk-b', name: 'Trunk B', lat: 51, lon: 0, renderable: true, tier: 1, isE2EHub: true },
  {
    id: 'regional-x',
    name: 'Regional X',
    lat: 41,
    lon: -73,
    renderable: true,
    tier: 2,
    infrastructureTier: 2,
  },
];

const layerState = {
  showRareEarthHubs: false,
  showFutureHighPopulationHubs: false,
  showExtendedRuralLayer: false,
};

function assertPreviewContract(segment) {
  assert.equal(isValidPreviewSegment(segment), true);
  for (const key of FORBIDDEN_OFFICIAL_GRAPH_FIELDS) {
    assert.equal(segment[key], undefined, `must not have ${key}`);
  }
  assert.equal(segment.previewOnly, true);
  assert.equal(segment.overlayOnly, true);
}

describe('customConnectionPreview', () => {
  it('module does not import planetary graph builder', () => {
    const src = readFileSync(
      path.join(root, 'src/layers/customConnectionPreview.js'),
      'utf8'
    );
    assert.equal(src.includes('buildPlanetaryHyperloopGraph'), false);
    assert.equal(src.includes('applyInfrastructureTrunks'), false);
  });

  it('returns no segments when connectionMode is none', () => {
    const segments = buildCustomConnectionPreviews({
      customDestinations: [
        { id: 'c1', name: 'Test City', lat: 40.7, lon: -74, connectionMode: MODES.NONE },
      ],
      graphNodes: mockNodes,
      layerState,
    });
    assert.equal(segments.length, 0);
  });

  it('returns no segment for manual_hub without manualHubId', () => {
    const segments = buildCustomConnectionPreviews({
      customDestinations: [
        {
          id: 'c2',
          name: 'Manual',
          lat: 40.7,
          lon: -74,
          connectionMode: MODES.MANUAL_HUB,
          manualHubId: null,
        },
      ],
      graphNodes: mockNodes,
      layerState,
    });
    assert.equal(segments.length, 0);
  });

  it('nearest_trunk produces overlay-only preview segment', () => {
    const segments = buildCustomConnectionPreviews({
      customDestinations: [
        { id: 'c3', name: 'NYC', lat: 40.71, lon: -74.0, connectionMode: MODES.NEAREST_TRUNK },
      ],
      graphNodes: mockNodes,
      layerState,
    });
    assert.equal(segments.length, 1);
    assertPreviewContract(segments[0]);
    assert.equal(segments[0].connectionMode, MODES.NEAREST_TRUNK);
    assert.equal(segments[0].anchorId, 'trunk-a');
    assert.ok(segments[0].tooltip.includes(PREVIEW_TOOLTIP_TEXT));
  });

  it('nearest_regional_hub picks closest regional anchor', () => {
    const segments = buildCustomConnectionPreviews({
      customDestinations: [
        {
          id: 'c5',
          lat: 40.72,
          lon: -74.01,
          connectionMode: MODES.NEAREST_REGIONAL_HUB,
        },
      ],
      graphNodes: mockNodes,
      layerState,
    });
    assert.equal(segments.length, 1);
    assertPreviewContract(segments[0]);
    assert.equal(segments[0].anchorId, 'regional-x');
  });

  it('removing a destination removes its preview segment', () => {
    const two = buildCustomConnectionPreviews({
      customDestinations: [
        { id: 'a', lat: 40.71, lon: -74, connectionMode: MODES.NEAREST_TRUNK },
        { id: 'b', lat: 51.5, lon: 0.1, connectionMode: MODES.NEAREST_TRUNK },
      ],
      graphNodes: mockNodes,
      layerState,
    });
    const one = buildCustomConnectionPreviews({
      customDestinations: [
        { id: 'a', lat: 40.71, lon: -74, connectionMode: MODES.NEAREST_TRUNK },
      ],
      graphNodes: mockNodes,
      layerState,
    });
    assert.equal(two.length, 2);
    assert.equal(one.length, 1);
    assert.equal(one[0].destinationId, 'a');
  });

  it('does not mutate graph node or edge arrays', () => {
    const nodes = [...mockNodes];
    const edges = [{ id: 'e1', from: 'trunk-a', to: 'trunk-b' }];
    const nodeLen = nodes.length;
    const edgeLen = edges.length;

    buildCustomConnectionPreviews({
      customDestinations: [
        { id: 'c4', lat: 40.71, lon: -74, connectionMode: MODES.NEAREST_REGIONAL_HUB },
      ],
      graphNodes: nodes,
      layerState,
      regionalHubCandidates: [
        { id: 'r1', name: 'R1', lat: 41, lon: -73, renderable: true, tier: 2, _e2eRegionalHub: true },
      ],
    });

    assert.equal(nodes.length, nodeLen);
    assert.equal(edges.length, edgeLen);
  });

  it('findNearestAnchor picks closest trunk', () => {
    const anchors = collectVisibleTrunkAnchors(mockNodes, layerState);
    const match = findNearestAnchor({ lat: 40.72, lon: -74.01 }, anchors);
    assert.ok(match);
    assert.equal(match.anchor.id, 'trunk-a');
  });

  it('regional anchors include extra E2E regional candidates', () => {
    const anchors = collectVisibleRegionalAnchors(mockNodes, layerState, [
      { id: 'e2e-r1', name: 'E2E Regional', lat: 40.8, lon: -73.9, renderable: true, tier: 2 },
    ]);
    assert.ok(anchors.some((a) => a.id === 'regional-x'));
    assert.ok(anchors.some((a) => a.id === 'e2e-r1'));
  });
});

describe('route optimizer preview isolation', () => {
  it('excludeOverlayRecordsFromRouteInputs drops preview segments', () => {
    const preview = {
      previewOnly: true,
      overlayOnly: true,
      path: [[0, 0], [1, 1]],
    };
    const city = { code: 'NYC', name: 'New York', latitude: 40.7, longitude: -74 };
    const filtered = excludeOverlayRecordsFromRouteInputs([city, preview]);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].code, 'NYC');
  });

  it('routeAnalyzer uses overlay exclusion helper', () => {
    const src = readFileSync(
      path.join(root, 'src/routeModel/modules/routeAnalyzer.js'),
      'utf8'
    );
    assert.ok(src.includes('excludeOverlayRecordsFromRouteInputs'));
  });

  it('routeAnalyzer does not import custom preview builder', () => {
    const src = readFileSync(
      path.join(root, 'src/routeModel/modules/routeAnalyzer.js'),
      'utf8'
    );
    assert.equal(src.includes('buildCustomConnectionPreviews'), false);
    assert.equal(src.includes('customDestinationStorage'), false);
  });
});
