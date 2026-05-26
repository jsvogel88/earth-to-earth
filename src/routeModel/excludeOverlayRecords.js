/**
 * Route optimizer / analyzer must never consume map overlay preview segments.
 */

import { isOverlayPreviewRecord } from '../layers/previewSegmentContract.js';

export { isOverlayPreviewRecord };

/**
 * @param {unknown[]} records
 * @returns {unknown[]}
 */
export function excludeOverlayRecordsFromRouteInputs(records) {
  if (!Array.isArray(records)) return records;
  return records.filter((r) => !isOverlayPreviewRecord(r));
}
