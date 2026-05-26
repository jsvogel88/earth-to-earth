/**
 * Mode test contracts — required metadata for every transport mode in the layer registry.
 * When adding a new transport_mode entry to MAP_LAYER_REGISTRY, add a matching contract here.
 */

import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { GROUP_SECTION_TITLES, LAYER_GROUPS } from '../layers/layerRegistry.js';

/** @typedef {'transport'|'overlay'|'planning'|'cargo'|'space'|'local'|'debug'} ModeCategory */
/** @typedef {'routes'|'overlayOnly'|'nodesOnly'|'none'} ExpectedGraphBehavior */

/**
 * @typedef {Object} ModeTestContract
 * @property {string} id — registry layer id (mode_*)
 * @property {string} registryModeId — same as id; used for contract sync checks
 * @property {string} label
 * @property {ModeCategory} category
 * @property {ExpectedGraphBehavior} expectedGraphBehavior
 * @property {boolean} createsIntercityEdges
 * @property {boolean} createsLocalEdges
 * @property {boolean} defaultVisible
 * @property {string} sidebarGroup — GROUP_SECTION_TITLES value
 * @property {boolean} requiresLegend
 * @property {boolean} requiresScreenshot
 * @property {boolean} heavyLayer
 * @property {boolean} debugOnly
 * @property {string} transportMode — TRANSPORT_MODES value
 */

/** @type {ModeTestContract[]} */
export const MODE_TEST_CONTRACTS = [
  {
    id: 'mode_e2e_starship',
    registryModeId: 'mode_e2e_starship',
    label: 'E2E Starship',
    category: 'transport',
    expectedGraphBehavior: 'routes',
    createsIntercityEdges: true,
    createsLocalEdges: true,
    defaultVisible: false,
    sidebarGroup: GROUP_SECTION_TITLES[LAYER_GROUPS.TRANSPORT_MODES],
    requiresLegend: true,
    requiresScreenshot: true,
    heavyLayer: false,
    debugOnly: false,
    transportMode: TRANSPORT_MODES.E2E_STARSHIP,
  },
  {
    id: 'mode_e2m_orbital',
    registryModeId: 'mode_e2m_orbital',
    label: 'E2M Orbital Logistics',
    category: 'space',
    expectedGraphBehavior: 'routes',
    createsIntercityEdges: true,
    createsLocalEdges: true,
    defaultVisible: false,
    sidebarGroup: GROUP_SECTION_TITLES[LAYER_GROUPS.TRANSPORT_MODES],
    requiresLegend: true,
    requiresScreenshot: true,
    heavyLayer: false,
    debugOnly: false,
    transportMode: TRANSPORT_MODES.E2M_ORBITAL,
  },
  {
    id: 'mode_hyperloop_core',
    registryModeId: 'mode_hyperloop_core',
    label: 'Hyperloop Core Web',
    category: 'transport',
    expectedGraphBehavior: 'routes',
    createsIntercityEdges: true,
    createsLocalEdges: true,
    defaultVisible: false,
    sidebarGroup: GROUP_SECTION_TITLES[LAYER_GROUPS.TRANSPORT_MODES],
    requiresLegend: true,
    requiresScreenshot: true,
    heavyLayer: false,
    debugOnly: false,
    transportMode: TRANSPORT_MODES.HYPERLOOP_CORE,
  },
  {
    id: 'mode_civilization_grid',
    registryModeId: 'mode_civilization_grid',
    label: 'Integrated Grid',
    category: 'planning',
    expectedGraphBehavior: 'overlayOnly',
    createsIntercityEdges: false,
    createsLocalEdges: false,
    defaultVisible: true,
    sidebarGroup: GROUP_SECTION_TITLES[LAYER_GROUPS.TRANSPORT_MODES],
    requiresLegend: true,
    requiresScreenshot: true,
    heavyLayer: true,
    debugOnly: false,
    transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
  },
  {
    id: 'mode_robotaxi',
    registryModeId: 'mode_robotaxi',
    label: 'Robotaxi / Autonomous Mobility',
    category: 'local',
    expectedGraphBehavior: 'overlayOnly',
    createsIntercityEdges: false,
    createsLocalEdges: true,
    defaultVisible: false,
    sidebarGroup: GROUP_SECTION_TITLES[LAYER_GROUPS.TRANSPORT_MODES],
    requiresLegend: true,
    requiresScreenshot: true,
    heavyLayer: false,
    debugOnly: false,
    transportMode: TRANSPORT_MODES.ROBOTAXI,
  },
];

export const LAYER_TEST_CATEGORIES = {
  TRANSPORT_MODE: 'transport_mode',
  TOGGLE: 'toggle',
  OVERLAY: 'overlay',
};

/** Overlay / planning layers that must not add route edges to the planetary graph */
export const OVERLAY_ONLY_LAYER_IDS = new Set([
  'world_planning_grid',
  'custom_destinations',
  'custom_destination_labels',
  'custom_connection_preview',
  'parsed_cities',
  'parsed_cities_labels',
  'robotaxi_master',
  'robotaxi_service_zones',
  'robotaxi_pickup_dropoff',
  'robotaxi_airport_downtown',
  'robotaxi_remote_last_mile',
  'e2m_layer',
  'planetary_skeleton',
  'global_connectivity_corridors',
  'intermodal_hub_halos',
]);

/** Layers that default OFF and are heavy / optional */
export const HEAVY_LAYER_IDS = new Set([
  'feeders',
  'local_feeders',
  'extended_rural',
  'extended_global_coverage',
  'future_high_pop',
  'remote_cargo_routes',
  'world_planning_grid',
  'mode_civilization_grid',
]);

export const DEBUG_LAYER_GROUP = LAYER_GROUPS.DEBUG_DEV;

export const NEW_MODE_CONTRACT_MESSAGE =
  'New mode detected without test contract. Add this mode to modeTestContracts.js before continuing.';
