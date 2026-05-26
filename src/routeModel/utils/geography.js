const EARTH_RADIUS_KM = 6371;
const KM_PER_MILE = 1.60934;

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

export function haversineDistanceMiles(lat1, lon1, lat2, lon2) {
  return haversineDistanceKm(lat1, lon1, lat2, lon2) / KM_PER_MILE;
}

const TIER_INDEX = { '1A': 0, '1B': 1, '1C': 2 };

export function tierHubPenalty(originTier, destTier) {
  const o = TIER_INDEX[originTier] ?? 1;
  const d = TIER_INDEX[destTier] ?? 1;
  return Math.abs(o - d) * 0.5;
}

export function orbitalFlightHours(distanceKm, orbitalVelocityKmh) {
  if (!distanceKm || !orbitalVelocityKmh) return 0;
  return distanceKm / orbitalVelocityKmh;
}

export function conventionalFlightHours(distanceKm, defaults, originTier, destTier) {
  const cruise = distanceKm / (defaults.cruiseSpeedKmh || 850);
  const conn =
    distanceKm < (defaults.connectionDistanceThresholdKm ?? 5000)
      ? defaults.connectionHoursShort ?? 2
      : defaults.connectionHoursLong ?? 4;
  return cruise + conn + tierHubPenalty(originTier, destTier);
}

export function timeSavingsHours(conventionalHours, orbitalHours) {
  return Math.max(0, conventionalHours - orbitalHours);
}
