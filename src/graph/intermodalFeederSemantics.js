/**
 * Intermodal feeder semantics — how secondary nodes connect into E2E / RE2E hubs.
 * Metadata for future graph builders; does not auto-create edges from overlays.
 */

import { TRANSPORTATION_MODES } from '../transportation/registries/modes.js';
import { ROUTE_TYPES } from '../transportation/registries/routeTypes.js';
import { NODE_TYPES } from '../transportation/registries/nodeTypes.js';

/** E2E: people flow into launch hubs (spec §6). */
export const E2E_FEEDER_CONNECTIONS = Object.freeze([
  { fromNodeType: NODE_TYPES.FEEDER_CITY, toNodeType: NODE_TYPES.E2E_HUB, mode: TRANSPORTATION_MODES.E2E_FEEDER, routeType: ROUTE_TYPES.FEEDER_ROUTE },
  { fromNodeType: NODE_TYPES.REGIONAL_GATEWAY, toNodeType: NODE_TYPES.E2E_HUB, mode: TRANSPORTATION_MODES.E2E_FEEDER, routeType: ROUTE_TYPES.FEEDER_ROUTE },
  { fromNodeType: NODE_TYPES.HYPERLOOP_STATION, toNodeType: NODE_TYPES.E2E_HUB, mode: TRANSPORTATION_MODES.E2E_FEEDER, routeType: ROUTE_TYPES.FEEDER_ROUTE },
  { fromNodeType: NODE_TYPES.AIRPORT_NODE, toNodeType: NODE_TYPES.E2E_HUB, mode: TRANSPORTATION_MODES.AIR, routeType: ROUTE_TYPES.AIRPORT_CONNECTOR },
  { fromNodeType: NODE_TYPES.RAIL_TERMINAL, toNodeType: NODE_TYPES.E2E_HUB, mode: TRANSPORTATION_MODES.RAIL, routeType: ROUTE_TYPES.RAIL_CONNECTOR },
]);

/** RE2E: resources/cargo into industrial hubs (spec §6). */
export const RE2E_FEEDER_CONNECTIONS = Object.freeze([
  { fromNodeType: NODE_TYPES.MINERAL_NODE, toNodeType: NODE_TYPES.INDUSTRIAL_NODE, mode: TRANSPORTATION_MODES.RE2E, routeType: ROUTE_TYPES.RESOURCE_CORRIDOR },
  { fromNodeType: NODE_TYPES.RESOURCE_NODE, toNodeType: NODE_TYPES.RAIL_TERMINAL, mode: TRANSPORTATION_MODES.RE2E, routeType: ROUTE_TYPES.RAIL_CONNECTOR },
  { fromNodeType: NODE_TYPES.RAIL_TERMINAL, toNodeType: NODE_TYPES.PORT_NODE, mode: TRANSPORTATION_MODES.RAIL, routeType: ROUTE_TYPES.RAIL_CONNECTOR },
  { fromNodeType: NODE_TYPES.PORT_NODE, toNodeType: NODE_TYPES.E2M_HUB, mode: TRANSPORTATION_MODES.RE2E, routeType: ROUTE_TYPES.PORT_CONNECTOR },
  { fromNodeType: NODE_TYPES.INDUSTRIAL_NODE, toNodeType: NODE_TYPES.E2M_HUB, mode: TRANSPORTATION_MODES.RE2E, routeType: ROUTE_TYPES.CARGO_CORRIDOR },
  { fromNodeType: NODE_TYPES.ENERGY_NODE, toNodeType: NODE_TYPES.E2M_HUB, mode: TRANSPORTATION_MODES.ENERGY, routeType: ROUTE_TYPES.ENERGY_CORRIDOR },
]);

/**
 * @param {'e2e'|'re2e'} family
 */
export function getFeederConnectionRules(family) {
  return family === 'e2e' ? E2E_FEEDER_CONNECTIONS : RE2E_FEEDER_CONNECTIONS;
}

/**
 * Whether an edge pattern matches declared feeder semantics (for validation/tests).
 * @param {object} edge
 */
export function matchesDeclaredFeederSemantics(edge) {
  const routeType = edge?.routeType ?? edge?.route_type;
  const mode = edge?.mode;
  if (routeType === ROUTE_TYPES.FEEDER_ROUTE) return true;
  if (mode === TRANSPORTATION_MODES.E2E_FEEDER) return true;
  const connectorTypes = new Set([
    ROUTE_TYPES.PORT_CONNECTOR,
    ROUTE_TYPES.RAIL_CONNECTOR,
    ROUTE_TYPES.AIRPORT_CONNECTOR,
    ROUTE_TYPES.RESOURCE_CORRIDOR,
    ROUTE_TYPES.CARGO_CORRIDOR,
    ROUTE_TYPES.LOGISTICS_CORRIDOR,
  ]);
  return connectorTypes.has(routeType);
}
