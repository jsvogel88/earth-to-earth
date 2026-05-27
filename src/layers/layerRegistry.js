/**
 * Central map layer registry — metadata only (no graph generation).
 * Add new transport overlays here instead of scattering toggles across the map component.
 */

import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { INTEGRATED_GRID_PRESET } from '../ui/integratedGridFilters.js';

export const LAYER_GROUPS = {
  TRANSPORT_MODES: 'TRANSPORT_MODES',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  SPACE_E2M: 'SPACE_E2M',
  AUTONOMOUS_MOBILITY: 'AUTONOMOUS_MOBILITY',
  CARGO_RESOURCE: 'CARGO_RESOURCE',
  PLANNING_TOOLS: 'PLANNING_TOOLS',
  PLANNING: 'PLANNING',
  VISUALIZATION: 'VISUALIZATION',
  DEBUG_DEV: 'DEBUG_DEV',
};

export const LAYER_TYPES = {
  TRANSPORT_MODE: 'transport_mode',
  TOGGLE: 'toggle',
  OVERLAY: 'overlay',
  PRESET_TOGGLE: 'preset_toggle',
};

export const LAYER_PRESET_IDS = {
  STARBASE_VISION: 'starbase_vision',
};

export const LEGEND_GROUPS = {
  PASSENGER_E2E: 'Passenger — E2E Starship',
  HYPERLOOP: 'Hyperloop infrastructure',
  E2M: 'E2M orbital logistics',
  AUTONOMOUS: 'Autonomous Mobility',
  CARGO: 'Cargo & extraction',
  PLANNING: 'Planning layers',
  REMOTE: 'Remote / rural spines',
  FUTURE: 'Future systems',
};

/** @typedef {keyof typeof LAYER_GROUPS} LayerGroupId */
/** @typedef {keyof typeof LAYER_TYPES} LayerTypeId */

/**
 * @typedef {Object} MapLayerDef
 * @property {string} id
 * @property {string} label
 * @property {LayerGroupId} group
 * @property {boolean} defaultVisible
 * @property {number} [minZoom]
 * @property {number} [maxZoom]
 * @property {string} layerType
 * @property {string} [description]
 * @property {string[]} [dependsOn]
 * @property {number} [renderPriority]
 * @property {string} [legendGroup]
 * @property {string} [stateKey] — key on layerState object
 * @property {string} [deckLayerId] — deck.gl layer id when applicable
 * @property {string} [transportMode] — for transport_mode entries
 * @property {boolean} [disabled]
 * @property {Record<string, boolean>} [visibleInModes]
 */

