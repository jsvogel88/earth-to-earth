import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadScenarios,
  upsertScenario,
  deleteScenario,
  duplicateScenario,
  serializeScenario,
  deserializeScenario,
  SCENARIO_STORAGE_KEY,
} from '../utils/scenarioStorage.js';

describe('scenario storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('serializes and deserializes scenario records', () => {
    const record = upsertScenario({
      id: 'test-1',
      name: 'Test scenario',
      transportMode: 'E2E Starship',
      layerState: { showPlanetarySkeleton: true },
    });
    const json = serializeScenario(record);
    const parsed = deserializeScenario(json);
    expect(parsed?.id).toBe('test-1');
    expect(parsed?.layerState?.showPlanetarySkeleton).toBe(true);
  });

  it('persists scenarios to localStorage', () => {
    upsertScenario({ id: 'a', name: 'Alpha' });
    upsertScenario({ id: 'b', name: 'Beta' });
    const list = loadScenarios();
    expect(list).toHaveLength(2);
    expect(localStorage.getItem(SCENARIO_STORAGE_KEY)).toBeTruthy();
  });

  it('duplicates a scenario with a new id', () => {
    upsertScenario({ id: 'orig', name: 'Original' });
    const copy = duplicateScenario('orig');
    expect(copy?.id).not.toBe('orig');
    expect(copy?.name).toContain('copy');
    expect(loadScenarios()).toHaveLength(2);
  });

  it('deletes scenarios by id', () => {
    upsertScenario({ id: 'x', name: 'X' });
    deleteScenario('x');
    expect(loadScenarios()).toHaveLength(0);
  });
});
