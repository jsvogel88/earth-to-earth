import { describe, it, expect } from 'vitest';
import {
  buildParsedIsolationVisibleLayers,
  computeParsedCitiesBounds,
  filterConnectionPreviewsForParsed,
  PARSED_ISOLATION_LAYER_IDS,
} from '../features/parsing/parsedCityIsolation.js';

describe('parsedCityIsolation', () => {
  const points = [
    { id: 'p1', city: 'A', lat: 40, lng: -74, worldCityId: 'net:a:usa' },
    { id: 'p2', city: 'B', lat: 51, lng: 0, worldCityId: 'net:b:uk' },
  ];

  it('returns only parsed deck layer ids', () => {
    const layers = buildParsedIsolationVisibleLayers({
      parsedMapPoints: points,
      showLabels: true,
      zoom: 6,
    });
    expect(layers).toEqual(['parsed-cities', 'parsed-cities-labels']);
    layers.forEach((id) => expect(PARSED_ISOLATION_LAYER_IDS).toContain(id));
    expect(layers).not.toContain('hub-cities');
  });

  it('includes preview routes only when requested and present', () => {
    const withPreview = buildParsedIsolationVisibleLayers({
      parsedMapPoints: points,
      includePreviewRoutes: true,
      previewRouteCount: 2,
    });
    expect(withPreview).toContain('custom-connection-preview');

    const without = buildParsedIsolationVisibleLayers({
      parsedMapPoints: points,
      includePreviewRoutes: true,
      previewRouteCount: 0,
    });
    expect(without).not.toContain('custom-connection-preview');
  });

  it('returns empty layer list when no parsed points', () => {
    expect(buildParsedIsolationVisibleLayers({ parsedMapPoints: [] })).toEqual([]);
  });

  it('computes bounds for fitBounds', () => {
    const b = computeParsedCitiesBounds(points);
    expect(b.sw[0]).toBeLessThan(b.ne[0]);
    expect(b.sw[1]).toBeLessThan(b.ne[1]);
  });

  it('filters connection previews to parsed custom destinations only', () => {
    const previews = [
      { id: 'seg1', destinationId: 'custom-1' },
      { id: 'seg2', destinationId: 'custom-2' },
    ];
    const customs = [
      { id: 'custom-1', worldCityId: 'net:a:usa' },
      { id: 'custom-2', worldCityId: 'net:other:xx' },
    ];
    const filtered = filterConnectionPreviewsForParsed(
      previews,
      customs,
      new Set(['net:a:usa'])
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].destinationId).toBe('custom-1');
  });
});
