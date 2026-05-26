/**
 * Overlay preview segment contract — not part of planetary graph or route optimizer.
 */

export const PREVIEW_TOOLTIP_TEXT = 'Preview connection — not part of network graph.';

export const PREVIEW_TOOLTIP_HTML = `<strong>Preview connection</strong><br/>${PREVIEW_TOOLTIP_TEXT}`;

/** Official graph edge fields that preview segments must never carry. */
export const FORBIDDEN_OFFICIAL_GRAPH_FIELDS = [
  'from',
  'to',
  'edgeCategory',
  'edgeType',
  'routeClass',
];

export function isOverlayPreviewRecord(record) {
  return Boolean(record?.previewOnly || record?.overlayOnly);
}

/**
 * @param {object} segment
 * @returns {boolean}
 */
export function isValidPreviewSegment(segment) {
  if (!segment || segment.previewOnly !== true) return false;
  for (const key of FORBIDDEN_OFFICIAL_GRAPH_FIELDS) {
    if (segment[key] !== undefined) return false;
  }
  return Array.isArray(segment.path) && segment.path.length === 2;
}

/**
 * @param {object} segment
 */
export function assertValidPreviewSegment(segment) {
  if (!isValidPreviewSegment(segment)) {
    throw new Error('Invalid custom connection preview segment shape');
  }
}
