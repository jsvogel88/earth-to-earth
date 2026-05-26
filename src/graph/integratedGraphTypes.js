/**
 * Lightweight schemas and helpers for the integrated transport graph.
 */

export const NODE_TYPES = {
  CITY: 'city',
  E2E_HUB: 'e2e_hub',
  E2M_HUB: 'e2m_hub',
  HYPERLOOP_HUB: 'hyperloop_hub',
  LOOP_NODE: 'loop_node',
  AUTO_NODE: 'auto_node',
  TRANSFER_HUB: 'transfer_hub',
  PORT: 'port',
  INDUSTRIAL_HUB: 'industrial_hub',
};

export const EDGE_MODES = {
  E2E: 'e2e',
  E2M: 'e2m',
  HYPERLOOP: 'hyperloop',
  LOOP: 'loop',
  AUTO: 'auto',
};

export const EDGE_TYPES = {
  GLOBAL: 'global',
  TRUNK: 'trunk',
  REGIONAL: 'regional',
  FEEDER: 'feeder',
  RESOURCE: 'resource',
  INDUSTRIAL: 'industrial',
  URBAN: 'urban',
  LOCAL: 'local',
  LAST_MILE: 'last_mile',
  REPAIR: 'repair',
};

export const CORRIDOR_TYPES = {
  PASSENGER: 'passenger',
  FREIGHT: 'freight',
  INDUSTRIAL: 'industrial',
  RESOURCE: 'resource',
  MIXED: 'mixed',
  STRATEGIC: 'strategic',
  LOCAL_ACCESS: 'local_access',
};

/**
 * @param {object} node
 * @returns {string | null}
 */
export function normalizeNodeId(node) {
  if (!node) return null;
  if (typeof node === 'string') return node;
  return (
    node.mineral_hub_id ??
    node.networkCityId ??
    node.city_id ??
    node.id ??
    null
  );
}

/**
 * Deterministic undirected edge key.
 * @param {string} originId
 * @param {string} destinationId
 * @param {string} mode
 * @param {string} [routeType]
 */
export function edgeKey(originId, destinationId, mode, routeType = '') {
  const ids = [String(originId), String(destinationId)].sort();
  return `${ids[0]}__${ids[1]}__${mode}__${routeType}`;
}

/**
 * @param {object} params
 * @returns {object}
 */
export function createIntegratedEdge({
  origin,
  destination,
  mode,
  route_type,
  corridor_type,
  priority_score = null,
  economic_score = null,
  distance_km = null,
  visibility_by_zoom = null,
  metadata = {},
}) {
  const origin_id = typeof origin === 'string' ? origin : normalizeNodeId(origin);
  const destination_id =
    typeof destination === 'string' ? destination : normalizeNodeId(destination);

  if (!origin_id || !destination_id || origin_id === destination_id) return null;

  const routeType = route_type ?? EDGE_TYPES.REGIONAL;
  const corridorType = corridor_type ?? CORRIDOR_TYPES.MIXED;

  return {
    id: edgeKey(origin_id, destination_id, mode, routeType),
    origin_id,
    destination_id,
    from: origin_id,
    to: destination_id,
    mode,
    route_type: routeType,
    corridor_type: corridorType,
    priority_score,
    economic_score,
    distance_km,
    visibility_by_zoom,
    ...metadata,
  };
}
