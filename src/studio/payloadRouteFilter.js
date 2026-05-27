/**
 * Optional payload focus — filters visible integrated-grid edges by route family.
 */

import { ROUTE_FAMILIES } from '../graph/classifyRouteFamily.js';

/** @type {Record<string, string[]>} */
const PAYLOAD_ROUTE_FAMILIES = {
  passengers: [ROUTE_FAMILIES.E2E_GLOBAL_ARC, ROUTE_FAMILIES.REGIONAL_LOOP],
  settlers: [ROUTE_FAMILIES.E2E_GLOBAL_ARC, ROUTE_FAMILIES.E2M_CARGO],
  general_freight: [
    ROUTE_FAMILIES.E2M_CARGO,
    ROUTE_FAMILIES.CONTINENTAL_SPINE,
    ROUTE_FAMILIES.FEEDER_BRANCH,
  ],
  habitat_modules: [ROUTE_FAMILIES.E2M_CARGO, ROUTE_FAMILIES.CONTINENTAL_SPINE],
  mining_equipment: [ROUTE_FAMILIES.E2M_CARGO, ROUTE_FAMILIES.FEEDER_BRANCH],
  rare_earths: [ROUTE_FAMILIES.E2M_CARGO],
  factory_modules: [
    ROUTE_FAMILIES.E2M_CARGO,
    ROUTE_FAMILIES.CONTINENTAL_SPINE,
    ROUTE_FAMILIES.REGIONAL_LOOP,
  ],
  petabond_package: [ROUTE_FAMILIES.E2M_CARGO, ROUTE_FAMILIES.E2E_GLOBAL_ARC],
  emergency_supplies: [ROUTE_FAMILIES.E2M_CARGO, ROUTE_FAMILIES.FEEDER_BRANCH],
};

/**
 * @param {object[]} edges
 * @param {string | null | undefined} payloadId
 * @param {(edge: object) => string} classifyRouteFamilyFn
 */
export function filterEdgesByPayloadFocus(edges, payloadId, classifyRouteFamilyFn) {
  if (!payloadId) return edges;
  const allowed = PAYLOAD_ROUTE_FAMILIES[payloadId];
  if (!allowed?.length) return edges;
  const allowedSet = new Set(allowed);
  return edges.filter((edge) => allowedSet.has(classifyRouteFamilyFn(edge)));
}

export function getPayloadFilterFamilies(payloadId) {
  return PAYLOAD_ROUTE_FAMILIES[payloadId] ?? null;
}
