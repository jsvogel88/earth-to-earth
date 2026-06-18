/**
 * Mode alias resolution — keep legacy `e2m` in data while exposing RE2E + space modes in taxonomy.
 */

import { TRANSPORTATION_MODES } from './registries/modes.js';
import { ROUTE_TYPES } from './registries/routeTypes.js';

const ORBITAL_ROUTE_TYPES = new Set([
  ROUTE_TYPES.GLOBAL_ARC,
  ROUTE_TYPES.ORBITAL_LOGISTICS,
  ROUTE_TYPES.LUNAR_LOGISTICS,
  ROUTE_TYPES.MARS_TRANSFER,
  'orbital_logistics',
  'cargo_spine',
]);

const RE2E_EARTH_ROUTE_TYPES = new Set([
  ROUTE_TYPES.RESOURCE_CORRIDOR,
  ROUTE_TYPES.CARGO_CORRIDOR,
  ROUTE_TYPES.LOGISTICS_CORRIDOR,
  ROUTE_TYPES.PORT_CONNECTOR,
  ROUTE_TYPES.RAIL_CONNECTOR,
  ROUTE_TYPES.ROAD_CONNECTOR,
  ROUTE_TYPES.ENERGY_CORRIDOR,
]);

/**
 * Resolve graph/storage mode to canonical taxonomy mode.
 * @param {string} mode
 * @param {{ routeType?: string, route_type?: string, planet?: string }} [context]
 */
export function resolveCanonicalMode(mode, context = {}) {
  const m = String(mode ?? '').toLowerCase();
  const routeType = context.routeType ?? context.route_type ?? '';

  if (m === 're2e') return TRANSPORTATION_MODES.RE2E;
  if (m === 'e2o') return TRANSPORTATION_MODES.E2O;
  if (m === 'e2f') return TRANSPORTATION_MODES.E2F;
  if (m === 'e2l') return TRANSPORTATION_MODES.E2L;
  if (m === 'e2a') return TRANSPORTATION_MODES.E2A;
  if (m === 'e2mars') return TRANSPORTATION_MODES.E2MARS;
  if (m === 'petabond') return TRANSPORTATION_MODES.PETABOND;

  if (m === 'e2m' || m === 'cargo' || m === 'logistics') {
    if (ORBITAL_ROUTE_TYPES.has(routeType) && context.planet !== 'EARTH') {
      return TRANSPORTATION_MODES.E2MARS;
    }
    if (RE2E_EARTH_ROUTE_TYPES.has(routeType) || !routeType) {
      return TRANSPORTATION_MODES.RE2E;
    }
    return TRANSPORTATION_MODES.E2M;
  }

  return m;
}

/**
 * @param {string} mode
 * @param {object} [context]
 */
export function isRe2eEarthMode(mode, context = {}) {
  return resolveCanonicalMode(mode, context) === TRANSPORTATION_MODES.RE2E;
}

/**
 * Internal graph mode preserved for adapters (never write re2e into legacy generators).
 * @param {string} canonicalOrLegacy
 */
export function toLegacyGraphMode(canonicalOrLegacy) {
  const m = String(canonicalOrLegacy ?? '').toLowerCase();
  if (m === 're2e') return TRANSPORTATION_MODES.E2M;
  return m;
}
