import { describe, it, expect, beforeEach } from 'vitest';
import {
  cleanRawInput,
  splitInputLines,
  prepareInputLines,
  parseCityCountryLine,
  dedupeInputLines,
} from '../features/parsing/parsingUtils.js';
import { parseCityListSync } from '../features/parsing/parseCities.js';
import { resetCityMatcherCache } from '../features/parsing/cityMatcher.js';
import { getNetworkCityByNameCountry } from '../data/worldCities.js';

describe('parsingUtils', () => {
  it('splits newline-separated lists', () => {
    const lines = prepareInputLines('New York\nLondon\nTokyo');
    expect(lines).toEqual(['New York', 'London', 'Tokyo']);
  });

  it('parses city, country pairs', () => {
    const { city, country } = parseCityCountryLine('Paris, France');
    expect(city).toBe('Paris');
    expect(country).toBe('France');
  });

  it('dedupes duplicate lines in paste', () => {
    const lines = dedupeInputLines(['London', 'London', 'Paris, France']);
    expect(lines).toHaveLength(2);
  });

  it('handles CSV-style rows without header pollution', () => {
    const raw = 'city,country\nBerlin,Germany\nMunich,Germany';
    const lines = prepareInputLines(raw);
    expect(lines.some((l) => l.toLowerCase().includes('city'))).toBe(false);
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('cleans control characters and BOM', () => {
    expect(cleanRawInput('\uFEFF  Tokyo  \n')).toBe('Tokyo');
  });

  it('handles mixed comma and newline formatting', () => {
    const lines = splitInputLines('New York, London\nTokyo');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });
});

describe('parseCityListSync', () => {
  beforeEach(() => {
    resetCityMatcherCache();
  });

  it('matches curated network cities exactly', () => {
    const result = parseCityListSync('New York\nLondon');
    expect(result.parsedCount).toBe(2);
    expect(result.valid[0].lat).toBeDefined();
    expect(result.valid[0].source).toBe('parsed');
    expect(result.valid[0].suggestedRole).toBeTruthy();
  });

  it('detects duplicates within the same paste', () => {
    const result = parseCityListSync('London, UK\nLondon, UK');
    expect(result.duplicateCount).toBe(1);
    expect(result.parsedCount).toBe(1);
  });

  it('flags already-added world city ids', () => {
    const ny = getNetworkCityByNameCountry('New York', 'USA');
    const result = parseCityListSync('New York, USA', {
      existingWorldCityIds: new Set([ny.id]),
    });
    expect(result.alreadyAddedCount).toBe(1);
    expect(result.parsedCount).toBe(0);
  });

  it('uses map fallback when city exists on map nodes only', () => {
    const result = parseCityListSync('Ghost Hub', {
      mapNodes: [
        {
          name: 'Ghost Hub',
          country: 'Testland',
          lat: 10,
          lon: 20,
          networkCityId: 'net:ghost-hub:testland',
        },
      ],
    });
    expect(result.parsedCount).toBe(1);
    expect(result.valid[0].source).toBe('mapFallback');
    expect(result.valid[0].matchedBy).toBe('existingMapNode');
  });

  it('leaves unknown cities as unresolved', () => {
    const result = parseCityListSync('Zzznotarealcity99999');
    expect(result.failedCount).toBeGreaterThan(0);
    expect(result.unresolved.length).toBeGreaterThan(0);
  });

  it('parses 100+ lines without throwing', () => {
    const blob = Array.from({ length: 120 }, (_, i) => `City${i}, Country${i % 5}`).join('\n');
    expect(() => parseCityListSync(blob)).not.toThrow();
  });
});

describe('parsed cities overlay contract', () => {
  it('does not import graph builders from parsing module', async () => {
    const mod = await import('../features/parsing/parseCities.js');
    expect(mod.parseCityList).toBeDefined();
    expect(mod.buildPlanetaryHyperloopGraph).toBeUndefined();
  });
});
