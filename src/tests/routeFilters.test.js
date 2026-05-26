import { describe, it, expect } from 'vitest';
import { buildPlanetaryHyperloopGraph } from '../graph/buildPlanetaryHyperloopGraph.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';
import {
  isCoreHyperloopWebPath,
  isHyperloopPathVisible,
  filterVisiblePaths,
} from '../graph/visibleGraphFilter.js';
import { isInfrastructurePathVisible } from '../graph/infrastructureVisibility.js';
import { isPlanetarySkeletonPath } from '../graph/planetarySkeletonVisibility.js';
import { isPriorityRemoteCorridorVisible } from '../graph/corridorPriorityScore.js';
import { cloneGraphSnapshot } from './helpers/graphAssertions.js';
import { getMapRoiHubs } from '../data/worldCities.js';

describe('route filters', () => {
  const graph = buildPlanetaryHyperloopGraph({
    activeE2EHubs: getMapRoiHubs().slice(0, 5),
  });

  it('E2E mode shows planetary skeleton trunks but not full Hyperloop Web through-routes', () => {
    const e2eState = buildDefaultLayerState(TRANSPORT_MODES.E2E_STARSHIP);
    const hlState = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);
    expect(e2eState.showPlanetarySkeleton).toBe(true);
    expect(e2eState.showPlanetaryTrunks).toBe(true);
    expect(e2eState.showThroughRoutes).toBe(false);
    expect(hlState.showPlanetaryTrunks).toBe(true);
    expect(hlState.showThroughRoutes).toBe(true);

    const trunkPath = graph.paths.find((p) => p.edgeCategory === 'PLANETARY_TRUNK');
    expect(trunkPath).toBeTruthy();
    expect(
      isPlanetarySkeletonPath(trunkPath, e2eState, 2, TRANSPORT_MODES.E2E_STARSHIP)
    ).toBe(true);
    expect(
      isInfrastructurePathVisible(trunkPath, hlState, 5, TRANSPORT_MODES.HYPERLOOP_CORE)
    ).toBe(true);

    const visibleTrunksHl = filterVisiblePaths(graph.paths, {
      layerState: hlState,
      mapMode: TRANSPORT_MODES.HYPERLOOP_CORE,
      zoom: 5,
    }).filter((p) => p.edgeCategory === 'PLANETARY_TRUNK');
    expect(visibleTrunksHl.length).toBeGreaterThan(0);
  });

  it('Hyperloop Web mode shows trunk corridors when layer toggles are on', () => {
    const hlState = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);
    expect(hlState.showPlanetaryTrunks).toBe(true);
    expect(hlState.showThroughRoutes).toBe(true);

    const trunkPath = graph.paths.find((p) => p.edgeCategory === 'PLANETARY_TRUNK');
    if (trunkPath) {
      expect(
        isCoreHyperloopWebPath(trunkPath, hlState, 5, TRANSPORT_MODES.HYPERLOOP_CORE)
      ).toBe(true);
    }
  });

  it('debug-only repair links stay hidden unless debug toggle enabled', () => {
    const normal = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);
    const repair = graph.paths.find(
      (p) =>
        p.edgeType === 'CONNECTIVITY_REPAIR_LINK' || p.edgeCategory === 'CONNECTIVITY_REPAIR'
    );
    if (!repair) return;
    expect(isHyperloopPathVisible(repair, normal)).toBe(false);
    expect(
      isHyperloopPathVisible(repair, { ...normal, showConnectivityRepairLinks: true })
    ).toBe(true);
  });

  it('cargo / strategic overlays remain optional', () => {
    const state = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);
    expect(state.showRareEarthHubs).toBe(false);
    expect(state.showRemoteCargoRoutes).toBe(false);
    const corridor = graph.paths.find((p) => p.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR');
    if (corridor) {
      expect(isHyperloopPathVisible(corridor, state)).toBe(false);
      expect(isHyperloopPathVisible(corridor, { ...state, showRemoteCargoRoutes: true })).toBe(
        true
      );
    }
  });

  it('rural / remote corridors respect priority filtering helper', () => {
    const rural = graph.paths.find((p) => p.edgeCategory === 'EXTENDED_RURAL');
    if (!rural) return;
    const hidden = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);
    expect(isHyperloopPathVisible(rural, hidden)).toBe(false);
    expect(
      isHyperloopPathVisible(rural, { ...hidden, showExtendedRuralLayer: true })
    ).toBe(true);
    expect(typeof isPriorityRemoteCorridorVisible(rural, 6)).toBe('boolean');
  });

  it('filterVisiblePaths does not mutate graph nodes or edges', () => {
    const before = cloneGraphSnapshot(graph);
    const layerState = buildDefaultLayerState(TRANSPORT_MODES.HYPERLOOP_CORE);
    filterVisiblePaths(graph.paths, {
      layerState,
      mapMode: TRANSPORT_MODES.HYPERLOOP_CORE,
      zoom: 5,
    });
    expect(cloneGraphSnapshot(graph)).toEqual(before);
  });
});
