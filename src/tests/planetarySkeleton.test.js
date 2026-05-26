import { describe, it, expect } from 'vitest';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { buildPlanetaryHyperloopGraph } from '../graph/index.js';
import { isPlanetarySkeletonPath } from '../graph/planetarySkeletonVisibility.js';

describe('planetary skeleton visibility', () => {
  it('civilization grid preset enables multi-modal skeleton', () => {
    const preset = buildDefaultLayerState(TRANSPORT_MODES.CIVILIZATION_GRID);
    expect(preset.showPlanetarySkeleton).toBe(true);
    expect(preset.showHyperloopInfrastructure).toBe(true);
    expect(preset.showE2MLayer).toBe(true);
    expect(preset.showRobotaxiLayer).toBe(true);
    expect(preset.showGlobalConnectivityCorridors).toBe(true);
  });

  it('E2E default preset shows planetary skeleton and connectivity', () => {
    const preset = buildDefaultLayerState(TRANSPORT_MODES.E2E_STARSHIP);
    expect(preset.showPlanetarySkeleton).toBe(true);
    expect(preset.showGlobalConnectivityCorridors).toBe(true);
  });

  it('skeleton filter does not add graph edges', () => {
    const graph = buildPlanetaryHyperloopGraph({ activeE2EHubs: [] });
    const before = graph.edges.length;
    const layerState = buildDefaultLayerState(TRANSPORT_MODES.CIVILIZATION_GRID);
    const visible = graph.paths.filter((p) =>
      isPlanetarySkeletonPath(p, layerState, 2, TRANSPORT_MODES.CIVILIZATION_GRID)
    );
    expect(graph.edges.length).toBe(before);
    expect(visible.length).toBeGreaterThan(0);
    visible.forEach((p) => expect(p.previewOnly).not.toBe(true));
  });
});
