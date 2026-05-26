/**
 * Integrated graph integrity — duplicate detection and orphan audits.
 */

import { edgeKey, normalizeNodeId } from './integratedGraphTypes.js';

/**
 * @param {object} edge
 * @returns {string}
 */
function resolveEdgeKey(edge) {
  if (edge?.id && edge.mode && edge.route_type) {
    return edgeKey(edge.origin_id ?? edge.from, edge.destination_id ?? edge.to, edge.mode, edge.route_type);
  }
  const origin = edge?.origin_id ?? edge?.from;
  const dest = edge?.destination_id ?? edge?.to;
  const mode = edge?.mode ?? 'unknown';
  const routeType = edge?.route_type ?? '';
  return edgeKey(origin, dest, mode, routeType);
}

/**
 * @param {object[]} edges
 * @returns {object[]}
 */
export function findDuplicateEdges(edges) {
  const seen = new Map();
  const duplicates = [];

  for (const edge of edges ?? []) {
    const key = resolveEdgeKey(edge);
    if (seen.has(key)) {
      duplicates.push(edge);
    } else {
      seen.set(key, edge);
    }
  }

  return duplicates;
}

/**
 * @param {object[]} edges
 * @returns {{ edges: object[], duplicateCountRemoved: number }}
 */
export function deduplicateEdges(edges) {
  const seen = new Map();
  const unique = [];

  for (const edge of edges ?? []) {
    const key = resolveEdgeKey(edge);
    if (seen.has(key)) continue;
    seen.set(key, true);
    unique.push(edge);
  }

  return {
    edges: unique,
    duplicateCountRemoved: (edges?.length ?? 0) - unique.length,
  };
}

/**
 * @param {object[]} nodes
 * @param {object[]} edges
 * @returns {Set<string>}
 */
function buildConnectedNodeIds(edges) {
  const connected = new Set();
  for (const edge of edges ?? []) {
    const a = edge.origin_id ?? edge.from;
    const b = edge.destination_id ?? edge.to;
    if (a) connected.add(a);
    if (b) connected.add(b);
  }
  return connected;
}

/**
 * @param {object[]} nodes
 * @param {object[]} edges
 * @returns {object[]}
 */
export function findOrphanNodes(nodes, edges) {
  const connected = buildConnectedNodeIds(edges);

  return (nodes ?? []).filter((node) => {
    const id = normalizeNodeId(node);
    if (!id || connected.has(id)) return false;

    const isE2EHub = node.isE2EHub || node.e2e_eligible;
    const isHyperloopConnected = node.hyperloop_connected === true;
    const isMineralHub = node.e2m_enabled || node.mineral_hub_id;

    if (isMineralHub) return false;
    return isE2EHub || isHyperloopConnected;
  });
}

/**
 * @param {object[]} nodes
 * @param {object[]} edges
 * @returns {object[]}
 */
export function findOrphanMineralHubs(nodes, edges) {
  const connected = buildConnectedNodeIds(edges);

  return (nodes ?? []).filter((node) => {
    const isMineral = node.e2m_enabled || node.mineral_hub_id || node.nodeType === 'e2m_hub';
    if (!isMineral) return false;
    const id = normalizeNodeId(node);
    return id && !connected.has(id);
  });
}

/**
 * @param {object[]} nodes
 * @param {object[]} edges
 * @returns {object}
 */
export function auditGraphIntegrity(nodes, edges) {
  const duplicates = findDuplicateEdges(edges);
  const orphanNodes = findOrphanNodes(nodes, edges);
  const orphanMineralHubs = findOrphanMineralHubs(nodes, edges);

  return {
    duplicateCount: duplicates.length,
    orphanNodeCount: orphanNodes.length,
    orphanMineralHubCount: orphanMineralHubs.length,
    orphanNodes,
    orphanMineralHubs,
  };
}
