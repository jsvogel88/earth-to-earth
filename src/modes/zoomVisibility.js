/**
 * Zoom-tier visibility for integrated graph rendering (non-destructive).
 */

import { normalizeNodeId } from '../graph/integratedGraphTypes.js';
import { mergeIntegratedFilterDefaults } from '../ui/integratedGridFilters.js';

export const ZOOM_TIERS = {
  GLOBAL: 'global',
  REGIONAL: 'regional',
  CITY: 'city',
  LOCAL: 'local',
};

const MAX_GLOBAL_E2E_EDGES = 48;
const MAX_REGIONAL_LOOP_EDGES = 200;
const MAX_GLOBAL_E2M_EDGES = 80;
const MAX_GLOBAL_HYPERLOOP_EDGES = 400;

const TRUNK_ROUTE_TYPES = new Set(['trunk', 'global']);
const TRUNK_EDGE_CATEGORIES = new Set([
  'CONTINENTAL_SPINE',
  'PLANETARY_TRUNK',
  'REGIONAL_TRUNK',
  'PLANETARY_GATEWAY',
  'INTERCONTINENTAL_GATEWAY',
  'THROUGH_ROUTE',
]);

/**
 * @param {number} zoom
 * @returns {string}
 */
export function getZoomTier(zoom) {
  if (zoom < 3) return ZOOM_TIERS.GLOBAL;
  if (zoom < 7) return ZOOM_TIERS.REGIONAL;
  if (zoom < 11) return ZOOM_TIERS.CITY;
  return ZOOM_TIERS.LOCAL;
}

/**
 * @param {object} edge
 * @returns {number}
 */
function edgePriority(edge) {
  return edge?.priority_score ?? edge?.economic_score ?? 0;
}

/**
 * @param {object} edge
 * @param {string} tier
 * @param {object} filters
 * @returns {boolean}
 */
export function isEdgeVisibleAtZoomTier(edge, tier, filters = {}) {
  const mode = edge?.mode ?? edge?.edgeMode;
  const routeType = edge?.route_type ?? edge?.routeType ?? '';
  const f = mergeIntegratedFilterDefaults(filters);

  if (mode === 'auto') return false;

  if (mode === 'hyperloop') {
    if (f.showIntegratedHyperloop === false) return false;
    if (tier === ZOOM_TIERS.GLOBAL) {
      const cat = edge.edgeCategory ?? edge.metadata?.edgeCategory ?? '';
      return (
        TRUNK_ROUTE_TYPES.has(routeType) ||
        TRUNK_EDGE_CATEGORIES.has(cat) ||
        edge.infrastructureTier === 1 ||
        edge.priority_score >= 0.5
      );
    }
    return true;
  }

  if (mode === 'e2e' && f.showIntegratedE2E === false) return false;
  if (mode === 'e2m' && f.showIntegratedE2M === false) return false;
  if (mode === 'loop' && f.showIntegratedLoop === false) return false;

  if (tier === ZOOM_TIERS.GLOBAL) {
    if (mode === 'loop') return false;
    if (mode === 'e2e') {
      return routeType === 'global' || edgePriority(edge) >= 0.45;
    }
    if (mode === 'e2m') {
      return (
        routeType === 'resource' ||
        routeType === 'industrial' ||
        edgePriority(edge) >= 0.7
      );
    }
    return true;
  }

  if (tier === ZOOM_TIERS.REGIONAL) {
    if (mode === 'loop') return routeType === 'regional';
    return true;
  }

  if (tier === ZOOM_TIERS.CITY) {
    if (mode === 'loop') return true;
    return true;
  }

  return true;
}

/**
 * @param {object[]} edges
 * @param {number} zoom
 * @param {object} [activeFilters]
 * @returns {object[]}
 */
