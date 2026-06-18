/**
 * Declarative strategic feeder edges for corridor depth demos.
 * Does not read custom/parsed overlays; only links existing official graph nodes.
 */

import { ROUTE_TYPES } from '../transportation/registries/routeTypes.js';
import { TRANSPORTATION_MODES } from '../transportation/registries/modes.js';
import { GRAPH_MEMBERSHIP } from './graphMembership.js';
import { normalizeGraphEdge } from './normalizeGraphMember.js';
import { matchesDeclaredFeederSemantics } from './intermodalFeederSemantics.js';
import { haversineDistanceKm } from './geoDistance.js';
import { E2E_STRATEGIC_HUBS } from './strategicHubRegistry.js';

const MAX_E2E_FEEDER_KM = 900;
const MAX_RE2E_CONNECTOR_KM = 600;
const MAX_RE2E_SYNTHETIC = 8;

/** Pairs of world-city keys (strategic E2E seeds) → short-haul passenger feeders. */
const E2E_DEMONSTRATION_PAIRS = Object.freeze([
  ['london', 'paris'],
  ['new york', 'washington'],
  ['dubai', 'mumbai'],
]);

/**
 * @param {object} node
 * @returns {string}
 */
function nodeNameKey(node) {
  return String(node?.name ?? '').toLowerCase().trim();
}

/**
 * @param {object} node
 * @returns {string}
 */
function nodeIdKey(node) {
  return String(node?.id ?? '').toLowerCase();
}

/**
 * @param {object[]} nodes
 * @param {string} worldCityKey
 * @returns {object | null}
 */
export function findNodeForWorldCityKey(nodes, worldCityKey) {
  const key = String(worldCityKey ?? '').toLowerCase().trim();
  if (!key) return null;

  return (
    nodes.find((n) => {
      const name = nodeNameKey(n);
      const id = nodeIdKey(n);
      return (
        name === key ||
        name.includes(key) ||
        id.includes(key.replace(/\s+/g, '-')) ||
        id.includes(`city:${key}`)
      );
    }) ?? null
  );
}

/**
 * @param {object} a
 * @param {object} b
 * @returns {number | null}
 */
function distanceBetweenNodes(a, b) {
  const lat1 = a?.lat ?? a?.latitude;
  const lon1 = a?.lon ?? a?.longitude ?? a?.lng;
  const lat2 = b?.lat ?? b?.latitude;
  const lon2 = b?.lon ?? b?.longitude ?? b?.lng;
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;
  return haversineDistanceKm({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 });
}

/**
 * @param {object} params
 * @param {object[]} params.nodes
 * @param {object[]} params.existingEdges
 * @param {boolean} [params.enabled]
 * @returns {object[]}
 */
export function buildSyntheticStrategicFeeders({ nodes = [], existingEdges = [], enabled = false } = {}) {
  if (!enabled) return [];

  const existingIds = new Set((existingEdges ?? []).map((e) => e.id).filter(Boolean));
  const synthetic = [];

  for (const [fromKey, toKey] of E2E_DEMONSTRATION_PAIRS) {
    const fromNode = findNodeForWorldCityKey(nodes, fromKey);
    const toNode = findNodeForWorldCityKey(nodes, toKey);
    if (!fromNode?.id || !toNode?.id) continue;

    const distanceKm = distanceBetweenNodes(fromNode, toNode);
    if (distanceKm == null || distanceKm > MAX_E2E_FEEDER_KM) continue;

    const id = `synthetic-feeder:e2e:${fromNode.id}->${toNode.id}`;
    if (existingIds.has(id)) continue;

    const raw = {
      id,
      from: fromNode.id,
      to: toNode.id,
      origin_id: fromNode.id,
      destination_id: toNode.id,
      mode: TRANSPORTATION_MODES.E2E_FEEDER,
      routeType: ROUTE_TYPES.FEEDER_ROUTE,
      route_type: ROUTE_TYPES.FEEDER_ROUTE,
      corridor_type: 'passenger',
      corridorType: 'passenger',
      distanceKm,
      graphMembership: GRAPH_MEMBERSHIP.OFFICIAL,
      cityStatus: 'official',
      status: 'conceptual',
      synthetic: true,
      strategicFeeder: true,
    };

    const normalized = normalizeGraphEdge(raw);
    if (normalized && matchesDeclaredFeederSemantics(normalized)) {
      synthetic.push(normalized);
      existingIds.add(id);
    }
  }

  const mineralNodes = nodes.filter(
    (n) => n.mineral_hub_id || n.e2m_enabled || String(n.nodeType ?? '').includes('mineral')
  );
  const e2mHubs = nodes.filter(
    (n) =>
      n.e2m_enabled ||
      String(n.nodeType ?? '').includes('e2m') ||
      (n.hubRoles ?? []).some((r) => String(r).toUpperCase().includes('RE2E'))
  );

  let re2eCount = 0;
  for (const mineral of mineralNodes) {
    if (re2eCount >= MAX_RE2E_SYNTHETIC) break;
    let nearest = null;
    let nearestKm = Infinity;
    for (const hub of e2mHubs) {
      if (hub.id === mineral.id) continue;
      const km = distanceBetweenNodes(mineral, hub);
      if (km == null || km > MAX_RE2E_CONNECTOR_KM || km >= nearestKm) continue;
      nearest = hub;
      nearestKm = km;
    }
    if (!nearest) continue;

    const id = `synthetic-feeder:re2e:${mineral.id}->${nearest.id}`;
    if (existingIds.has(id)) continue;

    const raw = {
      id,
      from: mineral.id,
      to: nearest.id,
      origin_id: mineral.id,
      destination_id: nearest.id,
      mode: TRANSPORTATION_MODES.RE2E,
      routeType: ROUTE_TYPES.RESOURCE_CORRIDOR,
      route_type: ROUTE_TYPES.RESOURCE_CORRIDOR,
      corridor_type: 'resource',
      corridorType: 'resource',
      distanceKm: nearestKm,
      graphMembership: GRAPH_MEMBERSHIP.OFFICIAL,
      cityStatus: 'official',
      status: 'conceptual',
      synthetic: true,
      strategicFeeder: true,
    };

    const normalized = normalizeGraphEdge(raw);
    if (normalized && matchesDeclaredFeederSemantics(normalized)) {
      synthetic.push(normalized);
      existingIds.add(id);
      re2eCount += 1;
    }
  }

  const e2eHubCount = E2E_STRATEGIC_HUBS.filter((h) => findNodeForWorldCityKey(nodes, h.worldCityKey)).length;

  return synthetic;
}
