/**
 * Autonomous mode registry — single source of truth for autonomous layer modes.
 */

export const AUTONOMOUS_MODES = {
  ROBOTAXI_FEEDER: {
    modeId: 'robotaxi_feeder',
    label: 'Autonomous Robotaxi Coverage',
    vehicleClass: 'FSD_ROBOTAXI',
    purpose: 'passenger_local_feeder',
    geometryType: 'service_area',
    defaultRadiusMiles: 100,
    eligibleHubTypes: [
      'hyperloop_hub',
      'starbase_hub',
      'major_city',
      'major_intermodal_hub',
      'e2e_hub_passenger',
      'e2m_hub_passenger',
    ],
    defaultVisibility: true,
    legendGroup: 'Autonomous Transport',
    renderOrder: 30,
    stateKey: 'showRobotaxiServiceZones',
    featureFlag: 'ENABLE_ROBOTAXI_SERVICE_AREAS',
  },

  EXTENDED_ON_DEMAND_FEEDER: {
    modeId: 'extended_on_demand_feeder',
    label: 'Extended On-Demand Feeder Routes',
    vehicleClass: 'FSD_ROBOTAXI_OR_ROBOCOURIER',
    purpose: 'extended_regional_passenger_small_package',
    geometryType: 'road_corridor',
    maxDistanceMiles: 300,
    requiresRoadAccess: true,
    defaultVisibility: false,
    legendGroup: 'Autonomous Transport',
    renderOrder: 31,
    stateKey: 'showAutonomousExtendedFeeder',
    featureFlag: 'ENABLE_EXTENDED_FEEDER_ROUTES',
  },

  ROBOCOURIER: {
    modeId: 'robocourier',
    label: 'RoboCourier / Cybertruck Routes',
    vehicleClass: 'CYBERTRUCK',
    purpose: 'fast_small_package_freight',
    geometryType: 'road_corridor',
    chargingIntervalMiles: 100,
    requiresRoadAccess: true,
    defaultVisibility: true,
    legendGroup: 'Autonomous Transport',
    renderOrder: 32,
    stateKey: 'showRoboCourierCorridors',
    featureFlag: 'ENABLE_ROBOCOURIER_CORRIDORS',
  },

  AUTONOMOUS_TRUCKING: {
    modeId: 'autonomous_trucking',
    label: 'Autonomous Trucking / Tesla Semi',
    vehicleClass: 'TESLA_SEMI',
    purpose: 'heavy_industrial_freight',
    geometryType: 'road_corridor',
    chargingIntervalMiles: 100,
    requiresRoadAccess: true,
    defaultVisibility: true,
    legendGroup: 'Autonomous Transport',
    renderOrder: 33,
    stateKey: 'showAutonomousTruckingCorridors',
    featureFlag: 'ENABLE_AUTONOMOUS_TRUCKING_CORRIDORS',
  },

  INDUSTRIAL_LOGISTICS_RADIUS: {
    modeId: 'industrial_logistics_radius',
    label: 'Industrial Logistics Reach',
    vehicleClass: 'MIXED_AUTONOMOUS_FREIGHT',
    purpose: 'industrial_supply_chain_reach_modeling',
    geometryType: 'service_radius_envelope',
    defaultRadiusMiles: 1000,
    extendedRadiusMiles: 3000,
    requiresRoadAccess: true,
    defaultVisibility: false,
    legendGroup: 'Industrial',
    renderOrder: 40,
    stateKey: 'showIndustrialLogisticsReach',
    featureFlag: 'ENABLE_INDUSTRIAL_LOGISTICS_REACH',
  },

  TESLA_DRONE_FUTURE: {
    modeId: 'tesla_drone_future',
    label: 'Tesla Drone Delivery (Future)',
    vehicleClass: 'TESLA_DRONE',
    purpose: 'future_autonomous_aerial_delivery',
    geometryType: 'aerial_service_area_and_corridor',
    defaultVisibility: false,
    featureFlag: 'ENABLE_TESLA_DRONE_LAYER',
    legendGroup: 'Future Layers',
    renderOrder: 90,
    stateKey: 'showTeslaDronePorts',
  },
};

export function getAutonomousModeById(modeId) {
  return Object.values(AUTONOMOUS_MODES).find((m) => m.modeId === modeId) ?? null;
}
