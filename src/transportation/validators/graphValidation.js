/**
 * Graph-level validation for Planetary Mobility OS.
 */

import {
  isTransportationMode,
  isNodeType,
  isRouteType,
  isCityStatus,
  isGeometryType,
  TRANSPORTATION_MODES,
  CITY_STATUS,
} from '../registries/index.js';
import { validateEdgeTaxonomy, validateNodeTaxonomy } from './taxonomyValidation.js';
import { resolveEdgeGeometryType } from '../render/visualSemantics.js';
import { isE2MLocalGroundRoute } from '../../map/e2mGeometry.js';

const E2E_MODES = new Set([TRANSPORTATION_MODES.E2E_STARSHIP, 'e2e', TRANSPORTATION_MODES.E2E_FEEDER]);
const E2M_MODES = new Set([
  TRANSPORTATION_MODES.E2M,
  TRANSPORTATION_MODES.CARGO,
  TRANSPORTATION_MODES.LOGISTICS,
  'e2m',
]);
const DEBUG_STATUSES = new Set([CITY_STATUS.DEBUG]);

/**
 * @param {object[]} nodes
 * @param {object[]} edges
 * @param {{ includeOverlays?: boolean }} [options]
 */
export function validateTransportGraph(nodes = [], edges = [], options = {}) {
  const errors = [];
  const warnings = [];
  const nodeIds = new Set();

  for (const node of nodes) {
    if (!node?.id) {
      errors.push({ type: 'MISSING_NODE_ID', message: 'node without id' });
      continue;
    }
    if (nodeIds.has(node.id)) {
      errors.push({ type: 'DUPLICATE_NODE_ID', nodeId: node.id });
    }
    nodeIds.add(node.id);

    const lat = node.latitude ?? node.lat;
    const lon = node.longitude ?? node.lon ?? node.lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      warnings.push({ type: 'MISSING_COORDS', nodeId: node.id, name: node.name });
    }

    for (const err of validateNodeTaxonomy(node)) {
      errors.push({ type: 'TAXONOMY_NODE', nodeId: node.id, message: err });
    }

    for (const mode of node.modes ?? []) {
      if (mode != null && !isTransportationMode(mode)) {
        warnings.push({ type: 'UNKNOWN_NODE_MODE', nodeId: node.id, mode });
      }
    }
  }

  const edgeIds = new Set();
  for (const edge of edges) {
    if (!edge?.id) {
      warnings.push({ type: 'MISSING_EDGE_ID', message: 'edge without id' });
      continue;
    }
    if (edgeIds.has(edge.id)) {
      errors.push({ type: 'DUPLICATE_EDGE_ID', edgeId: edge.id });
    }
    edgeIds.add(edge.id);

    const from = edge.fromNodeId ?? edge.origin_id ?? edge.from;
    const to = edge.toNodeId ?? edge.destination_id ?? edge.to;
    if (from && !nodeIds.has(from)) {
      errors.push({ type: 'ORPHAN_EDGE_FROM', edgeId: edge.id, missing: from });
    }
    if (to && !nodeIds.has(to)) {
      errors.push({ type: 'ORPHAN_EDGE_TO', edgeId: edge.id, missing: to });
    }

    for (const err of validateEdgeTaxonomy(edge)) {
      errors.push({ type: 'TAXONOMY_EDGE', edgeId: edge.id, message: err });
    }

    const mode = edge.taxonomyMode ?? edge.mode;
    const geom = edge.geometryType ?? resolveEdgeGeometryType(edge);
    if (geom && !isGeometryType(geom) && geom !== 'dashed_planning') {
      warnings.push({ type: 'UNKNOWN_GEOMETRY', edgeId: edge.id, geometryType: geom });
    }

    if (E2E_MODES.has(mode) && geom === 'ground') {
      errors.push({ type: 'E2E_GROUND_VIOLATION', edgeId: edge.id });
    }
    if (E2M_MODES.has(mode) && geom === 'ground' && !isE2MLocalGroundRoute(edge)) {
      const dist = edge.distanceKm ?? 0;
      if (dist > 100) {
        errors.push({ type: 'E2M_LONG_GROUND_VIOLATION', edgeId: edge.id, distanceKm: dist });
      }
    }
    if ((mode === TRANSPORTATION_MODES.HYPERLOOP_SPINE || mode === 'hyperloop') && geom === 'arc') {
      errors.push({ type: 'HYPERLOOP_ARC_VIOLATION', edgeId: edge.id });
    }
  }

  if (!options.includeOverlays) {
    const debugLeaks = nodes.filter(
      (n) =>
        DEBUG_STATUSES.has(n.cityStatus) &&
        n.graphMembership !== 'overlay' &&
        !n.tags?.includes('debug')
    );
    for (const n of debugLeaks) {
      warnings.push({ type: 'DEBUG_NODE_IN_OFFICIAL', nodeId: n.id });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    counts: {
      nodes: nodes.length,
      edges: edges.length,
      errorCount: errors.length,
      warningCount: warnings.length,
    },
  };
}
