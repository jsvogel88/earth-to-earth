import { describe, it, expect } from 'vitest';
import { generateStarbaseConnectivity } from '../graph/starbaseConnectivity.js';
import { listEarthStarbaseHubs, listStarbaseHubs } from '../data/starbaseHubs.js';

describe('starbase connectivity generator', () => {
  it('produces deterministic connectors for Earth hubs', () => {
    const earth = listEarthStarbaseHubs().slice(0, 12);
    const a = generateStarbaseConnectivity(earth, []);
    const b = generateStarbaseConnectivity(earth, []);
    expect(a.length).toBeGreaterThan(0);
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
  });

  it('connector paths are two-point lon/lat arrays', () => {
    const earth = listEarthStarbaseHubs().slice(0, 8);
    const connectors = generateStarbaseConnectivity(earth, []);
    for (const c of connectors) {
      expect(c.path).toHaveLength(2);
      expect(c.path[0]).toHaveLength(2);
      expect(c.systemType).toBeTruthy();
    }
  });

  it('does not connect off-world placeholder hubs on Earth layer input', () => {
    const all = listStarbaseHubs();
    const offWorld = all.filter((h) => h.nonEarth);
    const earthOnly = listEarthStarbaseHubs();
    expect(offWorld.length).toBeGreaterThan(0);
    expect(earthOnly.every((h) => h.earthRenderable)).toBe(true);
    const connectors = generateStarbaseConnectivity(earthOnly, []);
    for (const c of connectors) {
      expect(c.path[0][0]).not.toBe(0);
      expect(c.path[0][1]).not.toBe(0);
    }
  });
});
