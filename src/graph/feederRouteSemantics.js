/**
 * First-class feeder route semantics — taxonomy, render family, and layer wiring.
 * Feeders are not ad-hoc hyperloop branches; they share one registry-driven contract.
 */

import { ROUTE_TYPES } from '../transportation/registries/routeTypes.js';
import { ROUTE_FAMILIES } from './classifyRouteFamily.js';

/** Canonical routeType values that classify as feeder branches. */
export const FEEDER_ROUTE_TYPES = Object.freeze([
  ROUTE_TYPES.FEEDER_ROUTE,
  'feeder',
  'feeder_route',
  'regional_feeder',
  'branch',
]);

/** Layer registry ids that control feeder visibility (official + E2E-local). */
export const FEEDER_LAYER_IDS = Object.freeze([
  'feeders',
  'local_feeders',
  'filter_feeder_routes',
  'e2e-feeder-routes',
]);

/** Deck render bucket key produced by createRenderBuckets. */
export const FEEDER_RENDER_BUCKET = 'feederPaths';

/**
 * @param {string | null | undefined} routeType
 * @returns {boolean}
 */
export function isFeederRouteType(routeType) {
  if (!routeType) return false;
  return FEEDER_ROUTE_TYPES.includes(routeType);
}

/**
 * @param {{ routeType?: string, route_type?: string, mode?: string }} edge
 * @returns {boolean}
 */
export function isFeederEdge(edge) {
  const routeType = edge?.routeType ?? edge?.route_type;
  return isFeederRouteType(routeType);
}

/**
 * @param {{ routeType?: string, route_type?: string }} edge
 * @returns {string}
 */
export function getFeederRenderFamily(edge) {
  return isFeederEdge(edge) ? ROUTE_FAMILIES.FEEDER_BRANCH : ROUTE_FAMILIES.REGIONAL_LOOP;
}

/**
 * Summary counts for diagnostics panels.
 * @param {object[]} edges
 */
export function summarizeFeederEdges(edges = []) {
  let feederBranch = 0;
  let regionalLoop = 0;
  let multimodalFeeder = 0;

  for (const edge of edges) {
    const routeType = edge?.routeType ?? edge?.route_type;
    if (isFeederRouteType(routeType)) feederBranch += 1;
    else if (routeType === ROUTE_TYPES.REGIONAL_LOOP) regionalLoop += 1;
    else if (
      routeType === ROUTE_TYPES.LOCAL_CONNECTOR ||
      routeType === ROUTE_TYPES.LAST_MILE ||
      routeType === 'short_logistics_feeder'
    ) {
      multimodalFeeder += 1;
    }
  }

  return {
    feederBranch,
    regionalLoop,
    multimodalFeeder,
    totalFeederLike: feederBranch + regionalLoop + multimodalFeeder,
  };
}
