import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCustomConnectionPreviews,
  findNearestAnchor,
  collectVisibleTrunkAnchors,
  collectVisibleRegionalAnchors,
} from '../layers/customConnectionPreview.js';
import { CONNECTION_MODES as MODES } from '../data/customDestinationConstants.js';
import {
  PREVIEW_TOOLTIP_TEXT,
  isValidPreviewSegment,
  FORBIDDEN_OFFICIAL_GRAPH_FIELDS,
} from '../layers/previewSegmentContract.js';
import { excludeOverlayRecordsFromRouteInputs } from '../routeModel/excludeOverlayRecords.js';

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
  expect(isValidPreviewSegment(segment)).toBe(true);
  for (const key of FORBIDDEN_OFFICIAL_GRAPH_FIELDS) {
    expect(segment[key]).toBeUndefined();
  }
  expect(segment.previewOnly).toBe(true);
  expect(segment.overlayOnly).toBe(true);
}

describe('customConnectionPreview', () => {
  it('module does not import planetary graph builder', () => {
    const src = readFileSync(
      path.join(root, 'layers/customConnectionPreview.js'),
      'utf8'
    );
    expect(src.includes('buildPlanetaryHyperloopGraph')).toBe(false);
    expect(src.includes('applyInfrastructureTrunks')).toBe(false);
  });

  it('returns no segments when connectionMode is none', () => {
    const segments = buildCustomConnectionPreviews({
      customDestinations: [
        { id: 'c1', name: 'Test City', lat: 40.7, lon: -74, connectionMode: MODES.NONE },
      ],
      graphNodes: mockNodes,
      layerState,
    });
    expect(segments.length).toBe(0);
  });

  it('nearest_trunk produces overlay-only preview segment', () => {
    const segments = buildCustomConnectionPreviews({
      customDestinations: [
        { id: 'c3', name: 'NYC', lat: 40.71, lon: -74.0, connectionMode: MODES.NEAREST_TRUNK },
      ],
      graphNodes: mockNodes,
      layerState,
    });
    expect(segments.length).toBe(1);
    assertPreviewContract(segments[0]);
    expect(segments[0].connectionMode).toBe(MODES.NEAREST_TRUNK);
    expect(segments[0].anchorId).toBe('trunk-a');
    expect(segments[0].tooltip.includes(PREVIEW_TOOLTIP_TEXT)).toBe(true);
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
        {
          id: 'r1',
          name: 'R1',
          lat: 41,
          lon: -73,
          renderable: true,
          tier: 2,
          _e2eRegionalHub: true,
        },
      ],
    });

    expect(nodes.length).toBe(nodeLen);
    expect(edges.length).toBe(edgeLen);
  });

  it('findNearestAnchor picks closest trunk', () => {
    const anchors = collectVisibleTrunkAnchors(mockNodes, layerState);
    const match = findNearestAnchor({ lat: 40.72, lon: -74.01 }, anchors);
    expect(match).toBeTruthy();
    expect(match.anchor.id).toBe('trunk-a');
  });
});

describe('route optimizer preview isolation', () => {
  it('excludeOverlayRecordsFromRouteInputs drops preview segments', () => {
    const preview = {
      previewOnly: true,
      overlayOnly: true,
      path: [
        [0, 0],
        [1, 1],
      ],
    };
    const city = { code: 'NYC', name: 'New York', latitude: 40.7, longitude: -74 };
    const filtered = excludeOverlayRecordsFromRouteInputs([city, preview]);
    expect(filtered.length).toBe(1);
    expect(filtered[0].code).toBe('NYC');
  });
});
