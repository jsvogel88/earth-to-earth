/**
 * Integrated Grid filter state and graph visibility helpers.
 * Filters are read-only views — they never mutate source graph data.
 */

import { E2E_POPULATION_THRESHOLD } from '../modes/classifyLocation.js';
import { normalizeNodeId } from '../graph/integratedGraphTypes.js';
import { matchesRouteFamilies } from '../data/routeTypeFamilies.js';

export const INTEGRATED_FILTER_KEYS = {
  showIntegratedE2E: 'showIntegratedE2E',
  showIntegratedE2M: 'showIntegratedE2M',
  showIntegratedHyperloop: 'showIntegratedHyperloop',
  showIntegratedLoop: 'showIntegratedLoop',
  showIntegratedAuto: 'showIntegratedAuto',
  showIntegratedMineralHubs: 'showIntegratedMineralHubs',
  showPopulation1MPlusOnly: 'showPopulation1MPlusOnly',
  showE2EEligibleOnly: 'showE2EEligibleOnly',
  showE2MHubsOnly: 'showE2MHubsOnly',
  showMajorCorridorsOnly: 'showMajorCorridorsOnly',
  showFeederRoutesFilter: 'showFeederRoutesFilter',
  showParsedDestinationsOnly: 'showParsedDestinationsOnly',
  showSavedDestinationsOnly: 'showSavedDestinationsOnly',
  showCustomNodes: 'showCustomNodes',
};

/** Default integrated filter flags merged into Civilization / Integrated Grid preset */
export const INTEGRATED_FILTER_DEFAULTS = {
  [INTEGRATED_FILTER_KEYS.showIntegratedE2E]: true,
  [INTEGRATED_FILTER_KEYS.showIntegratedE2M]: true,
  [INTEGRATED_FILTER_KEYS.showIntegratedHyperloop]: true,
  [INTEGRATED_FILTER_KEYS.showIntegratedLoop]: true,
  [INTEGRATED_FILTER_KEYS.showIntegratedAuto]: true,
  [INTEGRATED_FILTER_KEYS.showIntegratedMineralHubs]: true,
  [INTEGRATED_FILTER_KEYS.showPopulation1MPlusOnly]: false,
  [INTEGRATED_FILTER_KEYS.showE2EEligibleOnly]: false,
  [INTEGRATED_FILTER_KEYS.showE2MHubsOnly]: false,
  [INTEGRATED_FILTER_KEYS.showMajorCorridorsOnly]: false,
  [INTEGRATED_FILTER_KEYS.showFeederRoutesFilter]: true,
  [INTEGRATED_FILTER_KEYS.showParsedDestinationsOnly]: false,
  [INTEGRATED_FILTER_KEYS.showSavedDestinationsOnly]: false,
  [INTEGRATED_FILTER_KEYS.showCustomNodes]: true,
};

export const INTEGRATED_VIEW_FOCUS = {
  INTEGRATED_GRID: 'integrated_grid',
  E2E: 'e2e',
  E2M: 'e2m',
  MINING_INDUSTRIAL: 'mining_industrial',
  HYPERLOOP: 'hyperloop',
  LOOP: 'loop',
  AUTO: 'auto',
};

export const INTEGRATED_VIEW_FOCUS_LABELS = {
  [INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID]: 'Integrated Grid',
  [INTEGRATED_VIEW_FOCUS.E2E]: 'E2E Global',
  [INTEGRATED_VIEW_FOCUS.E2M]: 'Mining / E2M',
  [INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL]: 'Mining / E2M',
  [INTEGRATED_VIEW_FOCUS.HYPERLOOP]: 'Hyperloop Spine',
  [INTEGRATED_VIEW_FOCUS.LOOP]: 'Local Loop',
  [INTEGRATED_VIEW_FOCUS.AUTO]: 'Auto Access',
};

/**
 * @param {object} layerState
 * @returns {object}
 */
