/**
 * Bucket visible edges into deck.gl render groups (arcs, paths, local zones).
 */

import { classifyRouteFamily } from './classifyRouteFamily.js';

/**
 * Hyperloop ground paths should not cross oceans unless intercontinental.
 * @param {object} fromNode
 * @param {object} toNode
 * @param {object} edge
 */
function isOceanCrossing(fromNode, toNode, edge) {
  if (edge.mode !== 'hyperloop') return false;
  if (edge.routeType === 'intercontinental_connector') return false;
  const distKm = edge.distanceKm || 0;
  const diffLon = Math.abs((fromNode.longitude || 0) - (toNode.longitude || 0));
  return distKm > 5000 && diffLon > 60;
}

/**
 * @param {object[]} visibleEdges
 * @param {object[]} visibleNodes
 * @param {Record<string, object>} nodesById
 */
export function createRenderBuckets(visibleEdges, visibleNodes, nodesById) {
  const arcs = [];
  const trunkPaths = [];
  const loopPaths = [];
  const feederPaths = [];
  const cargoPaths = [];
  const localZones = [];

  for (const edge of visibleEdges ?? []) {
    const family = classifyRouteFamily(edge);
    const fromNode = nodesById[edge.fromNodeId];
    const toNode = nodesById[edge.toNodeId];
    if (!fromNode || !toNode) continue;

    if (isOceanCrossing(fromNode, toNode, edge)) continue;

    const ew = edge.economicWeight?.gdpGeometricMean || 0;
    const width = ew >= 40 ? 4 : ew >= 15 ? 3 : ew >= 5 ? 2 : 1;
    const opacity = ew >= 40 ? 0.9 : ew >= 15 ? 0.7 : ew >= 5 ? 0.55 : 0.4;

    const base = {
      id: edge.id,
      from: [fromNode.longitude, fromNode.latitude],
      to: [toNode.longitude, toNode.latitude],
      fromName: fromNode.name,
      toName: toNode.name,
      mode: edge.mode,
      routeType: edge.routeType,
      tier: edge.tier,
      distanceKm: edge.distanceKm,
      economicWeight: ew,
      width,
      opacity,
    };

    switch (family) {
      case 'E2E_GLOBAL_ARC':
        arcs.push({
          ...base,
          sourcePosition: base.from,
          targetPosition: base.to,
          sourceColor: [255, 107, 53, Math.round(opacity * 255)],
          targetColor: [255, 107, 53, Math.round(opacity * 0.4 * 255)],
        });
        break;
      case 'CONTINENTAL_SPINE':
        trunkPaths.push(base);
        break;
      case 'REGIONAL_LOOP':
        loopPaths.push(base);
        break;
      case 'FEEDER_BRANCH':
        feederPaths.push(base);
        break;
      case 'E2M_CARGO':
        cargoPaths.push(base);
        break;
      case 'ROBOTAXI_LOCAL':
        if (edge.distanceKm != null && edge.distanceKm <= 80) {
          localZones.push(base);
        }
        break;
      default:
        break;
    }
  }

  const tier1Nodes = (visibleNodes ?? []).filter((n) => n.tier === 1);
  const tier2Nodes = (visibleNodes ?? []).filter((n) => n.tier === 2);
  const tier3Nodes = (visibleNodes ?? []).filter((n) => n.tier <= 3);

  return {
    arcs,
    trunkPaths,
    loopPaths,
    feederPaths,
    cargoPaths,
    localZones,
    tier1Nodes,
    tier2Nodes,
    tier3Nodes,
  };
}
