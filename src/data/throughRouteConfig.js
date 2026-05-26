/**
 * Through-route policy constants only — no graph generation.
 */

export const THROUGH_ROUTE_LIMITS = {
  hyperloopRadiusMiles: 700,
  edgeBandMinMiles: 500,
  edgeBandMaxMiles: 700,
  edgeCandidateMinMiles: 400,
  maxThroughRoutesPerHub: 4,
  minConnectorMiles: 60,
  maxConnectorMiles: 1100,
  minHubSeparationMiles: 250,
  maxHubSeparationMiles: 2600,
  minRouteScore: 18,
};

/** Continent pairs allowed for through-route candidates */
export const THROUGH_CONTINENT_BRIDGES = new Set([
  'Europe|Middle East',
  'Middle East|Europe',
  'East Asia|Southeast Asia',
  'Southeast Asia|East Asia',
  'South Asia|Middle East',
  'Middle East|South Asia',
]);