export function filterEdgesByZoom(edges, zoom, activeFilters = {}) {
  const tier = getZoomTier(zoom);
  const filtered = (edges ?? []).filter(
    (e) => isEdgeVisibleAtZoomTier(e, tier, activeFilters)
  );

  const e2e = filtered.filter((e) => e.mode === 'e2e');
  const e2m = filtered.filter((e) => e.mode === 'e2m');
  const loop = filtered.filter((e) => e.mode === 'loop');
  const hyperloop = filtered.filter((e) => e.mode === 'hyperloop');
  const other = filtered.filter((e) => !['e2e', 'e2m', 'loop', 'hyperloop'].includes(e.mode));

  const sortDesc = (a, b) => edgePriority(b) - edgePriority(a);
  const cap = (arr, max) => (arr.length <= max ? arr : arr.sort(sortDesc).slice(0, max));

  let result = other;
  if (tier === ZOOM_TIERS.GLOBAL) {
    result = [
      ...result,
      ...cap(hyperloop, MAX_GLOBAL_HYPERLOOP_EDGES),
      ...cap(e2e, MAX_GLOBAL_E2E_EDGES),
      ...cap(e2m, MAX_GLOBAL_E2M_EDGES),
    ];
  } else if (tier === ZOOM_TIERS.REGIONAL) {
    result = [...result, ...hyperloop, ...e2e, ...e2m, ...cap(loop, MAX_REGIONAL_LOOP_EDGES)];
  } else {
    result = [...result, ...hyperloop, ...e2e, ...e2m, ...loop];
  }

  return result;
}

/**
 * @param {object} node
 * @param {string} tier
 * @param {object} filters
 * @returns {boolean}
 */
export function isNodeVisibleAtZoomTier(node, tier, filters = {}) {
  const f = mergeIntegratedFilterDefaults(filters);
  const isMineral = Boolean(node?.mineral_hub_id || node?.e2m_enabled);
  const pop = node?.metro_population ?? node?.population ?? 0;
  const e2eEligible = node?.e2e_eligible || node?.isE2EHub;

  if (tier === ZOOM_TIERS.GLOBAL) {
    if (isMineral) {
      return (node?.strategic_score ?? 0) >= 0.82 && f.showIntegratedMineralHubs !== false;
    }
    if (e2eEligible) return f.showIntegratedE2E !== false;
    return false;
  }

  if (tier === ZOOM_TIERS.REGIONAL) {
    if (isMineral) return f.showIntegratedE2M !== false && f.showIntegratedMineralHubs !== false;
    if (f.showPopulation1MPlusOnly && pop < 1_000_000) return false;
    return true;
  }

  if (tier === ZOOM_TIERS.CITY) {
    if (f.showE2MHubsOnly && !isMineral) return false;
    return true;
  }

  return true;
}

/**
 * @param {object[]} nodes
 * @param {object[]} visibleEdges
 * @param {number} zoom
 * @param {object} [activeFilters]
 * @returns {object[]}
 */
export function filterNodesByZoom(nodes, visibleEdges, zoom, activeFilters = {}) {
  const tier = getZoomTier(zoom);
  const endpointIds = new Set();
  for (const e of visibleEdges ?? []) {
    if (e.origin_id) endpointIds.add(e.origin_id);
    if (e.destination_id) endpointIds.add(e.destination_id);
    if (e.from) endpointIds.add(e.from);
    if (e.to) endpointIds.add(e.to);
  }

  const nodeById = new Map();
  for (const n of nodes ?? []) {
    const id = normalizeNodeId(n);
    if (id) nodeById.set(id, n);
  }

  const selected = new Map();
  for (const n of nodes ?? []) {
    if (!isNodeVisibleAtZoomTier(n, tier, activeFilters)) continue;
    const id = normalizeNodeId(n);
    if (id) selected.set(id, n);
  }

  for (const id of endpointIds) {
    const n = nodeById.get(id);
    if (n) selected.set(id, n);
  }

  return [...selected.values()];
}