/** @type {MapLayerDef[]} */
export const MAP_LAYER_REGISTRY = [
  // —— Transport modes (UI buttons, not checkboxes) ——
  {
    id: 'mode_e2e_starship',
    label: 'E2E Starship',
    group: LAYER_GROUPS.TRANSPORT_MODES,
    layerType: LAYER_TYPES.TRANSPORT_MODE,
    transportMode: TRANSPORT_MODES.E2E_STARSHIP,
    defaultVisible: false,
    renderPriority: 0,
  },
  {
    id: 'mode_e2m_orbital',
    label: 'E2M Orbital Logistics',
    group: LAYER_GROUPS.TRANSPORT_MODES,
    layerType: LAYER_TYPES.TRANSPORT_MODE,
    transportMode: TRANSPORT_MODES.E2M_ORBITAL,
    defaultVisible: false,
    renderPriority: 0,
  },
  {
    id: 'mode_hyperloop_core',
    label: 'Hyperloop Core Web',
    group: LAYER_GROUPS.TRANSPORT_MODES,
    layerType: LAYER_TYPES.TRANSPORT_MODE,
    transportMode: TRANSPORT_MODES.HYPERLOOP_CORE,
    defaultVisible: false,
    renderPriority: 0,
  },
  {
    id: 'mode_civilization_grid',
    label: 'Integrated Grid',
    group: LAYER_GROUPS.TRANSPORT_MODES,
    layerType: LAYER_TYPES.TRANSPORT_MODE,
    transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    defaultVisible: true,
    renderPriority: 0,
    description: 'Default integrated view — all strategic transport modes as one civilization grid',
  },
  {
    id: 'mode_robotaxi',
    label: 'Robotaxi / Autonomous Mobility',
    group: LAYER_GROUPS.TRANSPORT_MODES,
    layerType: LAYER_TYPES.TRANSPORT_MODE,
    transportMode: TRANSPORT_MODES.ROBOTAXI,
    defaultVisible: false,
    renderPriority: 0,
    description: 'First-mile / last-mile zones at hubs — no intercity routes',
  },

  // —— Infrastructure (Hyperloop core) ——
  {
    id: 'planetary_trunks',
    label: 'Planetary trunks',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showPlanetaryTrunks',
    defaultVisible: true,
    minZoom: 0,
    legendGroup: LEGEND_GROUPS.HYPERLOOP,
    renderPriority: 10,
    visibleInModes: { [TRANSPORT_MODES.HYPERLOOP_CORE]: true },
  },
  {
    id: 'regional_trunks',
    label: 'Regional trunks',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showRegionalTrunks',
    defaultVisible: true,
    minZoom: 2.5,
    legendGroup: LEGEND_GROUPS.HYPERLOOP,
    renderPriority: 11,
    visibleInModes: { [TRANSPORT_MODES.HYPERLOOP_CORE]: true },
  },
  {
    id: 'gateways',
    label: 'Gateways',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showGateways',
    defaultVisible: true,
    legendGroup: LEGEND_GROUPS.HYPERLOOP,
    renderPriority: 12,
    visibleInModes: { [TRANSPORT_MODES.HYPERLOOP_CORE]: true },
  },
  {
    id: 'through_routes',
    label: 'Through routes (corridor flow)',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showThroughRoutes',
    defaultVisible: true,
    deckLayerId: 'global-hyperloop-web-routes',
    legendGroup: LEGEND_GROUPS.HYPERLOOP,
    renderPriority: 13,
    visibleInModes: { [TRANSPORT_MODES.HYPERLOOP_CORE]: true },
  },
  {
    id: 'feeders',
    label: 'Feeders (zoom 5.5+)',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showFeeders',
    defaultVisible: false,
    minZoom: 5.5,
    legendGroup: LEGEND_GROUPS.HYPERLOOP,
    renderPriority: 14,
    dependsOn: ['showLocalFeeders'],
    visibleInModes: { [TRANSPORT_MODES.HYPERLOOP_CORE]: true, [TRANSPORT_MODES.E2E_STARSHIP]: true },
  },
  {
    id: 'local_feeders',
    label: 'Local feeder lines (zoom 6+)',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showLocalFeeders',
    defaultVisible: false,
    minZoom: 6,
    renderPriority: 15,
    visibleInModes: { [TRANSPORT_MODES.HYPERLOOP_CORE]: true, [TRANSPORT_MODES.E2E_STARSHIP]: true },
  },
  {
    id: 'remote_corridor_spines',
    label: 'Remote corridor spines (global)',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showRemoteCorridorSpines',
    defaultVisible: true,
    minZoom: 2,
    legendGroup: LEGEND_GROUPS.REMOTE,
    renderPriority: 16,
    visibleInModes: { [TRANSPORT_MODES.HYPERLOOP_CORE]: true },
  },
  {
    id: 'extended_rural',
    label: 'Extended rural / remote branches',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showExtendedRuralLayer',
    defaultVisible: false,
    minZoom: 4,
    legendGroup: LEGEND_GROUPS.REMOTE,
    renderPriority: 17,
    visibleInModes: { [TRANSPORT_MODES.HYPERLOOP_CORE]: true, [TRANSPORT_MODES.CIVILIZATION_GRID]: true },
  },
  {
    id: 'hyperloop_infrastructure',
    label: 'Hyperloop path infrastructure',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showHyperloopInfrastructure',
    defaultVisible: true,
    renderPriority: 9,
    visibleInModes: {
      [TRANSPORT_MODES.HYPERLOOP_CORE]: true,
      [TRANSPORT_MODES.E2E_STARSHIP]: true,
      [TRANSPORT_MODES.CIVILIZATION_GRID]: true,
    },
  },
  {
    id: 'planetary_skeleton',
    label: 'Planetary mobility skeleton',
    group: LAYER_GROUPS.INFRASTRUCTURE,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showPlanetarySkeleton',
    defaultVisible: true,
    minZoom: 0,
    maxZoom: 22,
    deckLayerId: 'planetary-skeleton-trunks',
    legendGroup: LEGEND_GROUPS.HYPERLOOP,
    description: 'Multi-modal trunk overview — read-only graph slice, not new edges',
    renderPriority: 8,
    visibleInModes: {
      [TRANSPORT_MODES.E2E_STARSHIP]: true,
      [TRANSPORT_MODES.CIVILIZATION_GRID]: true,
    },
  },
  {
    id: 'global_connectivity_corridors',
    label: 'Global connectivity corridors',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showGlobalConnectivityCorridors',
    defaultVisible: true,
    minZoom: 0,
    deckLayerId: 'global-connectivity-corridors',
    legendGroup: LEGEND_GROUPS.PLANNING,
    description: 'Conceptual macro corridors — planning overlay only',
    renderPriority: 47,
    visibleInModes: {
      [TRANSPORT_MODES.CIVILIZATION_GRID]: true,
      [TRANSPORT_MODES.E2E_STARSHIP]: true,
      [TRANSPORT_MODES.HYPERLOOP_CORE]: true,
    },
  },
  {
    id: 'intermodal_hub_halos',
    label: 'Intermodal hub halos',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showIntermodalHubHalos',
    defaultVisible: true,
    maxZoom: 5.5,
    deckLayerId: 'intermodal-hub-halos',
    legendGroup: LEGEND_GROUPS.HYPERLOOP,
    renderPriority: 18,
    description: 'Major hub emphasis at world zoom — visual only',
  },

  // —— Space / E2M ——
  {
    id: 'e2m_layer',
    label: 'E2M orbital nodes & corridors',
    group: LAYER_GROUPS.SPACE_E2M,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showE2MLayer',
    defaultVisible: false,
    deckLayerId: 'e2m-orbital-routes',
    legendGroup: LEGEND_GROUPS.E2M,
    renderPriority: 20,
    visibleInModes: { [TRANSPORT_MODES.E2M_ORBITAL]: true },
  },

  // —— Autonomous mobility / Robotaxi ——
  {
    id: 'robotaxi_master',
    label: 'Robotaxi layer (all zones)',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showRobotaxiLayer',
    defaultVisible: false,
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 30,
    description: 'Master toggle — service zones only, no road network',
  },
  {
    id: 'robotaxi_service_zones',
    label: 'Autonomous Robotaxi Coverage',
    description:
      '100-mile FSD service radius around Hyperloop hubs, Starbases, and major logistics cities.',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showRobotaxiServiceZones',
    defaultVisible: true,
    minZoom: 0,
    deckLayerId: 'robotaxi-service-zones',
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 31,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'robotaxi_pickup_dropoff',
    label: 'Hub pickup / dropoff',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showRobotaxiPickupDropoff',
    defaultVisible: false,
    minZoom: 6,
    deckLayerId: 'robotaxi-pickup-dropoff',
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 32,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'robotaxi_airport_downtown',
    label: 'Airport / downtown connectors',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showRobotaxiAirportConnectors',
    defaultVisible: false,
    minZoom: 5,
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 33,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'robotaxi_remote_last_mile',
    label: 'Remote last-mile access',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showRobotaxiRemoteLastMile',
    defaultVisible: false,
    minZoom: 3,
    deckLayerId: 'robotaxi-hub-availability',
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 34,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'robo_courier_corridors',
    label: 'RoboCourier / Cybertruck Routes',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showRoboCourierCorridors',
    defaultVisible: true,
    deckLayerId: 'autonomous-robocourier',
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 32,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'autonomous_trucking_corridors',
    label: 'Autonomous Trucking / Tesla Semi',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showAutonomousTruckingCorridors',
    defaultVisible: true,
    deckLayerId: 'autonomous-trucking',
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 33,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'autonomous_charging_network',
    label: 'Supercharger + Tesla Diner Network',
    description:
      'EV charging, food, rest, fleet staging, and delivery handoff nodes every 100 miles.',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showAutonomousChargingNetwork',
    defaultVisible: true,
    deckLayerId: 'autonomous-charging-supercharger',
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 34,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'autonomous_megacharger_network',
    label: 'Megacharger / Freight Charging Network',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showAutonomousMegachargerNetwork',
    defaultVisible: true,
    deckLayerId: 'autonomous-charging-megacharger',
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 35,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'industrial_exchange_hubs',
    label: 'Industrial Exchange Hubs',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showIndustrialExchangeHubs',
    defaultVisible: true,
    deckLayerId: 'autonomous-industrial-exchange',
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 40,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'industrial_logistics_reach',
    label: 'Industrial Logistics Reach',
    description: 'Supply-chain reach modeling from major industrial nodes (planning envelope).',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showIndustrialLogisticsReach',
    defaultVisible: false,
    minZoom: 0,
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 41,
    dependsOn: ['showRobotaxiLayer'],
  },
  {
    id: 'tesla_drone_ports',
    label: 'Tesla Drone Ports (Future)',
    group: LAYER_GROUPS.AUTONOMOUS_MOBILITY,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showTeslaDronePorts',
    defaultVisible: false,
    legendGroup: LEGEND_GROUPS.AUTONOMOUS,
    renderPriority: 90,
    dependsOn: ['showRobotaxiLayer'],
  },

  // —— Cargo / resource ——
  {
    id: 'rare_earth_hubs',
    label: 'Rare Earth hubs',
    group: LAYER_GROUPS.CARGO_RESOURCE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showRareEarthHubs',
    defaultVisible: false,
    legendGroup: LEGEND_GROUPS.CARGO,
    renderPriority: 40,
  },
  {
    id: 'remote_cargo_routes',
    label: 'Remote cargo / critical minerals',
    group: LAYER_GROUPS.CARGO_RESOURCE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showRemoteCargoRoutes',
    defaultVisible: false,
    minZoom: 2,
    legendGroup: LEGEND_GROUPS.CARGO,
    renderPriority: 41,
  },
  {
    id: 'cargo_corridors',
    label: 'Cargo corridors',
    group: LAYER_GROUPS.CARGO_RESOURCE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showCargoCorridors',
    defaultVisible: false,
    legendGroup: LEGEND_GROUPS.CARGO,
    renderPriority: 42,
  },

  // —— Planning tools ——
  {
    id: 'custom_destinations',
    label: 'Custom destinations (user-added)',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showCustomDestinations',
    defaultVisible: true,
    deckLayerId: 'custom-destinations',
    legendGroup: LEGEND_GROUPS.PLANNING,
    renderPriority: 48,
    description: 'Planning markers only — no auto-routes',
  },
  {
    id: 'custom_destination_labels',
    label: 'Custom destination labels',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showCustomDestinationLabels',
    defaultVisible: true,
    minZoom: 5,
    deckLayerId: 'custom-destination-labels',
    legendGroup: LEGEND_GROUPS.PLANNING,
    renderPriority: 49,
    dependsOn: ['showCustomDestinations'],
  },
  {
    id: 'custom_connection_preview',
    label: 'Custom Connection Preview',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showCustomConnectionPreview',
    defaultVisible: false,
    deckLayerId: 'custom-connection-preview',
    legendGroup: LEGEND_GROUPS.PLANNING,
    renderPriority: 49.5,
    description: 'Dashed planning lines only — not in network graph',
    dependsOn: ['showCustomDestinations'],
  },
  {
    id: 'parsed_cities',
    label: 'Parsed cities (bulk import)',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showParsedCities',
    defaultVisible: true,
    deckLayerId: 'parsed-cities',
    legendGroup: LEGEND_GROUPS.PLANNING,
    renderPriority: 49.2,
    description: 'Bulk-pasted destinations — overlay only, no graph edges',
  },
  {
    id: 'parsed_cities_labels',
    label: 'Parsed city labels',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showParsedCitiesLabels',
    defaultVisible: true,
    minZoom: 5,
    deckLayerId: 'parsed-cities-labels',
    legendGroup: LEGEND_GROUPS.PLANNING,
    renderPriority: 49.25,
    dependsOn: ['showParsedCities'],
  },

  // —— Planning ——
  {
    id: 'world_planning_grid',
    label: 'World Planning Grid',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.OVERLAY,
    stateKey: 'showWorldCitiesPlanningGrid',
    defaultVisible: false,
    deckLayerId: 'world-cities-planning-grid',
    legendGroup: LEGEND_GROUPS.PLANNING,
    renderPriority: 50,
    description: 'Planning dots only — no edges',
  },
  {
    id: 'future_high_pop',
    label: 'Future high-population hubs',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showFutureHighPopulationHubs',
    defaultVisible: false,
    legendGroup: LEGEND_GROUPS.PLANNING,
    renderPriority: 51,
  },
  {
    id: 'extended_global_coverage',
    label: 'Extended global coverage nodes',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showExtendedGlobalCoverageNodes',
    defaultVisible: false,
    renderPriority: 52,
  },

  // —— Visualization ——
  {
    id: 'glow_effects',
    label: 'Glow effects',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showGlowEffects',
    defaultVisible: true,
    renderPriority: 60,
  },
  {
    id: 'labels',
    label: 'Hub labels (zoom 5+)',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showLabels',
    defaultVisible: true,
    minZoom: 5,
    renderPriority: 61,
  },
  {
    id: 'traffic_flow',
    label: 'Mobility simulation overlay',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showTrafficFlow',
    defaultVisible: false,
    renderPriority: 62,
  },
  {
    id: 'gdp_weighting',
    label: 'GDP / economic corridor overlay',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showGdpWeighting',
    defaultVisible: false,
    renderPriority: 63,
  },
  {
    id: 'density_reduction',
    label: 'Density reduction (preview)',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showDensityReduction',
    defaultVisible: false,
    disabled: true,
    renderPriority: 64,
  },

  // —— Starbase hub system (Phase 9+) ——
  {
    id: 'starbase_vision_preview',
    label: 'Show Starbase System (Vision Preview)',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.PRESET_TOGGLE,
    presetId: LAYER_PRESET_IDS.STARBASE_VISION,
    defaultVisible: false,
    renderPriority: 69,
    description:
      'Enables Starbase hubs, labels, PETABOND highlights, and intermodal connectors. Off by default.',
  },
  {
    id: 'starbase_hubs',
    label: 'Starbase Hubs',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showStarbaseHubs',
    defaultVisible: false,
    legendGroup: LEGEND_GROUPS.FUTURE,
    renderPriority: 70,
    description: 'Strategic node intelligence layer (some conceptual).',
  },
  {
    id: 'starbase_labels',
    label: 'Starbase labels',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showStarbaseLabels',
    defaultVisible: false,
    renderPriority: 71,
    dependsOn: ['starbase_hubs'],
  },
  {
    id: 'starbase_connectivity',
    label: 'Starbase connectivity',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showStarbaseConnectivity',
    defaultVisible: false,
    renderPriority: 72,
    dependsOn: ['starbase_hubs'],
    description: 'Thin intermodal connectors from Starbase hubs to E2E / RE2E / Hyperloop / Auto anchors.',
  },
  {
    id: 'petabond_export',
    label: 'PETABOND Export Packages',
    group: LAYER_GROUPS.VISUALIZATION,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showPetabondExportPackages',
    defaultVisible: false,
    renderPriority: 73,
    dependsOn: ['starbase_hubs'],
    description: 'Future-ready: highlight hubs eligible for PETABOND export.',
  },

  // —— Cargo / strategic access (placeholders) ——
  {
    id: 'arctic_access',
    label: 'Arctic access corridors',
    group: LAYER_GROUPS.CARGO_RESOURCE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showArcticAccess',
    defaultVisible: false,
    disabled: true,
    legendGroup: LEGEND_GROUPS.REMOTE,
    renderPriority: 43,
  },
  {
    id: 'desert_access',
    label: 'Desert corridors',
    group: LAYER_GROUPS.CARGO_RESOURCE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showDesertAccess',
    defaultVisible: false,
    disabled: true,
    legendGroup: LEGEND_GROUPS.REMOTE,
    renderPriority: 44,
  },
  {
    id: 'outback_access',
    label: 'Outback access',
    group: LAYER_GROUPS.CARGO_RESOURCE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showOutbackAccess',
    defaultVisible: false,
    disabled: true,
    legendGroup: LEGEND_GROUPS.REMOTE,
    renderPriority: 45,
  },
  {
    id: 'island_access',
    label: 'Island access',
    group: LAYER_GROUPS.CARGO_RESOURCE,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showIslandAccess',
    defaultVisible: false,
    disabled: true,
    legendGroup: LEGEND_GROUPS.REMOTE,
    renderPriority: 46,
  },

  // —— Integrated Grid filters (Phase 3) ——
  {
    id: 'integrated_mineral_hubs',
    label: 'E2M mineral hubs',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showIntegratedMineralHubs',
    defaultVisible: true,
    legendGroup: LEGEND_GROUPS.E2M,
    renderPriority: 22,
  },
  {
    id: 'filter_population_1m',
    label: 'Population 1M+ only',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showPopulation1MPlusOnly',
    defaultVisible: false,
    renderPriority: 23,
  },
  {
    id: 'filter_e2e_eligible',
    label: 'E2E eligible only',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showE2EEligibleOnly',
    defaultVisible: false,
    renderPriority: 24,
  },
  {
    id: 'filter_e2m_hubs_only',
    label: 'E2M hubs only',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showE2MHubsOnly',
    defaultVisible: false,
    renderPriority: 25,
  },
  {
    id: 'filter_feeder_routes',
    label: 'Feeder / resource routes',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showFeederRoutesFilter',
    defaultVisible: true,
    renderPriority: 26,
  },
  {
    id: 'filter_major_corridors',
    label: 'Major corridors only',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showMajorCorridorsOnly',
    defaultVisible: false,
    renderPriority: 27,
  },
  {
    id: 'filter_integrated_e2e',
    label: 'Show E2E layer',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showIntegratedE2E',
    defaultVisible: true,
    renderPriority: 28,
  },
  {
    id: 'filter_integrated_e2m',
    label: 'Show E2M layer',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showIntegratedE2M',
    defaultVisible: true,
    renderPriority: 29,
  },
  {
    id: 'filter_integrated_hyperloop',
    label: 'Show Hyperloop layer',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showIntegratedHyperloop',
    defaultVisible: true,
    renderPriority: 30,
  },
  {
    id: 'filter_integrated_loop',
    label: 'Show Loop layer',
    group: LAYER_GROUPS.PLANNING_TOOLS,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showIntegratedLoop',
    defaultVisible: true,
    renderPriority: 31,
  },

  // —— Debug ——
  {
    id: 'connectivity_repair',
    label: 'Connectivity repair links',
    group: LAYER_GROUPS.DEBUG_DEV,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showConnectivityRepairLinks',
    defaultVisible: false,
    renderPriority: 70,
  },
  {
    id: 'disconnected_audit',
    label: 'Disconnected nodes audit',
    group: LAYER_GROUPS.DEBUG_DEV,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showDisconnectedAudit',
    defaultVisible: false,
    renderPriority: 71,
  },
  {
    id: 'world_cities_master',
    label: 'World Cities master (Route Optimizer)',
    group: LAYER_GROUPS.DEBUG_DEV,
    layerType: LAYER_TYPES.TOGGLE,
    stateKey: 'showWorldCitiesMasterFile',
    defaultVisible: false,
    disabled: true,
    renderPriority: 72,
  },
];

