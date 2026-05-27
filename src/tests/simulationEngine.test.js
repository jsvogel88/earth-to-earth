import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSimulationState,
  resetSimulationCache,
  runSimulationCycle,
  getSimulationDebugRankings,
} from '../simulation/simulationEngine.js';
import { SIMULATION_MODES } from '../simulation/simulationModes.js';
import { edgeVisibleAtTimeline } from '../simulation/timelineEvolution.js';
import { buildRouteDisplayPipeline } from '../graph/buildRouteDisplayPipeline.js';
import adapter from '../data/canonicalTransportAdapter.js';

describe('simulationEngine', () => {
  beforeEach(() => {
    resetSimulationCache();
  });

  it('produces valid node and edge simulation state without NaN', () => {
    const sim = runSimulationCycle({ year: 2040, mode: SIMULATION_MODES.CIVILIZATION });
    for (const [, s] of sim.nodeStates) {
      expect(Number.isNaN(s.utilizationRate)).toBe(false);
      expect(s.utilizationRate).toBeGreaterThanOrEqual(0);
      expect(s.utilizationRate).toBeLessThanOrEqual(100);
      expect(s.currentLoad).toBeGreaterThanOrEqual(0);
    }
    for (const [, s] of sim.edgeStates) {
      expect(Number.isNaN(s.congestion)).toBe(false);
      expect(s.passengerFlow).toBeLessThanOrEqual(100);
    }
  });

  it('shows more infrastructure at 2075 than 2025', () => {
    const early = runSimulationCycle({ year: 2025 });
    const late = runSimulationCycle({ year: 2075 });
    expect(late.timelineVisibleEdgeIds.size).toBeGreaterThan(early.timelineVisibleEdgeIds.size);
  });

  it('intermodal hubs have higher transfer pressure', () => {
    const sim = getSimulationState({ year: 2050 });
    const nodes = adapter.nodes.filter((n) => n.tags?.includes('transfer_hub'));
    const pressures = nodes.map((n) => sim.nodeStates.get(n.id)?.transferPressure ?? 0);
    const avgHub = pressures.reduce((a, b) => a + b, 0) / Math.max(1, pressures.length);
    expect(avgHub).toBeGreaterThan(20);
  });

  it('detects bottlenecks and expansion candidates', () => {
    const sim = getSimulationState({ year: 2050 });
    expect(sim.bottlenecks.hubBottlenecks.length + sim.bottlenecks.corridorBottlenecks.length).toBeGreaterThan(
      0
    );
    expect(sim.expansion.candidates.length).toBeGreaterThan(0);
  });

  it('pipeline integrates timeline simulation year', () => {
    const y2025 = buildRouteDisplayPipeline({
      viewMode: 'CIVILIZATION_GRID',
      zoom: 7,
      simulationYear: 2025,
    });
    const y2075 = buildRouteDisplayPipeline({
      viewMode: 'CIVILIZATION_GRID',
      zoom: 7,
      simulationYear: 2075,
    });
    expect(y2075.stats.visibleEdges).toBeGreaterThanOrEqual(y2025.stats.visibleEdges);
  });

  it('debug rankings return lists', () => {
    const debug = getSimulationDebugRankings(getSimulationState({ year: 2030 }));
    expect(debug.topCongestedHubs.length).toBeGreaterThan(0);
    expect(debug.topLoadedCorridors.length).toBeGreaterThan(0);
  });

  it('edgeVisibleAtTimeline respects importance thresholds', () => {
    const edges = adapter.getAllEdges();
    const e2e = edges.find((e) => e.mode === 'e2e_starship');
    expect(edgeVisibleAtTimeline(e2e, 2025, { civilizationImportance: 80 })).toBe(true);
    expect(edgeVisibleAtTimeline(e2e, 2025, { civilizationImportance: 5 })).toBe(false);
  });
});
