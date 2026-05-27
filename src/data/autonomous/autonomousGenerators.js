/**
 * Autonomous transport asset generators (pure, deterministic).
 */

import { DEFAULTS, FEATURE_FLAGS } from './autonomousConstants.js';
import {
  geodesicCirclePolygon,
  greatCirclePath,
  samplePathByMiles,
  milesToMeters,
  distanceMiles,
} from './autonomousGeometry.js';
import {
  isRobotaxiEligible,
  isExtendedFeederEligible,
  isRoboCourierEligible,
  isAutonomousTruckingEligible,
  isIndustrialHub,
  isDronePortEligible,
  getRobotaxiEligibilityReasons,
} from './autonomousEligibility.js';
import {
  isRobotaxiHubLandEligible,
  isPointOnLand,
  filterLandChargingNodes,
  hasValidHubCountry,
} from './autonomousLandFilter.js';

/**
 * @param {object} hub
 * @returns {{ area: object | null, skipReason?: string }}
 */
export function generateRobotaxiServiceArea(hub) {
  const lat = hub.lat ?? hub.latitude;
  const lng = hub.lng ?? hub.longitude ?? hub.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { area: null, skipReason: 'missing_coordinates' };
  }

  if (!isRobotaxiHubLandEligible(hub)) {
    return { area: null, skipReason: 'missing_country_or_ocean' };
  }

  const radiusMiles = DEFAULTS.ROBOTAXI_RADIUS_MILES;
  const radiusMeters = DEFAULTS.ROBOTAXI_RADIUS_METERS;
  const geometry = geodesicCirclePolygon(lng, lat, radiusMeters);

  return {
    area: {
      id: `robotaxi-zone-${hub.id}`,
      type: 'autonomous_service_area',
      modeId: 'robotaxi_feeder',
      sourceHubId: hub.id,
      sourceHubName: hub.name,
      sourceHubTypes: hub.hubTypes ?? [],
      coordinates: [lng, lat],
      radiusMiles,
      radiusMeters,
      geometry,
      eligibilityReasons: hub.eligibilityReasons ?? getRobotaxiEligibilityReasons(hub),
      generated: true,
      label: `${hub.name} Autonomous Mobility Ring`,
    },
  };
}

/**
 * @param {object} origin
 * @param {object} destination
 */
function buildCorridor(origin, destination, modeId, vehicleClass, freightClass) {
  const lat1 = origin.lat ?? origin.latitude;
  const lng1 = origin.lng ?? origin.longitude ?? origin.lon;
  const lat2 = destination.lat ?? destination.latitude;
  const lng2 = destination.lng ?? destination.longitude ?? destination.lon;
  const path = greatCirclePath(lng1, lat1, lng2, lat2);
  const dist = distanceMiles(lat1, lng1, lat2, lng2);

  return {
    id: `${modeId}:${origin.id}--${destination.id}`,
    type: 'autonomous_road_corridor',
    modeId,
    vehicleClass,
    originHubId: origin.id,
    destinationHubId: destination.id,
    distanceMiles: dist,
    path,
    geometrySource: 'placeholder',
    roadAccessStatus: 'assumed',
    generated: true,
    freightClass,
    cargoClass: freightClass,
    eligibilityReasons: ['road_corridor_placeholder'],
  };
}

/**
 * @param {object} corridor
 * @param {{ hasTeslaDiner?: boolean, chargerType: string }} options
 */
export function generateChargingNodesForCorridor(corridor, options) {
  const { chargerType, hasTeslaDiner = false } = options;
  const samples = samplePathByMiles(corridor.path, DEFAULTS.CHARGING_INTERVAL_MILES);
  const nodes = samples.map((s, i) => ({
    id: `charge:${corridor.id}:${i}`,
    type: 'charging_node',
    chargerType,
    name: hasTeslaDiner
      ? `Tesla Diner Supercharger — ${corridor.originHubId}`
      : `${chargerType} — mile ${s.mileMarker}`,
    lat: s.lat,
    lng: s.lng,
    corridorId: corridor.id,
    sourceHubId: corridor.originHubId,
    mileMarker: s.mileMarker,
    spacingMiles: DEFAULTS.CHARGING_INTERVAL_MILES,
    supportedModes: [corridor.modeId],
    supportedVehicles: [corridor.vehicleClass],
    hasTeslaDiner,
    generated: true,
    sourceReason: `corridor_${corridor.modeId}`,
  }));
  return filterLandChargingNodes(nodes);
}