const MODE_PRESETS = {
  [TRANSPORT_MODES.E2E_STARSHIP]: {
    showThroughRoutes: false,
    showPlanetaryTrunks: true,
    showRegionalTrunks: false,
    showGateways: true,
    showFeeders: true,
    showRemoteCorridorSpines: false,
    showRareEarthHubs: false,
    showRemoteCargoRoutes: false,
    showFutureHighPopulationHubs: false,
    showExtendedGlobalCoverageNodes: false,
    showConnectivityRepairLinks: false,
    showExtendedRuralLayer: false,
    showWorldCitiesPlanningGrid: false,
    showLocalFeeders: true,
    showE2MLayer: true,
    showRobotaxiLayer: true,
    showRobotaxiServiceZones: true,
    showRobotaxiRemoteLastMile: true,
    showHyperloopInfrastructure: true,
    showPlanetarySkeleton: true,
    showGlobalConnectivityCorridors: true,
    showIntermodalHubHalos: true,
  },
  [TRANSPORT_MODES.E2M_ORBITAL]: {
    showE2MLayer: true,
    showIntegratedMineralHubs: true,
    showIntegratedE2M: true,
    showIntegratedE2E: true,
    showIntegratedHyperloop: true,
    showFeederRoutesFilter: true,
    showE2MHubsOnly: true,
    showHyperloopInfrastructure: false,
    showThroughRoutes: false,
    showPlanetaryTrunks: false,
    showRegionalTrunks: false,
    showGateways: false,
    showFeeders: false,
    showRemoteCorridorSpines: false,
    showWorldCitiesPlanningGrid: false,
    showRobotaxiLayer: true,
    showRobotaxiRemoteLastMile: true,
    showGlobalConnectivityCorridors: false,
    showPlanetarySkeleton: false,
  },
  [TRANSPORT_MODES.HYPERLOOP_CORE]: {
    showThroughRoutes: true,
    showPlanetaryTrunks: true,
    showRegionalTrunks: true,
    showGateways: true,
    showFeeders: false,
    showRemoteCorridorSpines: true,
    showRareEarthHubs: false,
    showRemoteCargoRoutes: false,
    showFutureHighPopulationHubs: false,
    showExtendedGlobalCoverageNodes: false,
    showConnectivityRepairLinks: false,
    showLocalFeeders: false,
    showWorldCitiesPlanningGrid: false,
    showE2MLayer: false,
    showRobotaxiLayer: true,
    showRobotaxiRemoteLastMile: true,
    showHyperloopInfrastructure: true,
    showGlobalConnectivityCorridors: true,
    showIntermodalHubHalos: true,
    showPlanetarySkeleton: false,
  },
  [TRANSPORT_MODES.CIVILIZATION_GRID]: {
    ...INTEGRATED_GRID_PRESET,
  },
  [TRANSPORT_MODES.ROBOTAXI]: {
    showRobotaxiLayer: true,
    showRobotaxiServiceZones: true,
    showRobotaxiPickupDropoff: true,
    showRobotaxiAirportConnectors: true,
    showRobotaxiRemoteLastMile: true,
    showHyperloopInfrastructure: false,
    showThroughRoutes: false,
    showPlanetaryTrunks: false,
    showRegionalTrunks: false,
    showGateways: false,
    showE2MLayer: true,
    showWorldCitiesPlanningGrid: false,
    showPlanetarySkeleton: false,
    showGlobalConnectivityCorridors: false,
  },
};

