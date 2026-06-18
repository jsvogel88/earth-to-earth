import { describe, it, expect } from 'vitest';
import {
  E2E_STRATEGIC_HUBS,
  RE2E_STRATEGIC_HUBS,
  getE2eStrategicHubByKey,
  getRe2eStrategicHubById,
} from '../graph/strategicHubRegistry.js';
import { TRANSPORTATION_MODES } from '../transportation/registries/modes.js';
import { NODE_TYPES } from '../transportation/registries/nodeTypes.js';

describe('strategicHubRegistry', () => {
  it('lists ten core E2E passenger hubs', () => {
    expect(E2E_STRATEGIC_HUBS.length).toBe(10);
    expect(getE2eStrategicHubByKey('new york')?.label).toBe('New York');
    expect(getE2eStrategicHubByKey('london')?.modes).toContain(TRANSPORTATION_MODES.E2E_STARSHIP);
  });

  it('lists eight RE2E industrial hubs', () => {
    expect(RE2E_STRATEGIC_HUBS.length).toBe(8);
    const pilbara = getRe2eStrategicHubById('re2e-pilbara');
    expect(pilbara?.nodeTypes).toContain(NODE_TYPES.MINERAL_NODE);
    expect(pilbara?.modes).toContain(TRANSPORTATION_MODES.RE2E);
  });
});
