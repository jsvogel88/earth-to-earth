/**
 * Bucket visible edges into deck.gl render groups (arcs, paths, local zones).
 */

import { classifyRouteFamily } from './classifyRouteFamily.js';
import { getCorridorMetadata } from '../data/corridorRouteRegistry.js';
import { classifyE2MSubFamily, E2E_BASE_STYLE } from '../map/visualHierarchy.js';
import { isHyperloopOceanCrossing } from './hyperloopGeometry.js';

/**
 * @param {object} fromNode
 * @param {object} toNode
 * @param {object} edge
 */
function shouldSkipGroundSegment(fromNode, toNode, edge) {
  return isHyperloopOceanCrossing(fromNode, toNode, edge);
}

/**
 * @param {object[]} visibleEdges
 * @param {object[]} visibleNodes
 * @param {Record<string, object>} nodesById
 */
export function createRenderBuckets(
  visibleEdges,
  visibleNodes,
  nodesById,
  edgeScoresById = null,
  edgeSimulationById = null
) {
  const arcs = [];
  const trunkPaths = [];
  const loopPaths = [];
  const feederPaths = [];
  const cargoArcs = [];
  const localZones = [];

  for (const edge of visibleEdges ?? []) {
    const family = classifyRouteFamily(edge);
    const fromNode = nodesById[edge.fromNodeId];
    const toNode = nodesById[edge.toNodeId];
    if (!fromNode || !toNode) continue;

    if (shouldSkipGroundSegment(fromNode, toNode, edge)) continue;

    const routeScore = edgeScoresById?.get?.(edge.id) ?? null;
    const sim = edgeSimulationById?.get?.(edge.id) ?? null;
    const corridorMeta = getCorridorMetadata(edge);
    const civ = routeScore?.civilizationImportance ?? corridorMeta.civilizationImportance ?? edge.economicWeight?.gdpGeometricMean ?? 0;
    const ew = edge.economicWeight?.gdpGeometricMean || civ || 0;
    let width = civ >= 75 ? 4.5 : civ >= 55 ? 3.5 : civ >= 35 ? 2.5 : civ >= 15 ? 2 : 1;
    let opacity = civ >= 75 ? 0.95 : civ >= 55 ? 0.82 : civ >= 35 ? 0.68 : civ >= 15 ? 0.52 : 0.38;
    if (sim) {
      width *= 1 + (sim.utilization ?? 0) / 200;
      opacity = Math.min(0.98, opacity * (1 + (sim.activeTraffic ?? 0) / 250));
      if (sim.congestion >= 70) opacity = Math.min(0.98, opacity * 1.08);
    }

    const base = {
      id: edge.id,
      from: [fromNode.longitude, fromNode.latitude],
      to: [toNode.longitude, toNode.latitude],
      fromName: fromNode.name,
      toName: toNode.name,
      mode: edge.mode,
      routeType: edge.routeType,
      corridorId: corridorMeta.corridorId,
      e2mSubFamily: family === 'E2M_CARGO' ? classifyE2MSubFamily(edge) : undefined,
      tier: edge.tier,
      distanceKm: edge.distanceKm,
      economicWeight: ew,
      civilizationImportance: civ,
      routeImportance: routeScore?.routeImportance,
      spinalTrunkClass: routeScore?.spinalTrunkClass,
      economicCorridorType: routeScore?.economicCorridorType,
      congestion: sim?.congestion,
      activeTraffic: sim?.activeTraffic,
      routeStress: sim?.routeStress,
      width,
      opacity,
    };

    switch (family) {
      case 'E2E_GLOBAL_ARC':
        arcs.push({
          ...base,
          sourcePosition: base.from,
          targetPosition: base.to,
          sourceColor: [...E2E_BASE_STYLE.color, Math.round(opacity * 255)],
          targetColor: [...E2E_BASE_STYLE.color, Math.round(opacity * 0.4 * 255)],
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
        cargoArcs.push({
          ...base,
          sourcePosition: base.from,
          targetPosition: base.to,
        });
        break;
      case 'ROBOTAXI_LOCAL':
        if (edge.distanceKm != null && edge.distanceKm <= 80) {
          localZones.push(base);
        }
        break;
      case 'MULTIMODAL_GROUND':
      case 'ENERGY_GRID':
        feederPaths.push({ ...base, width: Math.max(1, (base.width ?? 2) * 0.75) });
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
    cargoArcs,
    /** @deprecated use cargoArcs */
    cargoPaths: cargoArcs,
    localZones,
    tier1Nodes,
    tier2Nodes,
    tier3Nodes,
  };
}
