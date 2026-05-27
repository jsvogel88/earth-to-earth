/**
 * Robotaxi / autonomous mobility — local service zones at infrastructure hubs.
 * No intercity edges; no road network. Overlay geometry only.
 */

import { networkCityId } from './worldCities.js';
import { normalizeCityKey } from './hyperloopPhase1Cities.js';
import { E2M_NODE_TYPES } from './e2mOrbitalNodes.js';
import { isHubOnLand } from './autonomous/autonomousLandFilter.js';

export const ROBOTAXI_MODE = 'ROBOTAXI';

export const ROBOTAXI_NODE_TYPES = {
  SERVICE_ZONE: 'ROBOTAXI_SERVICE_ZONE',
  PICKUP_DROPOFF: 'ROBOTAXI_PICKUP_DROPOFF',
  HUB_AVAILABILITY: 'ROBOTAXI_HUB_AVAILABILITY',
};

/** Hubs with known airport / downtown connector need */
const CONNECTOR_FLAGS = {
  'new york': { airportConnector: true, downtownConnector: true },
  'london': { airportConnector: true, downtownConnector: true },
  'paris': { airportConnector: true, downtownConnector: true },
  'tokyo': { airportConnector: true, downtownConnector: true },
  'dubai': { airportConnector: true, downtownConnector: true },
  'singapore': { airportConnector: true, downtownConnector: true },
  'los angeles': { airportConnector: true, downtownConnector: true },
  'san francisco': { airportConnector: true, downtownConnector: true },
  'chicago': { airportConnector: true, downtownConnector: true },
  'frankfurt': { airportConnector: true, downtownConnector: true },
  'istanbul': { airportConnector: true, downtownConnector: true },
  'sydney': { airportConnector: true, downtownConnector: true },
  'mumbai': { airportConnector: true, downtownConnector: true },
  'shanghai': { airportConnector: true, downtownConnector: true },
  'houston': { industrialConnector: true, airportConnector: true },
  'cape canaveral': { industrialConnector: true },
  'perth': { remoteLastMileConnector: true },
  'nuuk': { remoteLastMileConnector: true },
  'anchorage': { remoteLastMileConnector: true },
};

function connectorFlagsForHub(name) {
  const flags = CONNECTOR_FLAGS[normalizeCityKey(name)] || {};
  return {
    airportConnector: Boolean(flags.airportConnector),
    downtownConnector: Boolean(flags.downtownConnector),
    industrialConnector: Boolean(flags.industrialConnector),
    remoteLastMileConnector: Boolean(flags.remoteLastMileConnector),
    cargoLastMileConnector: Boolean(flags.cargoLastMileConnector),
  };
}

function serviceRadiusForHub(hub) {
  const pop = hub.population ?? 0;
  if (pop >= 5_000_000) return 22;
  if (pop >= 2_000_000) return 18;
  if (pop >= 800_000) return 14;
  if (pop >= 200_000) return 10;
  return 8;
}

function demandScoreForHub(hub) {
  const pop = hub.population ?? 0;
  return Math.min(100, Math.round(Math.log10(Math.max(pop, 50_000)) * 22));
}

/**
 * @param {number} lat
 * @param {number} lon
 * @param {number} radiusMiles
 * @returns {import('geojson').Feature}
 */
export function buildServiceZonePolygon(lat, lon, radiusMiles) {
  const points = [];
  const latPerMile = 1 / 69;
  const lonPerMile = 1 / (69 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    points.push([
      lon + radiusMiles * lonPerMile * Math.sin(angle),
      lat + radiusMiles * latPerMile * Math.cos(angle),
    ]);
  }
  points.push(points[0]);

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [points] },
    properties: { type: 'robotaxi_zone' },
  };
}

/**
 * Generate pickup/dropoff points inside zone (no connecting lines).
 */
function buildPickupDropoffPoints(hub, count = 6) {
  const r = serviceRadiusForHub(hub) * 0.55;
  const latPerMile = 1 / 69;
  const lonPerMile = 1 / (69 * Math.cos((hub.lat * Math.PI) / 180));
  const points = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + 0.3;
    points.push({
      id: `${hub.id}-pd-${i}`,
      parentHubId: hub.parentHubId || hub.networkCityId || hub.id,
      parentHubName: hub.name,
      mode: ROBOTAXI_MODE,
      nodeType: ROBOTAXI_NODE_TYPES.PICKUP_DROPOFF,
      lat: hub.lat + r * latPerMile * Math.cos(angle),
      lon: hub.lon + r * lonPerMile * Math.sin(angle),
      name: `${hub.name} zone ${i + 1}`,
      renderable: true,
      planningOnly: true,
    });
  }
  return points;
}

