import { describe, it, expect } from 'vitest';
import {
  listStarbaseHubs,
  listEarthStarbaseHubs,
  getStarbaseHubsByRole,
  getPetabondExportHubs,
  shouldRenderStarbaseAtZoom,
  countOffWorldStarbaseHubs,
  isEarthRenderableHub,
  STARBASE_PLANETS,
  STARBASE_STATUS,
} from '../data/starbaseHubs.js';

describe('Starbase hub seed dataset', () => {
  it('loads a non-trivial hub list with unique IDs', () => {
    const hubs = listStarbaseHubs();
    expect(hubs.length).toBeGreaterThanOrEqual(25);
    const ids = new Set(hubs.map((h) => h.id));
    expect(ids.size).toBe(hubs.length);
  });

  it('earth hubs have coordinates', () => {
    const hubs = listStarbaseHubs().filter((h) => h.planet === STARBASE_PLANETS.EARTH);
    expect(hubs.length).toBeGreaterThan(10);
    expect(hubs.every((h) => Array.isArray(h.coordinates) && h.coordinates.length === 2)).toBe(
      true
    );
  });

  it('conceptual hubs are explicitly marked', () => {
    const hubs = listStarbaseHubs();
    const conceptual = hubs.filter((h) => h.status === STARBASE_STATUS.CONCEPTUAL);
    expect(conceptual.length).toBeGreaterThan(0);
  });

  it('role filters work (E2E, PETABOND_EXPORT)', () => {
    expect(getStarbaseHubsByRole('E2E').length).toBeGreaterThan(0);
    expect(getPetabondExportHubs().length).toBeGreaterThan(0);
  });

  it('zoom visibility gates non-earth hubs off by default', () => {
    const hubs = listStarbaseHubs();
    const orbit = hubs.find((h) => h.planet !== STARBASE_PLANETS.EARTH);
    expect(orbit).toBeTruthy();
    expect(shouldRenderStarbaseAtZoom(orbit, 2)).toBe(false);
  });

  it('Earth map list excludes off-world placeholders', () => {
    const earth = listEarthStarbaseHubs();
    const offWorld = countOffWorldStarbaseHubs();
    expect(offWorld).toBeGreaterThan(0);
    expect(earth.length).toBeLessThan(listStarbaseHubs().length);
    expect(earth.every((h) => isEarthRenderableHub(h))).toBe(true);
    expect(earth.every((h) => h.nonEarth !== true)).toBe(true);
  });
});

