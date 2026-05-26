/**
 * Parsed City Isolation Mode — visibility filter only (no graph / layerState mutation).
 */

/** Deck layer ids allowed while isolation is active (basemap stays via MapLibre). */
export const PARSED_ISOLATION_LAYER_IDS = [
  'parsed-cities',
  'parsed-cities-labels',
  'custom-connection-preview',
];

/**
 * @param {object} params
 * @param {object[]} params.parsedMapPoints
 * @param {boolean} [params.showLabels]
 * @param {number} [params.zoom]
 * @param {boolean} [params.includePreviewRoutes]
 * @param {number} [params.previewRouteCount]
 */
export function buildParsedIsolationVisibleLayers({
  parsedMapPoints = [],
  showLabels = true,
  zoom = 3,
  includePreviewRoutes = false,
  previewRouteCount = 0,
}) {
  if (!parsedMapPoints.length) return [];

  const layers = ['parsed-cities'];
  if (showLabels && zoom >= 5) {
    layers.push('parsed-cities-labels');
  }
  if (includePreviewRoutes && previewRouteCount > 0) {
    layers.push('custom-connection-preview');
  }
  return layers;
}

/**
 * Keep preview segments whose destination is a parsed/imported custom overlay.
 * @param {object[]} previews
 * @param {object[]} customDestinations
 * @param {Set<string>} parsedWorldCityIds
 */
export function filterConnectionPreviewsForParsed(
  previews,
  customDestinations = [],
  parsedWorldCityIds = new Set()
) {
  if (!previews?.length || !parsedWorldCityIds.size) return [];
  const parsedDestIds = new Set(
    customDestinations
      .filter((d) => d.worldCityId && parsedWorldCityIds.has(d.worldCityId))
      .map((d) => d.id)
  );
  return previews.filter((seg) => parsedDestIds.has(seg.destinationId));
}

/**
 * @param {object[]} customDestinations
 * @param {Set<string>} parsedWorldCityIds
 */
export function filterCustomDestinationsForParsed(customDestinations, parsedWorldCityIds) {
  if (!parsedWorldCityIds?.size) return [];
  return (customDestinations || []).filter((d) => parsedWorldCityIds.has(d.worldCityId));
}

/**
 * Compute lng/lat bounds for map fitBounds.
 * @param {object[]} points — { lat, lng|lon }
 */
export function computeParsedCitiesBounds(points) {
  if (!points?.length) return null;

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  for (const p of points) {
    const lat = p.lat;
    const lng = p.lng ?? p.lon;
    if (lat == null || lng == null) continue;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }

  if (minLat > maxLat || minLng > maxLng) return null;

  const padLat = Math.max((maxLat - minLat) * 0.12, 2);
  const padLng = Math.max((maxLng - minLng) * 0.12, 2);

  return {
    sw: [minLng - padLng, minLat - padLat],
    ne: [maxLng + padLng, maxLat + padLat],
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
  };
}
