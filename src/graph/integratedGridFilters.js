/**
 * Combined integrated graph filters (layer flags + zoom tier). Does not mutate source data.
 */

import {
  filterIntegratedGraph as filterByLayerFlags,
  mergeIntegratedFilterDefaults,
} from '../ui/integratedGridFilters.js';
import { filterEdgesByZoom, filterNodesByZoom, getZoomTier } from '../modes/zoomVisibility.js';
import { mergeCanonicalLayerVisibility } from '../data/canonicalZoomVisibilityBridge.js';

export { mergeIntegratedFilterDefaults, getZoomTier };

/**
 * @param {object} params
 * @param {object[]} params.nodes
 * @param {object[]} params.edges
 * @param {object} [params.activeFilters]
 * @param {object} [params.activeModes]
 * @param {number} [params.zoom]
 * @returns {{
 *   visibleNodes: object[],
 *   visibleEdges: object[],
 *   hiddenNodeCount: number,
 *   hiddenEdgeCount: number,
 *   zoomTier: string,
 * }}
 */
export function filterIntegratedGraph({
  nodes = [],
  edges = [],
  activeFilters = {},
  activeModes = {},
  zoom = 2,
} = {}) {
  const filters = mergeCanonicalLayerVisibility(
    { ...activeFilters, ...activeModes },
    zoom
  );
  const layerPass = filterByLayerFlags(nodes, edges, filters);
  const zoomEdges = filterEdgesByZoom(layerPass.visibleEdges, zoom, filters);
  const zoomNodes = filterNodesByZoom(layerPass.visibleNodes, zoomEdges, zoom, filters);

  return {
    visibleNodes: zoomNodes,
    visibleEdges: zoomEdges,
    nodes: zoomNodes,
    edges: zoomEdges,
    hiddenNodeCount: Math.max(0, (nodes?.length ?? 0) - zoomNodes.length),
    hiddenEdgeCount: Math.max(0, (edges?.length ?? 0) - zoomEdges.length),
    zoomTier: getZoomTier(zoom),
  };
}
