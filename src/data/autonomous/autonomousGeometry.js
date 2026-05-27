/**
 * Geodesic geometry helpers (no Turf dependency).
 */

const EARTH_RADIUS_M = 6371008.8;
const MILES_TO_METERS = 1609.344;

export function milesToMeters(miles) {
  return miles * MILES_TO_METERS;
}

/**
 * Haversine distance in miles.
 */
export function distanceMiles(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = φ2 - φ1;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (EARTH_RADIUS_M * c) / MILES_TO_METERS;
}

/**
 * Geodesic circle polygon (GeoJSON Feature).
 * @param {number} lng
 * @param {number} lat
 * @param {number} radiusMeters
 * @param {number} [steps]
 */
export function geodesicCirclePolygon(lng, lat, radiusMeters, steps = 96) {
  const coords = [];
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;
  const angular = radiusMeters / EARTH_RADIUS_M;

  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angular) +
        Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
        Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2)
      );
    coords.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: { geometrySource: 'geodesic_circle' },
  };
}

/**
 * Great-circle placeholder corridor path.
 */
export function greatCirclePath(lng1, lat1, lng2, lat2, segments = 32) {
  const path = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    path.push([
      lng1 + (lng2 - lng1) * t,
      lat1 + (lat2 - lat1) * t,
    ]);
  }
  return path;
}

/**
 * Sample points along path every `intervalMiles`.
 * @param {[number, number][]} path — [lng, lat]
 */
export function samplePathByMiles(path, intervalMiles) {
  if (!path?.length || path.length < 2) return [];
  const samples = [{ lng: path[0][0], lat: path[0][1], mileMarker: 0 }];
  let accumulated = 0;
  let nextMark = intervalMiles;

  for (let i = 1; i < path.length; i++) {
    const [lngA, latA] = path[i - 1];
    const [lngB, latB] = path[i];
    const seg = distanceMiles(latA, lngA, latB, lngB);
    let start = 0;
    while (accumulated + (seg - start) >= nextMark) {
      const need = nextMark - accumulated;
      const t = seg > 0 ? (start + need) / seg : 0;
      const lng = lngA + (lngB - lngA) * t;
      const lat = latA + (latB - latA) * t;
      samples.push({ lng, lat, mileMarker: nextMark });
      nextMark += intervalMiles;
      start += need;
    }
    accumulated += seg - start;
  }
  return samples;
}
