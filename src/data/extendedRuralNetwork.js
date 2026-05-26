/**
 * Extended Rural + Remote Cargo Network — Phase 3 layer.
 * Remote node → branch → nearest switch/trunk (not direct to every E2E hub).
 *
 * RemoteCargoRoutePriority =
 *   0.35 * resourceStrategicValue
 * + 0.25 * cargoVolumePotential
 * + 0.15 * portConnectivity
 * + 0.15 * supplyChainSecurity
 * + 0.10 * regionalAccessValue
 * - constructionDifficultyPenalty
 *
 * Passenger rural branches are shorter and more selective.
 * Cargo/resource routes can be longer when strategic value is high.
 */

import { detectWaterCrossing } from '../utils/generateHyperloopGraph.js';
import { enrichEdgeConstruction } from '../utils/applyEdgeConstruction.js';
import { DEFAULT_CONSTRUCTION } from './constructionTypes.js';
import { HYPERLOOP_ROUTE_CLASSES } from './hyperloopRouteClasses.js';
import {
  buildRemoteCargoResourceNodes,
  REMOTE_NODE_TYPES,
} from './remoteCargoResourceNodes.js';

export const EXTENDED_RURAL_LAYER_LABEL = 'Extended Rural + Remote Cargo';

export const RURAL_BRANCH_MAX_MILES = 250;
export const RESOURCE_BRANCH_MAX_MILES = 700;
export const ARCTIC_LOGISTICS_BRANCH_MAX_MILES = 900;
export const REMOTE_VISIBLE_MIN_ZOOM = 7;
export const REMOTE_CARGO_VISIBLE_MIN_ZOOM = 6.5;

export const REMOTE_EDGE_TYPES = {
  RURAL_BRANCH_LINE: 'RURAL_BRANCH_LINE',
  REMOTE_CARGO_CONNECTOR: 'REMOTE_CARGO_CONNECTOR',
  RESOURCE_CARGO_BRANCH: 'RESOURCE_CARGO_BRANCH',
  CRITICAL_MINERALS_BRANCH: 'CRITICAL_MINERALS_BRANCH',
  RARE_EARTH_BRANCH: 'RARE_EARTH_BRANCH',
  ARCTIC_LOGISTICS_BRANCH: 'ARCTIC_LOGISTICS_BRANCH',
  RIVER_PORT_CONNECTOR: 'RIVER_PORT_CONNECTOR',
  DESERT_LOGISTICS_CONNECTOR: 'DESERT_LOGISTICS_CONNECTOR',
  OUTBACK_RESOURCE_CONNECTOR: 'OUTBACK_RESOURCE_CONNECTOR',
  ISLAND_ACCESS_CONNECTOR: 'ISLAND_ACCESS_CONNECTOR',
};

function hasCoordinates(node) {
  return (
    node &&
    typeof node.lat === 'number' &&
    typeof node.lon === 'number' &&
    Number.isFinite(node.lat) &&
    Number.isFinite(node.lon)
  );
}

function haversineDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function constructionPenalty(difficulty) {
  switch (difficulty) {
    case 'EXTREME':
      return 35;
    case 'HIGH':
      return 20;
    case 'MEDIUM':
      return 8;
    default:
      return 0;
  }
}

/**
 * RemoteCargoRoutePriority heuristic for connector selection.
 */
export function computeRemoteCargoRoutePriority(remoteNode, anchor, distanceMiles) {
  const resourceStrategic =
    remoteNode.nodeType === REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE
      ? 90
      : remoteNode.nodeType === REMOTE_NODE_TYPES.RARE_EARTH_NODE
        ? 85
        : remoteNode.nodeType === REMOTE_NODE_TYPES.MINING_RESOURCE_NODE
          ? 75
          : remoteNode.cargoPriority
            ? 55
            : 25;

  const cargoVolume = remoteNode.cargoPriority ? 70 : 20;
  const portConnectivity = remoteNode.nodeType.includes('PORT') ? 80 : 40;
  const supplyChain = remoteNode.resourceTypes?.length ? 75 : 35;
  const regionalAccess = remoteNode.passengerPriority ? 50 : 30;

  const maxRadius = getMaxBranchMiles(remoteNode);
  const distancePenalty = (distanceMiles / maxRadius) * 25;

  return (
    0.35 * resourceStrategic +
    0.25 * cargoVolume +
    0.15 * portConnectivity +
    0.15 * supplyChain +
    0.1 * regionalAccess -
    constructionPenalty(remoteNode.constructionDifficulty) -
    distancePenalty -
    (anchor.isE2EHub ? 15 : 0)
  );
}

export function getMaxBranchMiles(remoteNode) {
  if (
    remoteNode.nodeType === REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE ||
    remoteNode.nodeType === REMOTE_NODE_TYPES.RARE_EARTH_NODE ||
    remoteNode.nodeType === REMOTE_NODE_TYPES.MINING_RESOURCE_NODE
  ) {
    return RESOURCE_BRANCH_MAX_MILES;
  }
  if (
    remoteNode.nodeType === REMOTE_NODE_TYPES.ARCTIC_PORT_NODE ||
    remoteNode.regionType?.includes('Arctic') ||
    remoteNode.regionType?.includes('Siberia')
  ) {
    return ARCTIC_LOGISTICS_BRANCH_MAX_MILES;
  }
  if (remoteNode.cargoPriority) {
    return RESOURCE_BRANCH_MAX_MILES * 0.75;
  }
  return RURAL_BRANCH_MAX_MILES;
}

