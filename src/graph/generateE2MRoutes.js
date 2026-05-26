/**
 * E2M feeder / resource / industrial route generator.
 */

import {
  createIntegratedEdge,
  EDGE_MODES,
  EDGE_TYPES,
  CORRIDOR_TYPES,
  normalizeNodeId,
} from './integratedGraphTypes.js';
import { hasCoordinates, haversineDistanceKm, findNearest } from './geoDistance.js';
import { enrichMineralHub } from '../data/buildMineralHubConnections.js';

/**
 * @param {string} mineralType
 * @returns {number}
 */
function mineralTypeBoost(mineralType) {
  const boosts = {
    'Rare Earth Elements': 0.15,
    Lithium: 0.12,
    'Copper / Cobalt': 0.1,
    'Nickel / Battery Metals': 0.1,
    'Graphite / Industrial Minerals': 0.08,
    Uranium: 0.1,
    'Critical Battery Minerals': 0.12,
    'Strategic Industrial Minerals': 0.08,
  };
  return boosts[mineralType] ?? 0.05;
}

/**
 * @param {object} hub
 * @returns {number}
 */
function e2mPriorityScore(hub) {
  const base = hub.strategic_score ?? 0.5;
  const remote = (hub.remote_score ?? 0) * 0.1;
  const mineral = mineralTypeBoost(hub.mineral_type);
  return Math.min(base + remote + mineral, 1);
}

/**
 * @param {object[]} allNodes
 * @returns {Map<string, object>}
 */
function buildNodeIndex(allNodes) {
  const index = new Map();
  for (const node of allNodes ?? []) {
    const id = normalizeNodeId(node);
    if (id) index.set(id, node);
    if (node.name) index.set(node.name.toLowerCase(), node);
    if (node.networkCityId) index.set(node.networkCityId, node);
    if (node.city_id) index.set(node.city_id, node);
  }
  return index;
}

/**
 * @param {string | object | null | undefined} ref
 * @param {Map<string, object>} index
 * @returns {object | null}
 */
function resolveNodeRef(ref, index) {
  if (!ref) return null;
  if (typeof ref === 'object') return hasCoordinates(ref) ? ref : null;
  if (index.has(ref)) return index.get(ref);
  const lower = String(ref).toLowerCase();
  if (index.has(lower)) return index.get(lower);
  return null;
}

/**
 * @param {object} hub
 * @param {object} target
 * @param {string} route_type
 * @param {string} corridor_type
 * @returns {object | null}
 */
function makeE2MEdge(hub, target, route_type, corridor_type) {
  if (!hub || !target || !hasCoordinates(hub) || !hasCoordinates(target)) return null;

  const hubId = normalizeNodeId(hub);
  const targetId = normalizeNodeId(target);
  if (!hubId || !targetId || hubId === targetId) return null;

  const distance_km = haversineDistanceKm(hub, target);

  return createIntegratedEdge({
    origin: hub,
    destination: target,
    mode: EDGE_MODES.E2M,
    route_type,
    corridor_type,
    priority_score: e2mPriorityScore(hub),
    distance_km: distance_km != null ? Math.round(distance_km) : null,
    visibility_by_zoom: { min: 2, max: 22 },
    metadata: {
      generatedBy: 'generateE2MRoutes',
      mineral_type: hub.mineral_type,
    },
  });
}

/**
 * @param {object[]} mineralHubs
 * @param {object} [context]
 * @param {object} [options]
 * @returns {object[]}
 */
export function generateE2MRoutes(mineralHubs, context = {}, options = {}) {
  const {
    cities = [],
    e2eHubs = [],
    ports = null,
    allNodes = [],
  } = context;

  const portCandidates =
    ports ??
    cities.filter(
      (c) => (c.port_score ?? 0) > 0.4 || c.isPort === true || /\bport\b/i.test(c.name ?? '')
    );

  const e2eCandidates = e2eHubs.length
    ? e2eHubs
    : cities.filter((c) => c.isE2EHub || c.e2e_eligible);

  const nodeIndex = buildNodeIndex([...allNodes, ...cities, ...e2eCandidates, ...portCandidates]);

  const edges = [];
  const edgeTargets = new Set();

  for (const rawHub of mineralHubs ?? []) {
    if (!rawHub?.e2m_enabled && !rawHub?.mineral_hub_id && !rawHub?.mineral_type) continue;
    if (!hasCoordinates(rawHub)) continue;

    const hub = enrichMineralHub(rawHub, {
      cities,
      e2eHubs: e2eCandidates,
      ports: portCandidates.length ? portCandidates : cities,
    });

    let supportCity =
      resolveNodeRef(hub.nearest_support_city, nodeIndex) ??
      findNearest(hub, cities)?.node ??
      null;

    let portNode =
      resolveNodeRef(hub.nearest_port, nodeIndex) ??
      findNearest(hub, portCandidates.length ? portCandidates : cities)?.node ??
      null;

    let e2eNode =
      resolveNodeRef(hub.nearest_e2e_hub, nodeIndex) ??
      findNearest(hub, e2eCandidates)?.node ??
      null;

    const targets = [
      {
        node: supportCity,
        route_type: EDGE_TYPES.FEEDER,
        corridor_type: CORRIDOR_TYPES.RESOURCE,
        key: 'support',
      },
      {
        node: portNode,
        route_type: EDGE_TYPES.INDUSTRIAL,
        corridor_type: CORRIDOR_TYPES.FREIGHT,
        key: 'port',
      },
      {
        node: e2eNode,
        route_type: EDGE_TYPES.RESOURCE,
        corridor_type: CORRIDOR_TYPES.STRATEGIC,
        key: 'e2e',
      },
    ];

    const seenDestIds = new Set();

    for (const { node, route_type, corridor_type } of targets) {
      if (!node) continue;
      const destId = normalizeNodeId(node);
      if (!destId || seenDestIds.has(destId)) continue;
      seenDestIds.add(destId);

      const edge = makeE2MEdge(hub, node, route_type, corridor_type);
      if (edge) {
        edges.push(edge);
        edgeTargets.add(`${normalizeNodeId(hub)}:${destId}`);
      }
    }
  }

  return edges;
}