/**
 * @param {object} hub
 */
export function generateIndustrialExchangeHub(hub) {
  const lat = hub.lat ?? hub.latitude;
  const lng = hub.lng ?? hub.longitude ?? hub.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: `industrial-exchange:${hub.id}`,
    type: 'industrial_exchange_hub',
    name: `${hub.name} Industrial Exchange`,
    lat,
    lng,
    connectedModes: hub.modes ?? [],
    freightTypes: ['heavy_industrial_freight'],
    loadClasses: ['semi', 'container'],
    chargingTypes: ['megacharger', 'supercharger'],
    hasWarehouse: true,
    hasCrossDock: true,
    hasMegacharger: true,
    hasSupercharger: true,
    hasTeslaDiner: hub.tags?.includes('starbase'),
    generated: true,
    eligibilityReasons: ['industrial_hub'],
  };
}

/**
 * @param {object} hub
 */
export function generateIndustrialLogisticsReach(hub) {
  const lat = hub.lat ?? hub.latitude;
  const lng = hub.lng ?? hub.longitude ?? hub.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !hasValidHubCountry(hub)) {
    return null;
  }
  if (!isRobotaxiHubLandEligible(hub)) {
    return null;
  }

  const defaultRadiusMiles = DEFAULTS.INDUSTRIAL_DEFAULT_RADIUS_MILES;
  const extendedRadiusMiles = DEFAULTS.INDUSTRIAL_EXTENDED_RADIUS_MILES;
  const defaultRadiusMeters = milesToMeters(defaultRadiusMiles);
  const extendedRadiusMeters = milesToMeters(extendedRadiusMiles);

  return {
    id: `industrial-reach:${hub.id}`,
    type: 'industrial_logistics_reach',
    sourceHubId: hub.id,
    sourceHubName: hub.name,
    coordinates: [lng, lat],
    defaultRadiusMiles,
    extendedOnDemandRadiusMiles: extendedRadiusMiles,
    defaultRadiusMeters,
    extendedRadiusMeters,
    defaultGeometry: geodesicCirclePolygon(lng, lat, defaultRadiusMeters),
    extendedGeometry: geodesicCirclePolygon(lng, lat, extendedRadiusMeters),
    requiresRoadAccess: true,
    eligibleCorridors: [],
    generated: true,
    eligibilityReasons: ['industrial_hub'],
    activeByDefault: true,
  };
}

/** Future scaffold */
export function generateTeslaDronePortStub(hub) {
  if (!FEATURE_FLAGS.ENABLE_TESLA_DRONE_LAYER) return null;
  if (!isDronePortEligible(hub)) return null;
  const lat = hub.lat ?? hub.latitude;
  const lng = hub.lng ?? hub.longitude ?? hub.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: `drone-port:${hub.id}`,
    type: 'tesla_drone_port',
    modeId: 'tesla_drone_future',
    name: `${hub.name} Drone Port (future)`,
    lat,
    lng,
    parentHubId: hub.id,
    activeByDefault: false,
    generated: true,
    eligibilityReasons: ['future_scaffold'],
  };
}

/**
 * Pair corridors between eligible hubs (capped).
 */
function pairCorridors(hubs, predicate, modeId, vehicleClass, freightClass, maxPairs) {
  const corridors = [];
  const eligible = hubs.filter((h) => Number.isFinite(h.lat ?? h.latitude));
  for (let i = 0; i < eligible.length && corridors.length < maxPairs; i++) {
    for (let j = i + 1; j < eligible.length && corridors.length < maxPairs; j++) {
      const a = eligible[i];
      const b = eligible[j];
      if (!predicate(a, b)) continue;
      corridors.push(buildCorridor(a, b, modeId, vehicleClass, freightClass));
    }
  }
  return corridors;
}

/**
 * @param {object[]} hubs
 */