function classifyRemoteRoute(remoteNode) {
  switch (remoteNode.nodeType) {
    case REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE:
      return {
        routeClass: HYPERLOOP_ROUTE_CLASSES.CRITICAL_MINERALS,
        edgeType: REMOTE_EDGE_TYPES.CRITICAL_MINERALS_BRANCH,
      };
    case REMOTE_NODE_TYPES.RARE_EARTH_NODE:
      return {
        routeClass: HYPERLOOP_ROUTE_CLASSES.RARE_EARTH_RESOURCE,
        edgeType: REMOTE_EDGE_TYPES.RARE_EARTH_BRANCH,
      };
    case REMOTE_NODE_TYPES.ARCTIC_PORT_NODE:
      return {
        routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
        edgeType: REMOTE_EDGE_TYPES.ARCTIC_LOGISTICS_BRANCH,
      };
    case REMOTE_NODE_TYPES.RIVER_PORT_NODE:
      return {
        routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
        edgeType: REMOTE_EDGE_TYPES.RIVER_PORT_CONNECTOR,
      };
    case REMOTE_NODE_TYPES.DESERT_LOGISTICS_NODE:
      return {
        routeClass: HYPERLOOP_ROUTE_CLASSES.RESOURCE_CORRIDOR,
        edgeType: REMOTE_EDGE_TYPES.DESERT_LOGISTICS_CONNECTOR,
      };
    case REMOTE_NODE_TYPES.OUTBACK_RESOURCE_NODE:
    case REMOTE_NODE_TYPES.MINING_RESOURCE_NODE:
      return {
        routeClass: HYPERLOOP_ROUTE_CLASSES.RESOURCE_CORRIDOR,
        edgeType: REMOTE_EDGE_TYPES.OUTBACK_RESOURCE_CONNECTOR,
      };
    case REMOTE_NODE_TYPES.ISLAND_ACCESS_NODE:
      return {
        routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
        edgeType: REMOTE_EDGE_TYPES.ISLAND_ACCESS_CONNECTOR,
      };
    default:
      return remoteNode.cargoPriority
        ? {
            routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
            edgeType: REMOTE_EDGE_TYPES.REMOTE_CARGO_CONNECTOR,
          }
        : {
            routeClass: HYPERLOOP_ROUTE_CLASSES.RURAL_NETWORK,
            edgeType: REMOTE_EDGE_TYPES.RURAL_BRANCH_LINE,
          };
  }
}

function anchorScore(anchor, remoteNode, distanceMiles) {
  let score = computeRemoteCargoRoutePriority(remoteNode, anchor, distanceMiles);
  if (anchor.isSwitchNode) score += 12;
  if (anchor.connectedToTrunk) score += 6;
  if (anchor.tier === 1) score += 4;
  if (anchor.tier === 2) score += 6;
  if (anchor.isE2EHub) score -= 18;
  return score;
}

function makeRuralEdge(remoteNode, anchor, distanceMiles) {
  const { routeClass, edgeType } = classifyRemoteRoute(remoteNode);
  const isIsland = remoteNode.nodeType === REMOTE_NODE_TYPES.ISLAND_ACCESS_NODE;

  const waterCheck = detectWaterCrossing(
    { lat: remoteNode.lat, lon: remoteNode.lon, continent: remoteNode.continent },
    { lat: anchor.lat, lon: anchor.lon, continent: anchor.continent }
  );

  if (waterCheck.blocked && !isIsland && !remoteNode.specialCrossing) {
    return null;
  }

  const tunnelRequired =
    remoteNode.tunnelRequired || (waterCheck.blocked && isIsland);

  const finalRouteClass = tunnelRequired
    ? HYPERLOOP_ROUTE_CLASSES.TUNNEL_REQUIRED
    : routeClass;

  const edge = {
    id: `${remoteNode.id}-${anchor.id}-rural-branch`,
    from: remoteNode.id,
    to: anchor.id,
    fromNode: remoteNode,
    toNode: anchor,
    mode: 'HYPERLOOP',
    edgeType,
    routeClass: finalRouteClass,
    distanceMiles,
    supportsPodSplitOff: true,
    requiresStop: false,
    isThroughCorridor: false,
    ruralAccess: true,
    cargoPriority: remoteNode.cargoPriority,
    passengerPriority: remoteNode.passengerPriority,
    resourceTypes: remoteNode.resourceTypes,
    constructionJustification: remoteNode.accessPurpose?.[0] || 'rural_access',
    constructionType: DEFAULT_CONSTRUCTION.constructionType,
    constructionDifficulty: remoteNode.constructionDifficulty || DEFAULT_CONSTRUCTION.constructionDifficulty,
    constructionNotes: null,
    tunnelRequired,
    tunnelType: null,
    waterCrossing: waterCheck.blocked,
    visibleMinZoom: remoteNode.visibleMinZoom || REMOTE_VISIBLE_MIN_ZOOM,
    renderable: true,
    edgeCategory: 'EXTENDED_RURAL',
  };

  return enrichEdgeConstruction(edge);
}

