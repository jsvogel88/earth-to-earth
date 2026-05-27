/**
 * Bottleneck and chokepoint detection.
 */

import { clampScore } from '../economics/scoreUtils.js';

/**
 * @param {Map<string, object>} nodeStates
 * @param {Map<string, object>} edgeStates
 * @param {Record<string, object>} nodesById
 */
export function detectBottlenecks(nodeStates, edgeStates, nodesById) {
  const hubBottlenecks = [];
  const corridorBottlenecks = [];
  const weakRedundancy = [];

  for (const [id, s] of nodeStates) {
    const node = nodesById[id];
    if (s.utilizationRate >= 78 && s.transferPressure >= 55) {
      hubBottlenecks.push({
        id,
        name: node?.name,
        type: 'transfer_hub',
        severity: clampScore(s.utilizationRate),
        utilizationRate: s.utilizationRate,
      });
    }
  }

  for (const [id, s] of edgeStates) {
    if (s.congestion >= 70 || s.bottleneckRisk >= 65) {
      corridorBottlenecks.push({
        id,
        severity: clampScore(Math.max(s.congestion, s.bottleneckRisk)),
        congestion: s.congestion,
        routeStress: s.routeStress,
      });
    }
    if (s.redundancyLoad < 25 && s.strategicDependency >= 60) {
      weakRedundancy.push({ id, strategicDependency: s.strategicDependency });
    }
  }

  hubBottlenecks.sort((a, b) => b.severity - a.severity);
  corridorBottlenecks.sort((a, b) => b.severity - a.severity);

  return {
    hubBottlenecks,
    corridorBottlenecks,
    weakRedundancy,
    criticalChokepoints: [...hubBottlenecks.slice(0, 5), ...corridorBottlenecks.slice(0, 8)],
  };
}
