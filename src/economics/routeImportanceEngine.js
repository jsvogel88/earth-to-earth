/**
 * Route-level economic and strategic importance scoring.
 */

import { clampScore, safeNumber } from './scoreUtils.js';
import { classifySpinalTrunk } from './spinalPrioritization.js';
import { classifyEconomicCorridorType } from './economicOverlayClassifier.js';
import { estimateThroughput } from './throughputModel.js';

/**
 * @param {object} edge
 * @param {object} fromNode
 * @param {object} toNode
 * @param {object} fromIntel
 * @param {object} toIntel
 * @param {{ connectivityFrom?: number, connectivityTo?: number }} ctx
 */
export function scoreRouteImportance(edge, fromNode, toNode, fromIntel, toIntel, ctx = {}) {
  const gdpEdge = safeNumber(edge.economicWeight?.gdpGeometricMean);
  const corridor = safeNumber(edge.economicWeight?.corridorWeight);
  const trade = safeNumber(edge.economicWeight?.tradeAffinity);

  const fromCiv = safeNumber(fromIntel?.civilizationIndex);
  const toCiv = safeNumber(toIntel?.civilizationIndex);
  const hubAvg = (fromCiv + toCiv) / 2;

  const routeImportance = clampScore(
    gdpEdge * 0.38 + hubAvg * 0.32 + corridor * 0.18 + trade * 0.12
  );

  const passengerImportance = clampScore(
    edge.mode === 'e2e_starship'
      ? routeImportance
      : edge.mode === 'regional_loop' || edge.routeType === 'regional_loop'
        ? routeImportance * 0.85
        : routeImportance * 0.45
  );

  const cargoImportance = clampScore(
    edge.mode === 'e2m'
      ? routeImportance
      : edge.routeType?.includes('cargo') || edge.routeType?.includes('resource')
        ? routeImportance * 0.95
        : routeImportance * 0.35
  );

  const throughput = estimateThroughput(
    edge,
    fromNode,
    toNode,
    fromIntel,
    toIntel,
    ctx.connectivityFrom,
    ctx.connectivityTo
  );

  const strategicImportance = clampScore(
    routeImportance * 0.5 +
      safeNumber(fromIntel?.geopoliticalWeight) * 0.15 +
      safeNumber(toIntel?.geopoliticalWeight) * 0.15 +
      throughput.intermodalRelevance * 0.2
  );

  const redundancyImportance = clampScore(
    Math.min(100, (ctx.connectivityFrom + ctx.connectivityTo) * 4)
  );

  const economicDensity = clampScore(
    gdpEdge * 0.5 + (safeNumber(fromIntel?.economicWeight) + safeNumber(toIntel?.economicWeight)) * 0.25
  );

  const civilizationImportance = clampScore(
    routeImportance * 0.45 +
      hubAvg * 0.35 +
      throughput.throughputWeight * 0.2
  );

  const spinalTrunkClass = classifySpinalTrunk(edge, fromNode, toNode, {
    civilizationImportance,
  });

  return {
    routeImportance,
    throughputPotential: throughput.throughputWeight,
    strategicImportance,
    redundancyImportance,
    economicDensity,
    cargoImportance,
    passengerImportance,
    civilizationImportance,
    economicCorridorType: classifyEconomicCorridorType(fromNode, edge),
    spinalTrunkClass,
    ...throughput,
  };
}
