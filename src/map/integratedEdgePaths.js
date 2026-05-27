/**
 * Resolve integrated graph edges to deck.gl path / arc coordinates (pure, no mutation).
 */

import { normalizeNodeId } from '../graph/integratedGraphTypes.js';

/**
 * @param {object[]} nodes
 * @returns {Map<string, { lat: number, lon: number, node: object }>}
 */
export function buildNodeCoordinateIndex(nodes) {
  const index = new Map();
  for (const node of nodes ?? []) {
    const id = normalizeNodeId(node);
    const lat = node?.lat ?? node?.latitude;
    const lon = node?.lon ?? node?.longitude ?? node?.lng;
    if (!id || lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      continue;
    }
    index.set(id, { lat, lon, node });
  }
  return index;
}

/**
 * @param {object} edge
 * @param {number} zoom
 * @returns {boolean}
 */
export function edgeHasValidVisibilityZoom(edge, zoom) {
  const vis = edge?.visibility_by_zoom;
  if (!vis) return true;
  const min = vis.min ?? 0;
  const max = vis.max ?? 22;
  return zoom >= min && zoom <= max;
}

/**
 * @param {object} edge
 * @param {Map<string, { lat: number, lon: number, node: object }>} nodeIndex
 * @returns {object | null}
 */
export function integratedEdgeToDeckDatum(edge, nodeIndex) {
  const originId = edge?.origin_id ?? edge?.from;
  const destinationId = edge?.destination_id ?? edge?.to;
  if (!originId || !destinationId) return null;

  const from = nodeIndex.get(originId);
  const to = nodeIndex.get(destinationId);
  if (!from || !to) return null;

  return {
    ...edge,
    origin_id: originId,
    destination_id: destinationId,
    sourcePosition: [from.lon, from.lat],
    targetPosition: [to.lon, to.lat],
    path: [
      [from.lon, from.lat],
      [to.lon, to.lat],
    ],
    fromName: from.node?.name ?? originId,
    toName: to.node?.name ?? destinationId,
    distanceMiles:
      edge.distanceMiles ??
      (edge.distance_km != null ? Math.round(edge.distance_km / 1.60934) : null),
  };
}

/**
 * @param {object[]} edges
 * @param {Map<string, { lat: number, lon: number, node: object }>} nodeIndex
 * @param {object} [options]
 * @returns {{ arcs: object[], paths: object[], e2mArcs: object[] }}
 */
export function integratedEdgesToRenderData(edges, nodeIndex, options = {}) {
  const modes = options.modes ?? ['e2e', 'e2m', 'loop'];
  const arcs = [];
  const paths = [];
  const e2mArcs = [];

  for (const edge of edges ?? []) {
    const mode = edge?.mode ?? edge?.edgeMode;
    if (!modes.includes(mode)) continue;
    if (mode === 'auto' || mode === 'hyperloop') continue;

    const datum = integratedEdgeToDeckDatum(edge, nodeIndex);
    if (!datum) continue;

    if (mode === 'e2e') {
      arcs.push(datum);
    } else if (mode === 'e2m') {
      e2mArcs.push({
        ...datum,
        mode: 'e2m',
        routeType: edge.route_type ?? edge.routeType,
        distanceKm: edge.distance_km ?? edge.distanceKm,
      });
    } else {
      paths.push(datum);
    }
  }

  return { arcs, paths, e2mArcs };
}
