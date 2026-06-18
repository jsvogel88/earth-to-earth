/**
 * Hook — integrated transport graph for UI (Phase 2 generator, Phase 3 consumer).
 * Does not mutate source data; filters produce visibleNodes / visibleEdges views.
 */

import { useMemo } from 'react';
import { generateIntegratedRoutes } from '../graph/generateIntegratedRoutes.js';
import {
  buildPlanetaryMobilityGraph,
  countGeometryIntentViolations,
} from '../graph/planetaryMobilityGraphEngine.js';
import { summarizeFeederEdges } from '../graph/feederRouteSemantics.js';
import { buildSyntheticStrategicFeeders } from '../graph/buildSyntheticStrategicFeeders.js';
import { buildIntermodalFeederEdges } from '../graph/buildIntermodalFeederEdges.js';
import { classifyCity } from '../modes/classifyLocation.js';
import { DEFAULT_MINERAL_HUBS } from '../data/mineralHubs.js';
import { filterIntegratedGraph } from '../ui/integratedGridFilters.js';

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
    let usedPlanetaryEngine = false;
    if (useCanonicalGraph) {
      const legacyGraph = generateIntegratedRoutes({
        cities: classifiedCities,
        mineralHubs,
        existingHyperloopGraph,
        options,
      });
      try {
        const pmGraph = buildPlanetaryMobilityGraph({
          legacyGraph: { nodes: legacyGraph.nodes, edges: legacyGraph.edges },
          customDestinations: options.customDestinations ?? [],
          parsedCities: options.parsedCities ?? [],
          includeStarbaseOverlays: false,
          modeFilter: options.modeFilter ?? null,
        });
        if (pmGraph?.nodes?.length && pmGraph?.edges?.length) {
          graph = {
            nodes: pmGraph.nodes,
            edges: pmGraph.edges,
            diagnostics: {
              ...(legacyGraph.diagnostics ?? {}),
              ...pmGraph.diagnostics,
              warnings: [
                ...(legacyGraph.diagnostics?.warnings ?? []),
                ...(pmGraph.warnings ?? []),
                'Built via buildPlanetaryMobilityGraph (canonical + legacy merge)',
              ],
              dataSource: pmGraph.diagnostics?.dataSource ?? 'planetary-mobility-engine',
              planetaryEngine: true,
            },
          };
          usedPlanetaryEngine = true;
        } else {
          throw new Error('Planetary mobility graph returned empty backbone');
        }
      } catch (engineError) {
        console.warn('Planetary mobility graph failed, falling back to legacy merge', engineError);
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

    const synthesizeFeeders =
      options?.synthesizeStrategicFeeders === true ||
      options?.synthesizeStrategicFeeders === 'true';

    const syntheticFeederEdges = buildSyntheticStrategicFeeders({
      nodes: graph.nodes,
      existingEdges: graph.edges,
      enabled: synthesizeFeeders,
    });
    const intermodalFeederEdges = buildIntermodalFeederEdges({
      nodes: graph.nodes,
      existingEdges: [...graph.edges, ...syntheticFeederEdges],
      enabled: synthesizeFeeders,
    });

    const allEdges = [
      ...graph.edges,
      ...syntheticFeederEdges,
      ...intermodalFeederEdges,
    ];

    const geometryViolations = countGeometryIntentViolations(allEdges);
    const feederSummary = summarizeFeederEdges(allEdges);

    const diagnostics = {
      ...(graph.diagnostics ?? {}),
      totalNodes: graph.nodes.length,
      totalEdges: allEdges.length,
      e2eRouteCount: allEdges.filter(
        (e) => e.mode === 'e2e' || e.mode === 'e2e_starship'
      ).length,
      e2mRouteCount: allEdges.filter((e) => e.mode === 'e2m' || e.mode === 're2e').length,
      loopRouteCount: allEdges.filter((e) => e.mode === 'loop').length,
      hyperloopRouteCount: allEdges.filter((e) => e.mode === 'hyperloop').length,
      geometryViolations,
      feederSummary,
      syntheticFeederCount: syntheticFeederEdges.length,
      intermodalFeederCount: intermodalFeederEdges.length,
      planetaryEngine: usedPlanetaryEngine,
    };

    const warnings = [...(diagnostics.warnings ?? [])];

    if (!existingHyperloopGraph) {
      warnings.push(
        'Hyperloop graph not supplied; integrated graph includes E2E, E2M, and Loop routes only'
      );
    }

    if (syntheticFeederEdges.length > 0) {
      warnings.push(
        `Synthetic strategic feeders enabled (+${syntheticFeederEdges.length} conceptual edges)`
      );
    }
    if (intermodalFeederEdges.length > 0) {
      warnings.push(
        `Intermodal feeder synthesis enabled (+${intermodalFeederEdges.length} conceptual edges)`
      );
    }

    diagnostics.warnings = warnings;

    const { nodes: visibleNodes, edges: visibleEdges } = filterIntegratedGraph(
      graph.nodes,
      allEdges,
      layerState
    );

    return {
      nodes: graph.nodes,
      edges: allEdges,
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
