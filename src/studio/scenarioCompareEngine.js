/**
 * Compare scenario layer profiles (preview, no map mutation).
 */

import { buildLayerStateForScenario } from './scenarioLayerEngine.js';
import { getScenarioById } from './registries/scenarioRegistry.js';

/**
 * @param {string} scenarioId
 * @param {object} currentLayerState
 * @param {{ transportMode?: string }} [options]
 */
export function diffScenarioAgainstCurrent(scenarioId, currentLayerState = {}, options = {}) {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return { scenario: null, rows: [], changedKeys: [] };

  const { layerState: proposed } = buildLayerStateForScenario(scenarioId, options);
  const keys = new Set([
    ...Object.keys(currentLayerState ?? {}),
    ...Object.keys(proposed ?? {}),
  ]);

  const rows = [];
  for (const key of keys) {
    const current = currentLayerState?.[key];
    const next = proposed?.[key];
    if (current !== next) {
      rows.push({ key, current, saved: next, label: 'current → scenario' });
    }
  }

  rows.sort((a, b) => a.key.localeCompare(b.key));

  return {
    scenario,
    rows,
    changedKeys: rows.map((r) => r.key),
    proposedLayerState: proposed,
  };
}
