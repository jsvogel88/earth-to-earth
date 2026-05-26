/**
 * Single entry point: canonical edges → view/zoom/tier filters → render buckets.
 */

import { classifyRouteFamily } from './classifyRouteFamily.js';
import { filterRoutesByView } from './filterRoutesByView.js';
import { filterRoutesByZoom } from './filterRoutesByZoom.js';
import { filterRoutesByTier } from './filterRoutesByTier.js';
import { createRenderBuckets } from './createRenderBuckets.js';
import adapter from '../data/canonicalTransportAdapter.js';

/**
 * @param {{ viewMode: string, zoom: number, regionFilter?: string | null }} params
 */
export function buildRouteDisplayPipeline({
  viewMode,
  zoom,
  regionFilter = null,
}) {
  const allEdges = adapter.getAllEdges();
  const allNodes = adapter.nodes;
  const nodesById =
    adapter.nodesById ||
    Object.fromEntries((allNodes ?? []).map((n) => [n.id, n]));

  let visible = allEdges;
  visible = filterRoutesByView(visible, viewMode, classifyRouteFamily);
  visible = filterRoutesByZoom(visible, zoom, classifyRouteFamily);
  visible = filterRoutesByTier(visible, zoom);

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

  const buckets = createRenderBuckets(visible, visibleNodes, nodesById);

  const stats = {
    totalEdgesConsidered: allEdges.length,
    visibleEdges: visible.length,
    arcs: buckets.arcs.length,
    trunkPaths: buckets.trunkPaths.length,
    loopPaths: buckets.loopPaths.length,
    feederPaths: buckets.feederPaths.length,
    cargoPaths: buckets.cargoPaths.length,
    localZones: buckets.localZones.length,
    hiddenEdges: allEdges.length - visible.length,
    viewMode,
    zoom,
    regionFilter,
  };

  return { ...buckets, stats };
}