function toDeckPath(edge) {
  return {
    id: edge.id,
    path: [
      [edge.fromNode.lon, edge.fromNode.lat],
      [edge.toNode.lon, edge.toNode.lat],
    ],
    edgeType: edge.edgeType,
    routeClass: edge.routeClass,
    distanceMiles: edge.distanceMiles,
    tunnelRequired: edge.tunnelRequired,
    tunnelType: edge.tunnelType,
    constructionType: edge.constructionType,
    constructionDifficulty: edge.constructionDifficulty,
    constructionNotes: edge.constructionNotes,
    cargoPriority: edge.cargoPriority,
    visibleMinZoom: edge.visibleMinZoom,
    renderable: edge.renderable,
    fromName: edge.fromNode.name,
    toName: edge.toNode.name,
  };
}

/**
 * Connect renderable remote nodes to nearest Hyperloop switch/trunk anchors.
 */
export function generateExtendedRuralEdges(remoteNodes, globalHyperloopNodes) {
  const anchors = (globalHyperloopNodes || []).filter(
    (n) =>
      hasCoordinates(n) &&
      (n.isSwitchNode || n.connectedToTrunk || n.tier <= 2 || n.isE2EHub)
  );

  const renderableRemote = (remoteNodes || []).filter((n) => n.renderable && hasCoordinates(n));
  const edges = [];
  const edgeDedupe = new Set();

  renderableRemote.forEach((remote) => {
    const maxRadius = getMaxBranchMiles(remote);
    const candidates = anchors
      .filter((a) => a.id !== remote.id && a.name !== remote.name)
      .map((anchor) => {
        const dist = haversineDistanceMiles(
          remote.lat,
          remote.lon,
          anchor.lat,
          anchor.lon
        );
        return { anchor, dist, score: anchorScore(anchor, remote, dist) };
      })
      .filter((c) => c.dist > 5 && c.dist <= maxRadius)
      .sort((a, b) => b.score - a.score);

    if (!candidates.length) return;

    const primary = candidates[0];
    const primaryKey = [remote.id, primary.anchor.id].sort().join('|');
    if (!edgeDedupe.has(primaryKey)) {
      const edge = makeRuralEdge(remote, primary.anchor, primary.dist);
      if (edge) {
        edgeDedupe.add(primaryKey);
        edges.push(edge);
        remote.nearestHyperloopNode = primary.anchor.name;
        remote.nearestSwitchNode = primary.anchor.isSwitchNode
          ? primary.anchor.name
          : remote.nearestSwitchNode;
      }
    }

    if (candidates.length > 1 && remote.cargoPriority) {
      const secondary = candidates.find(
        (c) =>
          c.anchor.id !== primary.anchor.id &&
          c.score > primary.score * 0.72 &&
          c.dist <= maxRadius * 0.85
      );
      if (secondary) {
        const secKey = [remote.id, secondary.anchor.id].sort().join('|');
        if (!edgeDedupe.has(secKey)) {
          const edge = makeRuralEdge(remote, secondary.anchor, secondary.dist);
          if (edge) {
            edgeDedupe.add(secKey);
            edges.push(edge);
          }
        }
      }
    }
  });

  return edges;
}

/**
 * Build full Extended Rural layer (nodes + edges + metrics) separate from main web graph.
 */
export function buildExtendedRuralNetwork(globalHyperloopNodes = []) {
  const allNodes = buildRemoteCargoResourceNodes();
  const renderableNodes = allNodes.filter((n) => n.renderable);
  const edges = generateExtendedRuralEdges(renderableNodes, globalHyperloopNodes);
  const paths = edges.map(toDeckPath);

  const totalMiles = Math.round(edges.reduce((s, e) => s + e.distanceMiles, 0));
  const avgDist = edges.length ? Math.round(totalMiles / edges.length) : 0;

  const metrics = {
    totalSeedNodes: allNodes.length,
    renderableNodes: renderableNodes.length,
    needsCoordinates: allNodes.filter((n) => n.needsCoordinates).length,
    remoteNodes: renderableNodes.length,
    ruralAccessNodes: renderableNodes.filter((n) => n.passengerPriority).length,
    remoteCargoNodes: renderableNodes.filter((n) => n.cargoPriority).length,
    criticalMineralsNodes: renderableNodes.filter(
      (n) => n.nodeType === REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE
    ).length,
    rareEarthNodes: renderableNodes.filter(
      (n) => n.nodeType === REMOTE_NODE_TYPES.RARE_EARTH_NODE
    ).length,
    remoteBranchLines: edges.length,
    resourceCargoBranchMiles: totalMiles,
    avgBranchDistance: avgDist,
  };

  return {
    nodes: allNodes,
    renderableNodes,
    edges,
    paths,
    metrics,
  };
}
