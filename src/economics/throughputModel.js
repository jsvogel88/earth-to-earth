/**
 * Heuristic throughput estimates for corridors (no external APIs).
 */

import { clampScore, logPopulationScore, safeNumber } from './scoreUtils.js';

/**
 * @param {object} edge
 * @param {object} fromNode
 * @param {object} toNode
 * @param {object} nodeIntelFrom
 * @param {object} nodeIntelTo
 * @param {number} connectivityFrom
 * @param {number} connectivityTo
 */
export function estimateThroughput(
  edge,
  fromNode,
  toNode,
  nodeIntelFrom,
  nodeIntelTo,
  connectivityFrom = 0,
  connectivityTo = 0
) {
  const popFactor =
    (logPopulationScore(fromNode?.population) + logPopulationScore(toNode?.population)) / 2;
  const gdpFactor =
    (safeNumber(nodeIntelFrom?.gdpWeight) + safeNumber(nodeIntelTo?.gdpWeight)) / 2;
  const connFactor = clampScore(
    ((connectivityFrom + connectivityTo) / 20) * 100
  );
  const tierFactor = clampScore(100 - (safeNumber(edge.tier, 2) - 1) * 22);

  const passengerFlow = clampScore(
    popFactor * 0.35 + gdpFactor * 0.3 + connFactor * 0.2 + tierFactor * 0.15
  );
  const cargoFlow = clampScore(
    gdpFactor * 0.35 +
      safeNumber(nodeIntelFrom?.industrialWeight, 0) * 0.15 +
      safeNumber(nodeIntelTo?.industrialWeight, 0) * 0.15 +
      connFactor * 0.2 +
      (edge.mode === 'e2m' ? 25 : 0)
  );

  const logisticsImportance = clampScore(
    (safeNumber(nodeIntelFrom?.logisticsWeight) + safeNumber(nodeIntelTo?.logisticsWeight)) / 2
  );
  const transferLoad = clampScore(
    (safeNumber(nodeIntelFrom?.transferImportance) + safeNumber(nodeIntelTo?.transferImportance)) /
      2
  );
  const intermodalRelevance = clampScore(
    (safeNumber(nodeIntelFrom?.intermodalScore) + safeNumber(nodeIntelTo?.intermodalScore)) / 2
  );

  return {
    passengerFlowEstimate: passengerFlow,
    cargoFlowEstimate: cargoFlow,
    logisticsImportance,
    transferLoad,
    intermodalRelevance,
    throughputWeight: clampScore((passengerFlow + cargoFlow) / 2),
  };
}
