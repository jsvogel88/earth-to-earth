/**
 * Planetary mobility simulation engine — cached snapshots by year + mode.
 */

import adapter from '../data/canonicalTransportAdapter.js';
import { getEconomicIntelligence } from '../economics/economicScoringEngine.js';
import { clampScore, safeNumber } from '../economics/scoreUtils.js';
import { classifyRouteFamily } from '../graph/classifyRouteFamily.js';
import { getTimelineNetworkMaturity, edgeVisibleAtTimeline } from './timelineEvolution.js';
import { propagateDemand, initialNodeDemand } from './demandPropagation.js';
import { detectBottlenecks } from './bottleneckDetection.js';
import { computeExpansionPressure } from './expansionPressure.js';
import { computeResilienceScores } from './resilienceModel.js';
import { SIMULATION_MODES, simulationMetricForMode } from './simulationModes.js';
import { DEFAULT_SIMULATION_YEAR } from '../ui/simulationTimeline.js';

const _cache = new Map();

/**
 * @param {object} edge
 * @param {object} fromIntel
 * @param {object} toIntel
 * @param {object} routeScore
 * @param {object} fromNodeState
 * @param {object} toNodeState
 * @param {object} maturity
 */
function buildRouteSimulationState(
  edge,
  fromIntel,
  toIntel,
  routeScore,
  fromNodeState,
  toNodeState,
  maturity
) {
  const family = classifyRouteFamily(edge);
  const baseFlow =
    ((fromNodeState?.passengerFlow ?? 0) + (toNodeState?.passengerFlow ?? 0)) / 2;
  const cargoFlow =
    ((fromNodeState?.cargoFlow ?? 0) + (toNodeState?.cargoFlow ?? 0)) / 2 *
    (family === 'E2M_CARGO' ? 1.4 : 1);

  const passengerFlow = clampScore(
    baseFlow * 0.5 + safeNumber(routeScore?.passengerImportance) * maturity.passengerDemandScale * 0.5
  );
  const activeTraffic = clampScore((passengerFlow + cargoFlow) / 2);
  const utilization = clampScore(
    activeTraffic / Math.max(20, safeNumber(routeScore?.throughputPotential, 40))
  );
  const congestion = clampScore(utilization * 0.9 + safeNumber(fromNodeState?.congestionLevel) * 0.1);
  const routeStress = clampScore(
    congestion * 0.45 + safeNumber(routeScore?.strategicImportance) * 0.35 + utilization * 0.2
  );

  return {
    activeTraffic,
    congestion,
    cargoFlow,
    passengerFlow,
    bottleneckRisk: clampScore(congestion * 0.7 + (utilization > 85 ? 25 : 0)),
    routeStress,
    redundancyLoad: clampScore(safeNumber(routeScore?.redundancyImportance)),
    strategicDependency: clampScore(safeNumber(routeScore?.strategicImportance)),
    utilization,
    overflowPressure: clampScore(Math.max(0, utilization - 70) * 1.4),
  };
}

/**
 * @param {{ year?: number, mode?: string }} params
 */
export function runSimulationCycle({ year = DEFAULT_SIMULATION_YEAR, mode = SIMULATION_MODES.CIVILIZATION } = {}) {
  const intelligence = getEconomicIntelligence();
  const nodes = adapter.nodes ?? [];
  const edges = adapter.getAllEdges?.() ?? adapter.edges ?? [];
  const nodesById = adapter.nodesById ?? Object.fromEntries(nodes.map((n) => [n.id, n]));
  const maturity = getTimelineNetworkMaturity(year);

  const nodeStates = new Map();
  for (const node of nodes) {
    const intel = intelligence.nodeScores.get(node.id);
    nodeStates.set(node.id, initialNodeDemand(node, intel, maturity));
    const s = nodeStates.get(node.id);
    s.intermodalBoost = clampScore(safeNumber(intel?.intermodalScore) * maturity.globalMaturity);
    if (intel?.intermodalScore >= 60) {
      s.maxCapacity = clampScore(s.maxCapacity * 1.25);
      s.transferPressure = clampScore(s.transferPressure * 1.15);
    }
  }

  propagateDemand(nodeStates, edges, nodesById, 3);

  const edgeStates = new Map();
  for (const edge of edges) {
    const fromIntel = intelligence.nodeScores.get(edge.fromNodeId);
    const toIntel = intelligence.nodeScores.get(edge.toNodeId);
    const routeScore = intelligence.edgeScores.get(edge.id);
    const fs = nodeStates.get(edge.fromNodeId);
    const ts = nodeStates.get(edge.toNodeId);
    if (!fs || !ts) continue;

    edgeStates.set(
      edge.id,
      buildRouteSimulationState(edge, fromIntel, toIntel, routeScore, fs, ts, maturity)
    );
  }

  const bottlenecks = detectBottlenecks(nodeStates, edgeStates, nodesById);
  const expansion = computeExpansionPressure(nodeStates, nodesById, maturity);
  const resilience = computeResilienceScores(nodeStates, edges, nodesById);

  const timelineVisible = edges.filter((e) =>
    edgeVisibleAtTimeline(e, year, intelligence.edgeScores.get(e.id))
  );

  const stats = {
    year,
    mode,
    eraLabel: maturity.eraLabel,
    globalMaturity: maturity.globalMaturity,
    nodeCount: nodeStates.size,
    edgeCount: edgeStates.size,
    timelineVisibleEdges: timelineVisible.length,
    hubBottleneckCount: bottlenecks.hubBottlenecks.length,
    corridorBottleneckCount: bottlenecks.corridorBottlenecks.length,
    expansionCandidateCount: expansion.candidates.length,
  };

  return {
    year,
    mode,
    maturity,
    nodeStates,
    edgeStates,
    bottlenecks,
    expansion,
    resilience,
    timelineVisibleEdgeIds: new Set(timelineVisible.map((e) => e.id)),
    stats,
  };
}

function cacheKey(year, mode) {
  return `${year}:${mode}`;
}

/**
 * Cached simulation snapshot — recomputes only when year/mode changes.
 * @param {{ year?: number, mode?: string }} params
 */
export function getSimulationState(params = {}) {
  const year = params.year ?? DEFAULT_SIMULATION_YEAR;
  const mode = params.mode ?? SIMULATION_MODES.CIVILIZATION;
  const key = cacheKey(year, mode);
  if (!_cache.has(key)) {
    _cache.set(key, runSimulationCycle({ year, mode }));
  }
  return _cache.get(key);
}

export function resetSimulationCache() {
  _cache.clear();
}

/**
 * @param {object} simulation
 * @param {number} [limit]
 */
export function getSimulationDebugRankings(simulation, limit = 8) {
  const sim = simulation ?? getSimulationState();
  const nodes = [...sim.nodeStates.entries()]
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.congestionLevel - a.congestionLevel)
    .slice(0, limit);

  const edges = [...sim.edgeStates.entries()]
    .map(([id, s]) => ({
      id,
      metric: simulationMetricForMode(s, sim.mode),
      ...s,
    }))
    .sort((a, b) => b.metric - a.metric)
    .slice(0, limit);

  const growing = sim.expansion?.regions?.slice(0, limit) ?? [];

  return {
    topCongestedHubs: nodes,
    topLoadedCorridors: edges,
    fastestGrowingRegions: growing,
    bottlenecks: sim.bottlenecks?.criticalChokepoints?.slice(0, limit) ?? [],
    weakestResilience: sim.resilience?.failureScenarios?.slice(0, 3) ?? [],
    stats: sim.stats,
  };
}