export function mergeIntegratedFilterDefaults(layerState = {}) {
  return { ...INTEGRATED_FILTER_DEFAULTS, ...layerState };
}

/**
 * @param {object} node
 * @returns {number}
 */
function nodePopulation(node) {
  return node?.metro_population ?? node?.population ?? 0;
}

/**
 * @param {object} node
 * @param {object} filters
 * @returns {boolean}
 */
export function isNodeVisibleInIntegratedFilters(node, filters) {
  if (!node) return false;
  const f = mergeIntegratedFilterDefaults(filters);

  const isMineral = Boolean(node.mineral_hub_id || node.e2m_enabled);
  const pop = nodePopulation(node);
  const e2eEligible = node.e2e_eligible || node.isE2EHub;

  if (f.showE2MHubsOnly && !isMineral) return false;
  if (f.showPopulation1MPlusOnly && !isMineral && pop < E2E_POPULATION_THRESHOLD) return false;
  if (f.showE2EEligibleOnly && !isMineral && !e2eEligible) return false;

  if (isMineral) return f.showIntegratedE2M !== false && f.showIntegratedMineralHubs !== false;

  return true;
}

/**
 * @param {object} edge
 * @param {object} filters
 * @returns {boolean}
 */
export function isEdgeVisibleInIntegratedFilters(edge, filters) {
  if (!edge) return false;
  const f = mergeIntegratedFilterDefaults(filters);
  const mode = edge.mode ?? edge.edgeMode;

  if (mode === 'e2e' && f.showIntegratedE2E === false) return false;
  if (mode === 'e2m' && f.showIntegratedE2M === false) return false;
  if (mode === 'hyperloop' && f.showIntegratedHyperloop === false) return false;
  if (mode === 'loop' && f.showIntegratedLoop === false) return false;
  if (mode === 'auto' && f.showIntegratedAuto === false) return false;

  const rt = edge.route_type ?? edge.routeType;
  if (mode === 'hyperloop' && rt) {
    if (
      f.showIntegratedLoop === false &&
      matchesRouteFamilies(edge, ['REGIONAL_LOOP', 'FEEDER'])
    ) {
      return false;
    }
    if (f.showIntegratedHyperloop === false && matchesRouteFamilies(edge, 'SPINE')) {
      return false;
    }
  }
  if (mode === 'regional_loop' && f.showIntegratedLoop === false) return false;

  if (f.showMajorCorridorsOnly) {
    const rt = edge.route_type ?? edge.routeType;
    if (rt !== 'trunk' && rt !== 'global') return false;
  }

  if (f.showFeederRoutesFilter === false) {
    const rt = edge.route_type ?? edge.routeType;
    const ct = edge.corridor_type ?? edge.corridorType;
    if (
      rt === 'feeder' ||
      rt === 'resource' ||
      rt === 'industrial' ||
      ct === 'resource' ||
      ct === 'freight' ||
      ct === 'industrial'
    ) {
      return false;
    }
  }

  return true;
}

/**
 * @param {object[]} nodes
 * @param {object[]} edges
 * @param {object} filters
 */
/**
 * Non-destructive filter view over integrated graph nodes/edges.
 * Phase 4: consume visibleNodes / visibleEdges in deck route layers.
 *
 * @param {object[]} nodes
 * @param {object[]} edges
 * @param {object} filters
 * @returns {{ visibleNodes: object[], visibleEdges: object[], nodes: object[], edges: object[] }}
 */
export function filterIntegratedGraph(nodes, edges, filters) {
  const visibleNodes = (nodes ?? []).filter((n) => isNodeVisibleInIntegratedFilters(n, filters));
  const visibleNodeIds = new Set(visibleNodes.map((n) => normalizeNodeId(n)).filter(Boolean));
  const visibleEdges = (edges ?? []).filter((e) => {
    if (!isEdgeVisibleInIntegratedFilters(e, filters)) return false;
    const a = e.origin_id ?? e.from;
    const b = e.destination_id ?? e.to;
    if (visibleNodeIds.size === 0) return true;
    return visibleNodeIds.has(a) || visibleNodeIds.has(b);
  });
  return { visibleNodes, visibleEdges, nodes: visibleNodes, edges: visibleEdges };
}

