import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEconomicIntelligence,
  resetEconomicIntelligenceCache,
  getEconomicDebugRankings,
} from '../economics/economicScoringEngine.js';
import { classifyRouteFamily } from '../graph/classifyRouteFamily.js';
import { filterRoutesByEconomicPriority } from '../economics/filterRoutesByEconomicPriority.js';
import { buildRouteDisplayPipeline } from '../graph/buildRouteDisplayPipeline.js';
import adapter from '../data/canonicalTransportAdapter.js';

describe('economicScoringEngine', () => {
  beforeEach(() => {
    resetEconomicIntelligenceCache();
  });

  it('produces scores in 0–100 without NaN', () => {
    const intel = getEconomicIntelligence();
    for (const [, s] of intel.nodeScores) {
      expect(s.economicWeight).toBeGreaterThanOrEqual(0);
      expect(s.economicWeight).toBeLessThanOrEqual(100);
      expect(s.civilizationIndex).toBeGreaterThanOrEqual(0);
      expect(s.civilizationIndex).toBeLessThanOrEqual(100);
      expect(Number.isNaN(s.civilizationIndex)).toBe(false);
    }
    for (const [, s] of intel.edgeScores) {
      expect(s.routeImportance).toBeGreaterThanOrEqual(0);
      expect(s.civilizationImportance).toBeLessThanOrEqual(100);
      expect(Number.isNaN(s.passengerImportance)).toBe(false);
    }
  });

  it('ranks NYC–London E2E corridor highly', () => {
    const intel = getEconomicIntelligence();
    const edges = adapter.getAllEdges();
    const e2e = edges.filter((e) => e.mode === 'e2e_starship');
    const ranked = e2e
      .map((e) => ({ id: e.id, score: intel.edgeScores.get(e.id)?.passengerImportance ?? 0 }))
      .sort((a, b) => b.score - a.score);
    expect(ranked[0]?.score).toBeGreaterThan(50);
  });

  it('economic filter reduces edges at planetary zoom', () => {
    const intel = getEconomicIntelligence();
    const edges = adapter.getAllEdges();
    const filtered = filterRoutesByEconomicPriority(edges, {
      viewMode: 'CIVILIZATION_GRID',
      zoom: 2,
      edgeScores: intel.edgeScores,
    });
    expect(filtered.length).toBeLessThan(edges.length);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('pipeline integrates economic pruning', () => {
    const result = buildRouteDisplayPipeline({ viewMode: 'CIVILIZATION_GRID', zoom: 3 });
    expect(result.stats.economicPruned).toBeGreaterThanOrEqual(0);
    expect(result.stats.visibleEdges).toBeLessThanOrEqual(result.stats.totalEdgesConsidered);
  });

  it('debug rankings return top lists', () => {
    const rankings = getEconomicDebugRankings();
    expect(rankings.topNodes.length).toBeGreaterThan(0);
    expect(rankings.topRoutes.length).toBeGreaterThan(0);
  });

  it('does not classify robotaxi as global arc', () => {
    expect(classifyRouteFamily({ mode: 'robotaxi' })).toBe('ROBOTAXI_LOCAL');
  });
});
