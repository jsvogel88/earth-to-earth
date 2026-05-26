import { describe, it, expect } from 'vitest';
import { buildParsedCitiesDeckLayers, PARSED_CITY_MAP_STYLE } from '../layers/parsedCitiesLayer.js';
import {
  addParsedCities,
  exportParsedCitiesJson,
  importParsedCitiesJson,
} from '../features/parsing/parsedCitiesStorage.js';
import { getLayerById } from '../layers/layerRegistry.js';
import { OVERLAY_ONLY_LAYER_IDS } from './modeTestContracts.js';

describe('parsedCitiesLayer', () => {
  it('builds overlay deck layers without route geometry', () => {
    const data = [
      {
        id: 'parsed:net:test:usa',
        city: 'Test',
        country: 'USA',
        lat: 40,
        lng: -74,
        suggestedRole: 'Custom Feeder City',
        parsingConfidence: 0.9,
        source: 'parsed',
        matchedBy: 'exact',
      },
    ];
    const layers = buildParsedCitiesDeckLayers(data, { zoom: 6 });
    expect(layers.length).toBeGreaterThanOrEqual(2);
  });

  it('uses cyan/magenta glow styling constants', () => {
    expect(PARSED_CITY_MAP_STYLE.importGlowColor[0]).toBe(0);
    expect(PARSED_CITY_MAP_STYLE.previewGlowColor[0]).toBe(255);
  });
});

describe('parsed cities persistence', () => {
  it('adds cities without duplicate world ids', () => {
    const city = {
      id: 'parsed:net:alpha:usa',
      worldCityId: 'net:alpha:usa',
      city: 'Alpha',
      country: 'USA',
      lat: 1,
      lng: 2,
      source: 'parsed',
      matchedBy: 'exact',
      parsingConfidence: 1,
      suggestedRole: 'Custom Feeder City',
    };
    const { list, added } = addParsedCities([], [city, city]);
    expect(added).toHaveLength(1);
    expect(list).toHaveLength(1);
  });

  it('round-trips export/import JSON', () => {
    const cities = [
      {
        id: 'parsed:net:beta:uk',
        worldCityId: 'net:beta:uk',
        city: 'Beta',
        country: 'UK',
        lat: 51,
        lng: 0,
        source: 'parsed',
        matchedBy: 'exact',
        parsingConfidence: 0.9,
        suggestedRole: 'Custom E2E Candidate',
      },
    ];
    const json = exportParsedCitiesJson(cities, [{ id: 's1', lineCount: 1, addedCount: 1 }]);
    const { cities: loaded } = importParsedCitiesJson(json);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].city).toBe('Beta');
  });
});

describe('layer registry — parsed cities overlay', () => {
  it('registers parsed_cities as overlay-only', () => {
    const layer = getLayerById('parsed_cities');
    expect(layer).toBeTruthy();
    expect(layer.layerType).toBe('overlay');
    expect(OVERLAY_ONLY_LAYER_IDS.has('parsed_cities')).toBe(true);
  });
});