export function getTransportModeLayers() {
  return MAP_LAYER_REGISTRY.filter((l) => l.layerType === LAYER_TYPES.TRANSPORT_MODE);
}

export function getLayersByGroup(groupId) {
  return MAP_LAYER_REGISTRY.filter(
    (l) =>
      l.group === groupId &&
      l.layerType !== LAYER_TYPES.TRANSPORT_MODE &&
      (l.stateKey || l.layerType === LAYER_TYPES.PRESET_TOGGLE)
  );
}

export function getLayerById(id) {
  return MAP_LAYER_REGISTRY.find((l) => l.id === id) ?? null;
}

export function getLayerByStateKey(stateKey) {
  return MAP_LAYER_REGISTRY.find((l) => l.stateKey === stateKey) ?? null;
}

/** Build default layerState from registry + transport mode preset */
export function buildDefaultLayerState(transportMode) {
  const base = {};
  MAP_LAYER_REGISTRY.forEach((layer) => {
    if (layer.stateKey) {
      base[layer.stateKey] = layer.defaultVisible;
    }
  });
  const preset = MODE_PRESETS[transportMode];
  if (preset) {
    return { ...base, ...preset };
  }
  return base;
}

export function isLayerVisibleAtZoom(layerDef, zoom) {
  if (!layerDef) return true;
  if (layerDef.minZoom != null && zoom < layerDef.minZoom) return false;
  if (layerDef.maxZoom != null && zoom > layerDef.maxZoom) return false;
  return true;
}

