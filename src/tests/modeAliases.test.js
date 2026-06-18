import { describe, it, expect } from 'vitest';
import { resolveCanonicalMode, isRe2eEarthMode, toLegacyGraphMode } from '../transportation/modeAliases.js';
import { TRANSPORTATION_MODES } from '../transportation/registries/modes.js';
import { ROUTE_TYPES } from '../transportation/registries/routeTypes.js';

describe('modeAliases', () => {
  it('maps legacy e2m to RE2E for earth resource corridors', () => {
    expect(
      resolveCanonicalMode('e2m', { routeType: ROUTE_TYPES.RESOURCE_CORRIDOR })
    ).toBe(TRANSPORTATION_MODES.RE2E);
    expect(isRe2eEarthMode('e2m', { routeType: ROUTE_TYPES.CARGO_CORRIDOR })).toBe(true);
  });

  it('preserves re2e canonical mode', () => {
    expect(resolveCanonicalMode('re2e')).toBe(TRANSPORTATION_MODES.RE2E);
  });

  it('toLegacyGraphMode keeps generators on e2m', () => {
    expect(toLegacyGraphMode('re2e')).toBe('e2m');
    expect(toLegacyGraphMode('e2e_starship')).toBe('e2e_starship');
  });

  it('exposes space extension modes', () => {
    expect(resolveCanonicalMode('e2o')).toBe(TRANSPORTATION_MODES.E2O);
    expect(resolveCanonicalMode('e2mars')).toBe(TRANSPORTATION_MODES.E2MARS);
    expect(resolveCanonicalMode('petabond')).toBe(TRANSPORTATION_MODES.PETABOND);
  });
});