/**
 * Apply a view-focus preset onto layer flags (non-destructive merge).
 * @param {string} focus
 * @returns {Record<string, boolean>}
 */
export function getViewFocusLayerPatch(focus) {
  const allOn = {
    ...INTEGRATED_FILTER_DEFAULTS,
    showHyperloopInfrastructure: true,
    showPlanetarySkeleton: true,
    integratedViewFocus: focus,
  };
  switch (focus) {
    case INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID:
      return {
        ...allOn,
        showIntegratedE2E: true,
        showIntegratedHyperloop: true,
        showIntegratedE2M: true,
        showIntegratedLoop: true,
        showIntegratedMineralHubs: true,
        showE2MHubsOnly: false,
      };
    case INTEGRATED_VIEW_FOCUS.E2E:
      return {
        ...allOn,
        showIntegratedE2E: true,
        showIntegratedHyperloop: true,
        showIntegratedLoop: true,
        showIntegratedE2M: false,
        showIntegratedMineralHubs: false,
        showE2MHubsOnly: false,
      };
    case INTEGRATED_VIEW_FOCUS.E2M:
    case INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL:
      return {
        ...allOn,
        showIntegratedE2E: true,
        showIntegratedE2M: true,
        showIntegratedHyperloop: true,
        showIntegratedLoop: true,
        showIntegratedMineralHubs: true,
        showE2MHubsOnly: true,
        showFeederRoutesFilter: true,
      };
    case INTEGRATED_VIEW_FOCUS.HYPERLOOP:
      return {
        ...allOn,
        showIntegratedE2E: false,
        showIntegratedE2M: true,
        showIntegratedHyperloop: true,
        showIntegratedLoop: true,
        showIntegratedMineralHubs: true,
        showIntegratedAuto: false,
        showE2MHubsOnly: false,
      };
    case INTEGRATED_VIEW_FOCUS.LOOP:
      return {
        ...allOn,
        showIntegratedE2E: false,
        showIntegratedE2M: false,
        showIntegratedHyperloop: true,
        showIntegratedLoop: true,
        showIntegratedMineralHubs: false,
        showIntegratedAuto: true,
      };
    case INTEGRATED_VIEW_FOCUS.AUTO:
      return {
        ...allOn,
        showIntegratedE2E: false,
        showIntegratedE2M: false,
        showIntegratedHyperloop: true,
        showIntegratedLoop: true,
        showIntegratedAuto: true,
        showIntegratedMineralHubs: false,
        showRobotaxiLayer: true,
      };
    default:
      return allOn;
  }
}

/** Integrated Grid preset layer flags (extends Civilization Grid). */
export const INTEGRATED_GRID_PRESET = {
  ...INTEGRATED_FILTER_DEFAULTS,
  integratedViewFocus: INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID,
  showWorldCitiesPlanningGrid: true,
  showHyperloopInfrastructure: true,
  showThroughRoutes: true,
  showPlanetaryTrunks: true,
  showRegionalTrunks: true,
  showGateways: true,
  showFeeders: true,
  showRemoteCorridorSpines: true,
  showFutureHighPopulationHubs: true,
  showExtendedGlobalCoverageNodes: true,
  showExtendedRuralLayer: true,
  showRemoteCargoRoutes: true,
  showE2MLayer: true,
  showRobotaxiLayer: true,
  showRobotaxiServiceZones: true,
  showRobotaxiRemoteLastMile: true,
  showPlanetarySkeleton: true,
  showGlobalConnectivityCorridors: true,
  showIntermodalHubHalos: true,
  showIntegratedMineralHubs: true,
};