export const GROUP_SECTION_TITLES = {
  [LAYER_GROUPS.TRANSPORT_MODES]: 'Transport Modes',
  [LAYER_GROUPS.INFRASTRUCTURE]: 'Infrastructure Layers',
  [LAYER_GROUPS.SPACE_E2M]: 'E2M',
  [LAYER_GROUPS.AUTONOMOUS_MOBILITY]: 'Robotaxi',
  [LAYER_GROUPS.PLANNING_TOOLS]: 'Planning Tools',
  [LAYER_GROUPS.CARGO_RESOURCE]: 'Cargo / Strategic',
  [LAYER_GROUPS.VISUALIZATION]: 'Visualization',
  [LAYER_GROUPS.DEBUG_DEV]: 'Debug / Dev',
};

/** Sidebar section order (progressive disclosure). */
export const SIDEBAR_GROUP_ORDER = [
  LAYER_GROUPS.TRANSPORT_MODES,
  LAYER_GROUPS.INFRASTRUCTURE,
  LAYER_GROUPS.SPACE_E2M,
  LAYER_GROUPS.AUTONOMOUS_MOBILITY,
  LAYER_GROUPS.PLANNING_TOOLS,
  LAYER_GROUPS.CARGO_RESOURCE,
  LAYER_GROUPS.VISUALIZATION,
  LAYER_GROUPS.DEBUG_DEV,
];
