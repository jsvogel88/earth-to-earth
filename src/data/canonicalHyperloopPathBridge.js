/**
 * Bridges canonical hyperloop route paths to deck PathLayer-ready objects.
 * Falls back to legacy planetary graph paths when canonical load fails.
 */

import { getHyperloopPaths } from './canonicalTransportAdapter.js';
import { HYPERLOOP_ROUTE_CLASSES } from './hyperloopRouteClasses.js';
import { isPlanningOnlyHyperloopPath } from './canonicalIntegration.js';

/**
 * @param {ReturnType<typeof getHyperloopPaths>} canonicalPaths
 * @returns {object[]}
 */
export function canonicalPathsToDeck(canonicalPaths) {
  return (canonicalPaths ?? []).map((p, i) => {
    const isSpine =
      p.routeType === 'continental_spine' ||
      p.routeType === 'global_backbone' ||
      p.tier === 1;
    return {
      id: p.routeId || `canonical-hl-${i}`,
      path: p.path,
      routeClass: isSpine
        ? HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE
        : HYPERLOOP_ROUTE_CLASSES.REGIONAL,
      edgeCategory: isSpine ? 'CONTINENTAL_SPINE' : 'REGIONAL_TRUNK',
      infrastructureTier: p.tier ?? 2,
      economicTier: p.economicTier ?? p.tier ?? 2,
      renderable: true,
      infrastructureOnly: true,
      fromName: p.name,
      toName: p.name,
      mode: p.mode,
      generatedBy: 'canonical-transport-v1.4.0',
    };
  });
}

/**
 * Prefer canonical ground/tube paths; keep legacy paths on failure or empty canonical set.
 * @param {object} planetaryGraph
 * @param {object} [options]
 * @returns {object}
 */
export function withCanonicalHyperloopPaths(planetaryGraph, options = {}) {
  if (!planetaryGraph) return planetaryGraph;
  try {
    const canonical = getHyperloopPaths(options);
    const deckPaths = canonicalPathsToDeck(canonical);
    if (deckPaths.length > 0) {
      const planningOnly = (planetaryGraph.paths ?? []).filter(isPlanningOnlyHyperloopPath);
      return {
        ...planetaryGraph,
        paths: [...deckPaths, ...planningOnly],
        canonicalPathsActive: true,
      };
    }
  } catch (error) {
    console.warn('Canonical hyperloop paths failed, using legacy paths', error);
  }
  return { ...planetaryGraph, canonicalPathsActive: false };
}
