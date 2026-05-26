/**
 * Planning-only remote cargo / critical minerals branch routes for Rare Earth Hub overlay.
 * Separate from live Hyperloop Web graph — one connector per hub max (+ optional redundancy).
 */

import { generateExtendedRuralEdges } from './extendedRuralNetwork.js';
import { hasCoordinates } from './planningLayers.js';

export function buildRemoteCargoPlanningRoutes(rareEarthHubs, globalHyperloopNodes) {
  const renderableHubs = (rareEarthHubs || [])
    .filter((n) => n.renderable && hasCoordinates(n))
    .map((n) => n._sourceRemoteNode || n);

  const edges = generateExtendedRuralEdges(renderableHubs, globalHyperloopNodes);

  const paths = edges
    .filter((e) => e.renderable !== false && e.fromNode && e.toNode)
    .map((edge) => ({
      id: `plan-${edge.id}`,
      path: [
        [edge.fromNode.lon, edge.fromNode.lat],
        [edge.toNode.lon, edge.toNode.lat],
      ],
      edgeType: edge.edgeType,
      routeClass: edge.routeClass,
      distanceMiles: edge.distanceMiles,
      tunnelRequired: edge.tunnelRequired,
      cargoPriority: edge.cargoPriority,
      visibleMinZoom: edge.visibleMinZoom ?? 7,
      renderable: true,
      fromName: edge.fromNode.name,
      toName: edge.toNode.name,
      fromNode: edge.fromNode,
      toNode: edge.toNode,
      edgeCategory: 'PLANNING_REMOTE_CARGO',
    }));

  const totalMiles = Math.round(edges.reduce((s, e) => s + (e.distanceMiles || 0), 0));

  return {
    edges,
    paths,
    metrics: {
      remoteBranchLines: edges.length,
      resourceCargoBranchMiles: totalMiles,
      avgBranchDistance: edges.length ? Math.round(totalMiles / edges.length) : 0,
    },
  };
}
