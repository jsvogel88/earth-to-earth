/**
 * Single entry point: canonical edges → view/zoom/tier filters → render buckets.
 */

import { classifyRouteFamily } from './classifyRouteFamily.js';
import { filterRoutesByView } from './filterRoutesByView.js';
import { filterRoutesByZoom } from './filterRoutesByZoom.js';
import { filterRoutesByTier } from './filterRoutesByTier.js';
import { createRenderBuckets } from './createRenderBuckets.js';
import adapter from '../data/canonicalTransportAdapter.js';
import { normalizeGraphEdge } from './normalizeGraphMember.js';
import { getEconomicIntelligence } from '../economics/economicScoringEngine.js';
import { filterRoutesByEconomicPriority } from '../economics/filterRoutesByEconomicPriority.js';
import { getSimulationState } from '../simulation/simulationEngine.js';
import { SIMULATION_MODES } from '../simulation/simulationModes.js';
import { DEFAULT_SIMULATION_YEAR } from '../ui/simulationTimeline.js';
import { computePlanetaryValidation } from '../map/planetaryValidation.js';
import { filterEdgesByPayloadFocus } from '../studio/payloadRouteFilter.js';

/**
 * @param {{ viewMode: string, zoom: number, regionFilter?: string | null, simulationYear?: number, simulationMode?: string, payloadFocusId?: string | null }} params
 */
export function buildRouteDisplayPipeline({
  viewMode,
  zoom,
  regionFilter = null,
  simulationYear = DEFAULT_SIMULATION_YEAR,
  simulationMode = SIMULATION_MODES.CIVILIZATION,
  payloadFocusId = null,
}) {
  const allEdges = adapter.getAllEdges().map((e) => normalizeGraphEdge(e));
  const allNodes = adapter.nodes;
  const nodesById =
    adapter.nodesById ||
    Object.fromEntries((allNodes ?? []).map((n) => [n.id, n]));

  const intelligence = getEconomicIntelligence();

  let visible = allEdges;
  visible = filterRoutesByView(visible, viewMode, classifyRouteFamily);
  visible = filterRoutesByZoom(visible, zoom, classifyRouteFamily, viewMode);
  visible = filterRoutesByTier(visible, zoom, viewMode);
  const beforeEconomic = visible.length;
  visible = filterRoutesByEconomicPriority(visible, {
    viewMode,
    zoom,
    edgeScores: intelligence.edgeScores,
  });

  const simulation = getSimulationState({ year: simulationYear, mode: simulationMode });
  const beforeTimeline = visible.length;
  visible = visible.filter((e) => simulation.timelineVisibleEdgeIds.has(e.id));

  const beforePayload = visible.length;
  if (payloadFocusId) {
    visible = filterEdgesByPayloadFocus(visible, payloadFocusId, classifyRouteFamily);
  }

  if (regionFilter) {
    visible = visible.filter((e) => {
      const fn = nodesById[e.fromNodeId];
      const tn = nodesById[e.toNodeId];
      return fn?.region === regionFilter || tn?.region === regionFilter;
    });
  }

  const visibleNodeIds = new Set();
  for (const e of visible) {
    visibleNodeIds.add(e.fromNodeId);
    visibleNodeIds.add(e.toNodeId);
  }
  for (const n of allNodes ?? []) {
    if (n.tier === 1) visibleNodeIds.add(n.id);
  }
  const visibleNodes = (allNodes ?? []).filter((n) => visibleNodeIds.has(n.id));

  const buckets = createRenderBuckets(
    visible,
    visibleNodes,
    nodesById,
    intelligence.edgeScores,
    simulation.edgeStates
  );

  const validation = computePlanetaryValidation({
    buckets,
    visibleEdges: visible,
    zoom,
  });

  const stats = {
    totalEdgesConsidered: allEdges.length,
    visibleEdges: visible.length,
    economicPruned: beforeEconomic - visible.length,
    timelinePruned: beforeTimeline - visible.length,
    payloadPruned: payloadFocusId ? beforePayload - visible.length : 0,
    payloadFocusId: payloadFocusId ?? null,
    simulationYear,
    simulationEra: simulation.stats?.eraLabel,
    arcs: buckets.arcs.length,
    trunkPaths: buckets.trunkPaths.length,
    loopPaths: buckets.loopPaths.length,
    feederPaths: buckets.feederPaths.length,
    cargoArcs: buckets.cargoArcs.length,
    cargoPaths: buckets.cargoArcs.length,
    localZones: buckets.localZones.length,
    hiddenEdges: allEdges.length - visible.length,
    viewMode,
    zoom,
    regionFilter,
    validation,
  };

  return { ...buckets, stats, simulation, validation };
}
