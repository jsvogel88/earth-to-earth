/**
 * Rich compare rows for version diff UI.
 */

import { getStudioVersion } from './studioVersionStore.js';

/**
 * @param {object} currentLayerState
 * @param {string} versionId
 * @param {number} [maxRows]
 */
export function buildVersionCompareDetail(currentLayerState, versionId, maxRows = 32) {
  const version = getStudioVersion(versionId);
  if (!version?.layerState) {
    return { version: null, rows: [], changedKeys: [] };
  }

  const keys = new Set([
    ...Object.keys(currentLayerState ?? {}),
    ...Object.keys(version.layerState ?? {}),
  ]);

  const rows = [];
  for (const key of keys) {
    const current = currentLayerState?.[key];
    const saved = version.layerState?.[key];
    if (current !== saved) {
      rows.push({ key, current, saved });
    }
  }

  rows.sort((a, b) => a.key.localeCompare(b.key));

  return {
    version,
    rows: rows.slice(0, maxRows),
    changedKeys: rows.map((r) => r.key),
    truncated: rows.length > maxRows,
  };
}