/**
 * @param {object} hub — map hub or graph node with lat/lon/name
 * @param {object} [options]
 */
export function buildRobotaxiZoneFromHub(hub, options = {}) {
  const flags = connectorFlagsForHub(hub.name);
  const radius = options.serviceRadiusMiles ?? serviceRadiusForHub(hub);
  const parentHubId =
    hub.networkCityId || hub.id || networkCityId(hub.name, hub.country || '');

  return {
    id: `robotaxi-${normalizeCityKey(hub.name)}`,
    parentHubId,
    parentHubName: hub.name,
    mode: ROBOTAXI_MODE,
    nodeType: ROBOTAXI_NODE_TYPES.SERVICE_ZONE,
    lat: hub.lat,
    lon: hub.lon,
    country: hub.country || '',
    serviceRadiusMiles: radius,
    estimatedFleetSize: null,
    demandScore: demandScoreForHub(hub),
    populationServed: hub.population ?? null,
    ...flags,
    requiresValidation: true,
    renderable: hub.lat != null && hub.lon != null,
    isMajorHub: Boolean(hub.isE2EHub || hub.tier === 0 || options.isE2EHub),
    zoneFeature: buildServiceZonePolygon(hub.lat, hub.lon, radius),
    pickupDropoffPoints: buildPickupDropoffPoints({
      ...hub,
      parentHubId,
      id: parentHubId,
    }),
  };
}

/**
 * Build robotaxi zones from active hubs + optional trunk stations (no edges).
 * @param {{
 *   activeE2EHubs?: object[],
 *   trunkStations?: object[],
 *   e2mNodes?: object[],
 *   rareEarthNodes?: object[],
 *   includeTrunkStations?: boolean,
 * }} params
 */
export function buildRobotaxiServiceZones({
  activeE2EHubs = [],
  trunkStations = [],
  e2mNodes = [],
  rareEarthNodes = [],
  customDestinations = [],
  includeTrunkStations = true,
  includeAllMajorHyperloopHubs = true,
} = {}) {
  const zones = [];
  const seen = new Set();

  const addHub = (hub, opts = {}) => {
    const lat = hub?.lat ?? hub?.latitude;
    const lng = hub?.lng ?? hub?.longitude ?? hub?.lon;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (!isHubOnLand({ ...hub, lat, lng })) return;
    const key = normalizeCityKey(hub.name);
    if (seen.has(key)) return;
    seen.add(key);
    zones.push(
      buildRobotaxiZoneFromHub(
        { ...hub, isE2EHub: opts.isE2EHub ?? hub.isE2EHub },
        opts
      )
    );
  };

  activeE2EHubs.forEach((h) => addHub(h, { isE2EHub: true }));

  if (includeTrunkStations && includeAllMajorHyperloopHubs) {
    trunkStations
      .filter(
        (n) =>
          n.isE2EHub ||
          n.isSwitchNode ||
          n.isIntermodalGateway ||
          (n.tier != null && n.tier <= 3)
      )
      .forEach((n) => addHub(n));
  }

  customDestinations
    .filter((d) => d.lat != null && d.lon != null)
    .slice(0, 40)
    .forEach((d) =>
      addHub(
        {
          name: d.name || d.city,
          lat: d.lat,
          lon: d.lon,
          country: d.country,
          population: d.population,
        },
        { serviceRadiusMiles: 10 }
      )
    );

  e2mNodes.forEach((n) => {
    addHub(n, {
      industrialConnector: true,
      serviceRadiusMiles: 12,
    });
  });

  rareEarthNodes
    .filter((n) => n.cargoPriority || n.nodeType?.includes('RARE'))
    .slice(0, 24)
    .forEach((n) => {
      addHub(n, { cargoLastMileConnector: true, serviceRadiusMiles: 10 });
    });

  return zones;
}

export function isE2MNodeForRobotaxi(node) {
  return Boolean(node?.e2mLayer || node?.nodeType === E2M_NODE_TYPES.LAUNCH_ZONE);
}
