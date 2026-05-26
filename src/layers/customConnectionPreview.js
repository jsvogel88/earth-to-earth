/**
 * Custom destination connection preview — map overlay only.
 * Does NOT import or mutate planetary graph builders.
 */

import { CONNECTION_MODES } from '../data/customDestinationConstants.js';
import { haversineDistanceMiles } from '../utils/haversineMiles.js';
import { hasCoordinates } from '../data/planningLayers.js';
import { isHyperloopNodeVisible } from '../graph/visibleGraphFilter.js';
import {
  PREVIEW_TOOLTIP_HTML,
  assertValidPreviewSegment,
} from './previewSegmentContract.js';

export { CONNECTION_MODES };

export const PREVIEW_LINE_STYLE = {
  color: [200, 120, 255, 140],
  width: 1.5,
  dashArray: [8, 6],
};

function isRenderableNode(node) {
  return (
    node &&
    node.renderable !== false &&
    hasCoordinates(node) &&
    typeof node.lat === 'number' &&
    typeof node.lon === 'number'
  );
}

/** Planetary / trunk-class anchors visible on the map. */
export function isTrunkAnchorNode(node) {
  if (node.infrastructureTier === 1) return true;
  if (node.tier === 1) return true;
  if (node.nodeType === 'PLANETARY_TRUNK_NODE') return true;
  if (node.isSwitchNode) return true;
  if (node.isE2EHub || node.tier === 0) return true;
  return false;
}

/** Regional hub / tier-2 anchors for active-mode preview. */
export function isRegionalAnchorNode(node) {
  if (node.infrastructureTier === 2) return true;
  if (node.tier === 2) return true;
  if (node.nodeType === 'REGIONAL_TRUNK_NODE') return true;
  if (node.isRegionalHub) return true;
  return false;
}

/**
 * @param {object[]} nodes — planetary graph nodes (read-only)
 * @param {object} layerState
 */
export function collectVisibleTrunkAnchors(nodes, layerState) {
  if (!Array.isArray(nodes)) return [];
  return nodes.filter(
    (n) =>
      isRenderableNode(n) &&
      isHyperloopNodeVisible(n, layerState) &&
      isTrunkAnchorNode(n)
  );
}

/**
 * @param {object[]} nodes
 * @param {object} layerState
 * @param {object[]} [extraRegional] — e.g. E2E regionalHubsInRadius
 */
export function collectVisibleRegionalAnchors(nodes, layerState, extraRegional = []) {
  const seen = new Set();
  const out = [];

  const push = (n) => {
    if (!n || !isRenderableNode(n)) return;
    const id = n.id ?? `${n.name}|${n.lat}|${n.lon}`;
    if (seen.has(id)) return;
    if (!isHyperloopNodeVisible(n, layerState) && !n._e2eRegionalHub) return;
    if (!isRegionalAnchorNode(n) && !n._e2eRegionalHub) return;
    seen.add(id);
    out.push(n);
  };

  for (const n of nodes) {
    if (isRenderableNode(n) && isHyperloopNodeVisible(n, layerState) && isRegionalAnchorNode(n)) {
      push(n);
    }
  }
  for (const n of extraRegional) {
    push({ ...n, _e2eRegionalHub: true });
  }
  return out;
}

/**
 * @param {{ lat: number, lon: number }} dest
 * @param {object[]} anchors
 */
export function findNearestAnchor(dest, anchors) {
  if (dest?.lat == null || dest?.lon == null || !anchors?.length) return null;

  let best = null;
  let bestDist = Infinity;
  for (const anchor of anchors) {
    const d = haversineDistanceMiles(dest.lat, dest.lon, anchor.lat, anchor.lon);
    if (d < bestDist) {
      bestDist = d;
      best = anchor;
    }
  }
  if (!best) return null;
  return { anchor: best, distanceMiles: bestDist };
}

/**
 * @param {object} dest — custom destination
 * @param {object} anchor
 * @param {string} connectionMode
 */
export function makePreviewSegment(dest, anchor, connectionMode) {
  const segment = {
    id: `custom-preview-${dest.id}-${anchor.id}`,
    previewOnly: true,
    overlayOnly: true,
    connectionMode,
    destinationId: dest.id,
    destinationName: dest.name,
    anchorId: anchor.id,
    anchorName: anchor.name,
    distanceMiles: haversineDistanceMiles(dest.lat, dest.lon, anchor.lat, anchor.lon),
    path: [
      [dest.lon, dest.lat],
      [anchor.lon, anchor.lat],
    ],
    tooltip: PREVIEW_TOOLTIP_HTML,
  };
  assertValidPreviewSegment(segment);
  return segment;
}

/**
 * Build dashed preview paths for custom destinations (never graph edges).
 *
 * @param {object} params
 * @param {object[]} params.customDestinations
 * @param {object[]} params.graphNodes — read-only planetary nodes
 * @param {object} params.layerState
 * @param {object[]} [params.regionalHubCandidates]
 */
export function buildCustomConnectionPreviews({
  customDestinations = [],
  graphNodes = [],
  layerState = {},
  regionalHubCandidates = [],
}) {
  if (!customDestinations.length) return [];

  const trunkAnchors = collectVisibleTrunkAnchors(graphNodes, layerState);
  const regionalAnchors = collectVisibleRegionalAnchors(
    graphNodes,
    layerState,
    regionalHubCandidates
  );

  const segments = [];

  for (const dest of customDestinations) {
    if (dest?.lat == null || dest?.lon == null) continue;
    const mode = dest.connectionMode || CONNECTION_MODES.NONE;

    if (mode === CONNECTION_MODES.NONE) continue;

    if (mode === CONNECTION_MODES.MANUAL_HUB) {
      if (!dest.manualHubId) continue;
      const manual = graphNodes.find((n) => n.id === dest.manualHubId);
      if (manual && isRenderableNode(manual)) {
        segments.push(makePreviewSegment(dest, manual, mode));
      }
      continue;
    }

    if (mode === CONNECTION_MODES.NEAREST_TRUNK) {
      const match = findNearestAnchor(dest, trunkAnchors);
      if (match) segments.push(makePreviewSegment(dest, match.anchor, mode));
      continue;
    }

    if (mode === CONNECTION_MODES.NEAREST_REGIONAL_HUB) {
      const match = findNearestAnchor(dest, regionalAnchors);
      if (match) segments.push(makePreviewSegment(dest, match.anchor, mode));
    }
  }

  return segments;
}
