/**
 * Build feeder edges from declared intermodal semantics (E2E / RE2E rules).
 * Only links existing official nodes; never promotes custom/parsed overlays.
 */

import { ROUTE_TYPES } from '../transportation/registries/routeTypes.js';
import { TRANSPORTATION_MODES } from '../transportation/registries/modes.js';
import { NODE_TYPES } from '../transportation/registries/nodeTypes.js';
import { GRAPH_MEMBERSHIP } from './graphMembership.js';
import { normalizeGraphEdge } from './normalizeGraphMember.js';
import {
  E2E_FEEDER_CONNECTIONS,
  RE2E_FEEDER_CONNECTIONS,
} from './intermodalFeederSemantics.js';
import { haversineDistanceKm } from './geoDistance.js';

const MAX_E2E_FEEDER_KM = 800;
const MAX_RE2E_CONNECTOR_KM = 500;
const MAX_EDGES_PER_RULE = 4;
const MAX_TOTAL_EDGES = 32;

/**
 * @param {object} node
 * @returns {string[]}
 */
function nodeTypeList(node) {
  if (node?.nodeTypes?.length) return node.nodeTypes;
  if (node?.nodeType) return [node.nodeType];
  if (node?.taxonomyNodeType) return [node.taxonomyNodeType];
  if (node?.node_type) return [node.node_type];
  return [];
}

/**
 * @param {object} node
 * @param {string} nodeType
 */
export function nodeMatchesType(node, nodeType) {
  const types = nodeTypeList(node);
  return types.includes(nodeType);
}

/**
 * @param {object} node
 */
function isOfficialBackboneNode(node) {
  const membership = node?.graphMembership ?? GRAPH_MEMBERSHIP.OFFICIAL;
  if (membership !== GRAPH_MEMBERSHIP.OFFICIAL) return false;
  const status = node?.cityStatus ?? node?.city_status;
  if (status === 'custom_destination' || status === 'parsed_city') return false;
  return true;
}

/**
 * @param {object} a
 * @param {object} b
 */
function distanceKm(a, b) {
  const lat1 = a?.lat ?? a?.latitude;
  const lon1 = a?.lon ?? a?.longitude ?? a?.lng;
  const lat2 = b?.lat ?? b?.latitude;
  const lon2 = b?.lon ?? b?.longitude ?? b?.lng;
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;
  return haversineDistanceKm({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 });
}

/**
 * @param {object} rule
 * @param {object} fromNode
 * @param {object} toNode
 * @param {number} km
 */
function edgeFromRule(rule, fromNode, toNode, km) {
  const id = `intermodal-feeder:${rule.mode}:${fromNode.id}->${toNode.id}`;
  return normalizeGraphEdge({
    id,
    from: fromNode.id,
    to: toNode.id,
    origin_id: fromNode.id,
    destination_id: toNode.id,
    mode: rule.mode,
    routeType: rule.routeType,
    route_type: rule.routeType,
    distanceKm: km,
    graphMembership: GRAPH_MEMBERSHIP.OFFICIAL,
    cityStatus: 'official',
    status: 'conceptual',
    synthetic: true,
    intermodalFeeder: true,
  });
}

/**
 * @param {object} params
 * @param {object[]} params.nodes
 * @param {object[]} params.existingEdges
 * @param {boolean} [params.enabled]
 * @returns {object[]}
 */
export function buildIntermodalFeederEdges({
  nodes = [],
  existingEdges = [],
  enabled = false,
} = {}) {
  if (!enabled) return [];

  const officialNodes = (nodes ?? []).filter(isOfficialBackboneNode);
  const existingIds = new Set((existingEdges ?? []).map((e) => e.id).filter(Boolean));
  const pairKeys = new Set();
  const out = [];

  const tryAdd = (rule, fromNode, toNode, maxKm) => {
    if (out.length >= MAX_TOTAL_EDGES) return;
    const km = distanceKm(fromNode, toNode);
    if (km == null || km > maxKm) return;
    const pairKey = `${fromNode.id}|${toNode.id}|${rule.routeType}`;
    if (pairKeys.has(pairKey)) return;
    const edge = edgeFromRule(rule, fromNode, toNode, km);
    if (!edge?.id || existingIds.has(edge.id)) return;
    pairKeys.add(pairKey);
    existingIds.add(edge.id);
    out.push(edge);
  };

  const processRules = (rules, maxKm) => {
    for (const rule of rules) {
      let added = 0;
      const fromNodes = officialNodes.filter((n) => nodeMatchesType(n, rule.fromNodeType));
      const toNodes = officialNodes.filter((n) => nodeMatchesType(n, rule.toNodeType));
      for (const fromNode of fromNodes) {
        for (const toNode of toNodes) {
          if (fromNode.id === toNode.id) continue;
          tryAdd(rule, fromNode, toNode, maxKm);
          added += 1;
          if (added >= MAX_EDGES_PER_RULE) break;
        }
        if (added >= MAX_EDGES_PER_RULE) break;
      }
    }
  };

  processRules(E2E_FEEDER_CONNECTIONS, MAX_E2E_FEEDER_KM);
  processRules(RE2E_FEEDER_CONNECTIONS, MAX_RE2E_CONNECTOR_KM);

  // Fallback: feeder_city → e2e_hub when typed nodes are sparse
  if (out.length < 3) {
    const e2eHubs = officialNodes.filter(
      (n) =>
        nodeMatchesType(n, NODE_TYPES.E2E_HUB) ||
        nodeMatchesType(n, NODE_TYPES.GLOBAL_HUB)
    );
    const feeders = officialNodes.filter(
      (n) =>
        nodeMatchesType(n, NODE_TYPES.FEEDER_CITY) ||
        nodeMatchesType(n, NODE_TYPES.REGIONAL_GATEWAY)
    );
    const rule = E2E_FEEDER_CONNECTIONS[0];
    let added = 0;
    for (const fromNode of feeders) {
      for (const toNode of e2eHubs) {
        tryAdd(rule, fromNode, toNode, MAX_E2E_FEEDER_KM);
        added += 1;
        if (added >= 3) break;
      }
      if (added >= 3) break;
    }
  }

  return out;
}
