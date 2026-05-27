/**
 * Demand propagation — load spreads from high-growth hubs to connected corridors.
 */

import { clampScore, safeNumber } from '../economics/scoreUtils.js';

const REGION_GROWTH = {
  'East Asia': 1.15,
  'Southeast Asia': 1.12,
  'Middle East': 1.1,
  'South Asia': 1.18,
  'Europe': 1.05,
  'North America': 1.08,
  'Latin America': 1.09,
  Africa: 1.14,
  Oceania: 1.04,
};

/**
 * @param {Map<string, object>} nodeStates
 * @param {object[]} edges
 * @param {Record<string, object>} nodesById
 * @param {number} iterations
 */
export function propagateDemand(nodeStates, edges, nodesById, iterations = 3) {
  for (let pass = 0; pass < iterations; pass += 1) {
    const delta = new Map();

    for (const edge of edges) {
      const from = nodesById[edge.fromNodeId];
      const to = nodesById[edge.toNodeId];
      const fs = nodeStates.get(edge.fromNodeId);
      const ts = nodeStates.get(edge.toNodeId);
      if (!fs || !ts || !from || !to) continue;

      const pressure = (fs.growthPressure + ts.growthPressure) / 2;
      const spill = pressure * 0.12;

      delta.set(edge.fromNodeId, (delta.get(edge.fromNodeId) ?? 0) + spill * 0.5);
      delta.set(edge.toNodeId, (delta.get(edge.toNodeId) ?? 0) + spill * 0.5);
    }

    for (const [id, add] of delta) {
      const s = nodeStates.get(id);
      if (!s) continue;
      s.currentLoad = clampScore(s.currentLoad + add);
      s.utilizationRate = clampScore((s.currentLoad / Math.max(1, s.maxCapacity)) * 100);
      s.congestionLevel = clampScore(s.utilizationRate * 0.85);
      s.transferPressure = clampScore(s.transferPressure + add * 0.15);
    }
  }
}

/**
 * @param {object} node
 * @param {object} nodeIntel
 * @param {object} maturity
 */
export function initialNodeDemand(node, nodeIntel, maturity) {
  const regionBoost = REGION_GROWTH[node.region] ?? 1;
  const base =
    safeNumber(nodeIntel?.civilizationIndex) * maturity.globalMaturity * regionBoost;
  const pop = safeNumber(node.population, 0);
  const popFactor = pop > 0 ? Math.log10(pop / 500_000) * 12 : 0;

  const maxCapacity = clampScore(40 + safeNumber(nodeIntel?.intermodalScore) * 0.5 + popFactor);
  const currentLoad = clampScore(base * maturity.passengerDemandScale * 0.65);

  return {
    currentLoad,
    maxCapacity,
    utilizationRate: clampScore((currentLoad / Math.max(1, maxCapacity)) * 100),
    transferPressure: clampScore(safeNumber(nodeIntel?.transferImportance) * maturity.globalMaturity),
    congestionLevel: 0,
    passengerFlow: clampScore(currentLoad * 0.7),
    cargoFlow: clampScore(currentLoad * 0.35 * maturity.cargoDemandScale),
    growthPressure: clampScore(
      safeNumber(nodeIntel?.civilizationIndex) * regionBoost * maturity.globalMaturity
    ),
    expansionPriority: 0,
    resilienceScore: 0,
    failureImpact: 0,
  };
}
