/**
 * Resilience / failure redistribution (static analysis per simulation snapshot).
 */

import { clampScore, safeNumber } from '../economics/scoreUtils.js';

const STRESS_TEST_HUBS = [
  'node:city:singapore-singapore',
  'node:city:new-york-united-states',
  'node:city:dubai-united-arab-emirates',
  'node:city:frankfurt-germany',
];

/**
 * @param {string} hubId
 * @param {Map<string, object>} nodeStates
 * @param {object[]} edges
 * @param {Record<string, object>} nodesById
 */
export function simulateHubFailureImpact(hubId, nodeStates, edges, nodesById) {
  const affectedEdges = edges.filter(
    (e) => e.fromNodeId === hubId || e.toNodeId === hubId
  );
  const rerouteCapacity = clampScore(
    100 - affectedEdges.length * 4 - safeNumber(nodeStates.get(hubId)?.utilizationRate) * 0.3
  );
  const cascadeNodes = new Set();

  for (const e of affectedEdges) {
    const other = e.fromNodeId === hubId ? e.toNodeId : e.fromNodeId;
    cascadeNodes.add(other);
    const ns = nodeStates.get(other);
    if (ns) {
      ns.failureImpact = clampScore(ns.failureImpact + 15);
      ns.congestionLevel = clampScore(ns.congestionLevel + 8);
    }
  }

  return {
    hubId,
    name: nodesById[hubId]?.name,
    affectedEdgeCount: affectedEdges.length,
    rerouteCapacity,
    cascadeNodeCount: cascadeNodes.size,
    systemicFragility: clampScore(100 - rerouteCapacity),
  };
}

/**
 * @param {Map<string, object>} nodeStates
 * @param {object[]} edges
 * @param {Record<string, object>} nodesById
 */
export function computeResilienceScores(nodeStates, edges, nodesById) {
  const failureScenarios = [];
  const connectivity = new Map();

  for (const e of edges) {
    connectivity.set(e.fromNodeId, (connectivity.get(e.fromNodeId) ?? 0) + 1);
    connectivity.set(e.toNodeId, (connectivity.get(e.toNodeId) ?? 0) + 1);
  }

  for (const [id, s] of nodeStates) {
    const degree = connectivity.get(id) ?? 0;
    s.resilienceScore = clampScore(
      Math.min(100, degree * 8 + (100 - s.utilizationRate) * 0.35 + safeNumber(s.transferPressure) * 0.1)
    );
  }

  for (const hubId of STRESS_TEST_HUBS) {
    if (nodesById[hubId]) {
      failureScenarios.push(simulateHubFailureImpact(hubId, nodeStates, edges, nodesById));
    }
  }

  failureScenarios.sort((a, b) => b.systemicFragility - a.systemicFragility);

  return { failureScenarios, weakestHub: failureScenarios[0] ?? null };
}
