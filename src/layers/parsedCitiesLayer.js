/**
 * Deck.gl overlay layers for bulk-parsed cities — no graph edges.
 */

import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { getRoleColor } from '../data/userCustomDestinations.js';

export const PARSED_CITY_MAP_STYLE = {
  importGlowColor: [0, 255, 255, 100],
  previewGlowColor: [255, 0, 255, 80],
  haloRadius: 18,
  markerRadius: 10,
  lineColor: [0, 255, 255, 255],
  lineWidth: 2,
  labelPrefix: 'Import: ',
  labelColor: [180, 255, 255, 255],
};

/**
 * @param {import('../features/parsing/parsingTypes.js').ParsedCityRecord[]} data
 * @param {object} [options]
 * @param {boolean} [options.showLabels]
 * @param {number} [options.zoom]
 */
export function buildParsedCitiesDeckLayers(data, options = {}) {
  if (!data?.length) return [];

  const { showLabels = true, zoom = 3 } = options;
  const style = PARSED_CITY_MAP_STYLE;
  const layers = [];

  layers.push(
    new ScatterplotLayer({
      id: 'parsed-cities-glow',
      data,
      pickable: false,
      opacity: 0.5,
      stroked: false,
      filled: true,
      radiusMinPixels: style.haloRadius,
      radiusMaxPixels: style.haloRadius + 6,
      getPosition: (d) => [d.lng, d.lat],
      getFillColor: (d) =>
        d.isPreview ? style.previewGlowColor : style.importGlowColor,
      getRadius: style.haloRadius,
      updateTriggers: {
        getFillColor: [data.length],
      },
    }),
    new ScatterplotLayer({
      id: 'parsed-cities',
      data,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusMinPixels: style.markerRadius,
      radiusMaxPixels: style.markerRadius + 5,
      lineWidthMinPixels: style.lineWidth,
      getPosition: (d) => [d.lng, d.lat],
      getFillColor: (d) => {
        const role = d.suggestedRole || '';
        const c = getRoleColor(role);
        return [c[0], c[1], c[2], d.isPreview ? 160 : 220];
      },
      getLineColor: () => style.lineColor,
      getRadius: style.markerRadius,
    })
  );

  if (showLabels && zoom >= 5) {
    layers.push(
      new TextLayer({
        id: 'parsed-cities-labels',
        data,
        pickable: false,
        getPosition: (d) => [d.lng, d.lat],
        getText: (d) => `${style.labelPrefix}${d.city}`,
        getSize: 11,
        getColor: () => style.labelColor,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'center',
        getPixelOffset: [14, 0],
      })
    );
  }

  return layers;
}
