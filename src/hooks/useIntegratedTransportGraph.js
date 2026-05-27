/**
 * Hook — integrated transport graph for UI (Phase 2 generator, Phase 3 consumer).
 * Does not mutate source data; filters produce visibleNodes / visibleEdges views.
 */

import { useMemo } from 'react';
import { generateIntegratedRoutes } from '../graph/generateIntegratedRoutes.js';
import { getIntegratedGraph } from '../data/canonicalTransportAdapter.js';
import { mergeGraphBackbone } from '../graph/planetaryMobilityGraphEngine.js';
import { classifyCity } from '../modes/classifyLocation.js';
import { DEFAULT_MINERAL_HUBS } from '../data/mineralHubs.js';
import { filterIntegratedGraph } from '../ui/integratedGridFilters.js';

/**
 * Canonical backbone (E2E/hyperloop) + legacy E2M/loop/mineral enrichment.
 * @param {{ nodes: object[], edges: object[] }} canonical
 * @param {{ nodes: object[], edges: object[], diagnostics: object }} legacy
 */
function mergeCanonicalIntegratedGraph(canonical, legacy) {
  const merged = mergeGraphBackbone(canonical, legacy);
  return {
    ...merged,
    diagnostics: {
      ...legacy.diagnostics,
      warnings: [
        ...(legacy.diagnostics?.warnings ?? []),
        'Merged canonical v1.4.0 E2E/hyperloop with legacy E2M/loop routes',
      ],
      dataSource: 'canonical-transport-v1.4.0+legacy',
    },
  };
}

const EMPTY_DIAGNOSTICS = {
  totalNodes: 0,
  totalEdges: 0,
  cityCount: 0,
  e2eHubCount: 0,
  mineralHubCount: 0,
  e2eRouteCount: 0,
  e2mRouteCount: 0,
  loopRouteCount: 0,
  hyperloopRouteCount: 0,
  orphanNodeCount: 0,
  orphanMineralHubCount: 0,
  duplicateEdgeCountRemoved: 0,
  warnings: [],
};

/**
 * Pure builder — safe for unit tests without React.
 * @param {object} params
 * @returns {{
 *   nodes: object[],
 *   edges: object[],
 *   diagnostics: object,
 *   visibleNodes: object[],
 *   visibleEdges: object[],
 *   isReady: boolean,
 *   error: string | null,
 * }}
 */
export function buildIntegratedTransportGraph({
  cities = [],
  existingHyperloopGraph = null,
  mineralHubs = DEFAULT_MINERAL_HUBS,
  layerState = {},
  options = {},
} = {}) {
  try {
    const classifiedCities = (cities ?? []).map((c) =>
      classifyCity({
        ...c,
        city_id: c.city_id ?? c.networkCityId ?? c.id,
        latitude: c.lat ?? c.latitude,
        longitude: c.lon ?? c.longitude,
      })
    );

    const useCanonicalGraph =
      options?.useCanonicalGraph === true ||
      (existingHyperloopGraph != null && options?.useCanonicalGraph !== false);

    let graph;
    let usedCanonicalGraph = false;
    if (useCanonicalGraph) {
      const legacyGraph = generateIntegratedRoutes({
        cities: classifiedCities,
        mineralHubs,
        existingHyperloopGraph,
        options,
      });
      try {
        const canonical = getIntegratedGraph(options?.modeFilter ?? null);
        if (canonical?.nodes?.length && canonical?.edges?.length) {
          const merged = mergeCanonicalIntegratedGraph(canonical, legacyGraph);
          graph = { nodes: merged.nodes, edges: merged.edges, diagnostics: merged.diagnostics };
          usedCanonicalGraph = true;
        } else {
          throw new Error('Canonical integrated graph returned empty nodes or edges');
        }
      } catch (canonicalError) {
        console.warn('Canonical graph failed, falling back to legacy graph', canonicalError);
        graph = legacyGraph;
      }
    } else {
      graph = generateIntegratedRoutes({
        cities: classifiedCities,
        mineralHubs,
        existingHyperloopGraph,
        options,
      });
    }

    const diagnostics = usedCanonicalGraph
      ? {
          ...(graph.diagnostics ?? {}),
          totalNodes: graph.nodes.length,
          totalEdges: graph.edges.length,
          e2eRouteCount: graph.edges.filter((e) => e.mode === 'e2e').length,
          e2mRouteCount: graph.edges.filter((e) => e.mode === 'e2m').length,
          loopRouteCount: graph.edges.filter((e) => e.mode === 'loop').length,
          hyperloopRouteCount: graph.edges.filter((e) => e.mode === 'hyperloop').length,
          dataSource: 'canonical-transport-v1.4.0+legacy',
        }
      : { ...graph.diagnostics };
    const warnings = [...(diagnostics.warnings ?? [])];

    if (!existingHyperloopGraph) {
      warnings.push(
        'Hyperloop graph not supplied; integrated graph includes E2E, E2M, and Loop routes only'
      );
    }

    diagnostics.warnings = warnings;

    const { nodes: visibleNodes, edges: visibleEdges } = filterIntegratedGraph(
      graph.nodes,
      graph.edges,
      layerState
    );

    return {
      nodes: graph.nodes,
      edges: graph.edges,
      diagnostics,
      visibleNodes,
      visibleEdges,
      isReady: true,
      error: null,
    };
  } catch (err) {
    const message = err?.message ?? String(err);
    return {
      nodes: [],
      edges: [],
      diagnostics: {
        ...EMPTY_DIAGNOSTICS,
        warnings: [`Graph generation failed: ${message}`],
      },
      visibleNodes: [],
      visibleEdges: [],
      isReady: true,
      error: message,
    };
  }
}

/**
 * @param {object} params
 * @param {object[]} params.cities
 * @param {object} [params.existingHyperloopGraph]
 * @param {object[]} [params.mineralHubs]
 * @param {object} [params.layerState]
 * @param {object} [params.options]
 */
export function useIntegratedTransportGraph(params = {}) {
  const {
    cities = [],
    existingHyperloopGraph = null,
    mineralHubs = DEFAULT_MINERAL_HUBS,
    layerState = {},
    options = {},
  } = params;

  return useMemo(
    () =>
      buildIntegratedTransportGraph({
        cities,
        existingHyperloopGraph,
        mineralHubs,
        layerState,
        options,
      }),
    [cities, existingHyperloopGraph, mineralHubs, layerState, options]
  );
}
