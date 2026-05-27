import { describe, it, expect } from 'vitest';
import { resolveSelectedLocation } from '../ui/resolveSelectedLocation.js';
import { getStarbaseHubById } from '../data/starbaseHubs.js';

describe('Starbase selected location', () => {
  it('resolves starbase click without breaking city shape', () => {
    const hub = getStarbaseHubById('starbase-texas');
    const loc = resolveSelectedLocation({
      isStarbaseHub: true,
      starbaseDetail: hub,
      name: hub.name,
      lat: hub.coordinates[1],
      lon: hub.coordinates[0],
    });
    expect(loc.isStarbaseHub).toBe(true);
    expect(loc.locationType).toBe('starbase_hub');
    expect(loc.name).toBe('Starbase Texas');
  });

  it('still resolves normal city payloads', () => {
    const loc = resolveSelectedLocation({
      name: 'Test City',
      lat: 40,
      lon: -74,
      population: 100000,
    });
    expect(loc.isStarbaseHub).toBeFalsy();
    expect(loc.name).toBe('Test City');
  });
});