export function generateAllAutonomousAssets(hubs, flags = FEATURE_FLAGS) {
  const warnings = [];
  let skippedOverWater = 0;
  const robotaxiServiceAreas = [];
  const extendedFeederRoutes = [];
  const industrialExchangeHubs = [];
  const industrialLogisticsReach = [];
  const teslaDronePorts = [];

  for (const hub of hubs) {
    if (!Number.isFinite(hub.lat ?? hub.latitude) || !Number.isFinite(hub.lng ?? hub.longitude ?? hub.lon)) {
      warnings.push(`Skipped hub "${hub.name}" — missing coordinates`);
      continue;
    }

    if (flags.ENABLE_ROBOTAXI_SERVICE_AREAS && isRobotaxiEligible(hub)) {
      const { area, skipReason } = generateRobotaxiServiceArea(hub);
      if (area) {
        robotaxiServiceAreas.push(area);
      } else if (skipReason === 'missing_country_or_ocean') {
        skippedOverWater += 1;
        warnings.push(
          `[AUTONOMOUS] Skipped robotaxi ring for "${hub.name}" — missing country or ocean center`
        );
      }
    }

    if (flags.ENABLE_INDUSTRIAL_LOGISTICS_REACH && isIndustrialHub(hub)) {
      const exchange = generateIndustrialExchangeHub(hub);
      if (exchange) industrialExchangeHubs.push(exchange);
      const reach = generateIndustrialLogisticsReach(hub);
      if (reach) industrialLogisticsReach.push(reach);
    }

    const dronePort = generateTeslaDronePortStub(hub);
    if (dronePort) teslaDronePorts.push(dronePort);
  }

  if (flags.ENABLE_EXTENDED_FEEDER_ROUTES) {
    const feeders = pairCorridors(
      hubs.filter(isRobotaxiEligible),
      isExtendedFeederEligible,
      'extended_on_demand_feeder',
      'FSD_ROBOTAXI_OR_ROBOCOURIER',
      'extended_feeder',
      24
    );
    extendedFeederRoutes.push(
      ...feeders.map((c) => ({
        ...c,
        type: 'extended_on_demand_feeder_route',
        maxDistanceMiles: DEFAULTS.EXTENDED_FEEDER_MAX_MILES,
        activeByDefault: false,
      }))
    );
  }

  const roboCourierCorridors = flags.ENABLE_ROBOCOURIER_CORRIDORS
    ? pairCorridors(
        hubs.filter(isRobotaxiEligible),
        isRoboCourierEligible,
        'robocourier',
        'CYBERTRUCK',
        'small_package_fast_freight',
        DEFAULTS.MAX_ROBOCOURIER_CORRIDOR_PAIRS
      )
    : [];

  const autonomousTruckingCorridors = flags.ENABLE_AUTONOMOUS_TRUCKING_CORRIDORS
    ? pairCorridors(
        hubs.filter(isIndustrialHub),
        isAutonomousTruckingEligible,
        'autonomous_trucking',
        'TESLA_SEMI',
        'heavy_industrial_freight',
        DEFAULTS.MAX_TRUCKING_CORRIDOR_PAIRS
      )
    : [];

  const chargingNodes = [];
  if (flags.ENABLE_CHARGING_NODE_GENERATION) {
    for (const c of roboCourierCorridors) {
      chargingNodes.push(
        ...generateChargingNodesForCorridor(c, {
          chargerType: 'tesla_diner_supercharger',
          hasTeslaDiner: true,
        })
      );
    }
    for (const c of autonomousTruckingCorridors) {
      chargingNodes.push(
        ...generateChargingNodesForCorridor(c, {
          chargerType: 'megacharger',
          hasTeslaDiner: false,
        })
      );
    }
    for (const hub of hubs.filter(isRobotaxiEligible).slice(0, 40)) {
      const lat = hub.lat ?? hub.latitude;
      const lng = hub.lng ?? hub.longitude ?? hub.lon;
      if (!isPointOnLand(lat, lng, hub)) {
        skippedOverWater += 1;
        warnings.push(`[AUTONOMOUS] Skipped hub charger "${hub.name}" — not on land`);
        continue;
      }
      chargingNodes.push({
        id: `charge:hub:${hub.id}`,
        type: 'charging_node',
        chargerType: 'tesla_diner_supercharger',
        name: `Tesla Diner — ${hub.name}`,
        lat,
        lng,
        sourceHubId: hub.id,
        mileMarker: 0,
        spacingMiles: DEFAULTS.CHARGING_INTERVAL_MILES,
        hasTeslaDiner: true,
        generated: true,
        sourceReason: 'major_hub',
        country: hub.country,
      });
    }
  }

  const landChargingNodes = filterLandChargingNodes(chargingNodes);
  skippedOverWater += chargingNodes.length - landChargingNodes.length;

  return {
    robotaxiServiceAreas,
    extendedFeederRoutes,
    roboCourierCorridors,
    autonomousTruckingCorridors,
    chargingNodes: landChargingNodes,
    industrialExchangeHubs,
    industrialLogisticsReach,
    teslaDronePorts,
    teslaDroneCorridors: [],
    warnings,
    skippedOverWater,
  };
}
