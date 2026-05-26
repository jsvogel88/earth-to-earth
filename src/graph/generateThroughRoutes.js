/**
 * Through-route generation — only imported by buildPlanetaryHyperloopGraph.js.
 */

import { getFeederCitiesForHub } from '../data/regionalFeederCities.js';
import { normalizeCityKey } from '../data/hyperloopPhase1Cities.js';
import { networkCityId } from '../data/worldCities.js';
import { HYPERLOOP_ROUTE_CLASSES } from '../data/hyperloopRouteClasses.js';
import { detectWaterCrossing } from '../utils/generateHyperloopGraph.js';
import { enrichEdgeConstruction } from '../utils/applyEdgeConstruction.js';
import { DEFAULT_CONSTRUCTION } from '../data/constructionTypes.js';
import {
  THROUGH_ROUTE_LIMITS,
  THROUGH_CONTINENT_BRIDGES,
} from '../data/throughRouteConfig.js';
import { haversineDistanceMiles, hasCoordinates } from '../data/phase1GlobalHyperloopGraph.js';

const L = THROUGH_ROUTE_LIMITS;

function continentsCompatible(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  return THROUGH_CONTINENT_BRIDGES.has(`${a}|${b}`);
}

function hubNodeTypeScore(node) {
  let s = 0;
  if (node.isSwitchNode) s += 5;
  if (node.tier === 1) s += 3;
  if (node.tier === 2) s += 2;
  const nt = node.nodeType || '';
  if (nt.includes('SWITCH') || nt.includes('HYPERLOOP_HUB')) s += 4;
  if (node.primaryCorridor || node.corridors?.length) s += 2;
  if (node.connectedToTrunk) s += 1;
  return s;
}

function collectNetworkMembers(hub, allNodes) {
  const members = new Map();

  const add = (node, distFromHub) => {
    if (!node?.id || !hasCoordinates(node)) return;
    if (node.name === hub.name) return;
    if (distFromHub > L.hyperloopRadiusMiles) return;
    const existing = members.get(node.id);
    if (!existing || distFromHub < existing.distFromHub) {
      members.set(node.id, { node, distFromHub });
    }
  };

  getFeederCitiesForHub(hub.name, {}).forEach((city) => {
    const match = allNodes.find(
      (n) => normalizeCityKey(n.name) === normalizeCityKey(city.name)
    );
    if (match) {
      add(match, haversineDistanceMiles(hub.lat, hub.lon, match.lat, match.lon));
    } else if (hasCoordinates(city)) {
      add(
        {
          id: networkCityId(city.name, city.country || hub.country),
          name: city.name,
          country: city.country,
          lat: city.lat,
          lon: city.lon,
          continent: hub.continent,
          isSwitchNode: false,
          tier: 3,
        },
        haversineDistanceMiles(hub.lat, hub.lon, city.lat, city.lon)
      );
    }
  });

  allNodes.forEach((node) => {
    const d = haversineDistanceMiles(hub.lat, hub.lon, node.lat, node.lon);
    add(node, d);
  });

  return [...members.values()];
}

function identifyEdgeNodes(networkMembers) {
  return networkMembers
    .map(({ node, distFromHub }) => {
      let score = hubNodeTypeScore(node);
      if (distFromHub >= L.edgeBandMinMiles && distFromHub <= L.edgeBandMaxMiles) {
        score += 10;
      } else if (distFromHub >= L.edgeCandidateMinMiles && distFromHub < L.edgeBandMinMiles) {
        score += 4;
      } else {
        score -= 4;
      }
      score += (distFromHub / L.hyperloopRadiusMiles) * 4;
      return { node, distFromHub, score };
    })
    .filter(({ distFromHub }) => distFromHub >= L.edgeCandidateMinMiles)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function computeThroughRouteScore(hubA, hubB, edgeA, edgeB, connectorDist, hubDist) {
  const straightness =
    hubDist > 0 ? 1 - Math.min(1, Math.abs(connectorDist - hubDist * 0.65) / hubDist) : 0;

  return (
    edgeA.score +
    edgeB.score +
    straightness * 12 +
    (edgeA.node.isSwitchNode && edgeB.node.isSwitchNode ? 10 : 0) +
    Math.max(0, 900 - connectorDist) / 15 +
    15 -
    (connectorDist > 1000 ? (connectorDist - 1000) / 8 : 0)
  );
}

export function makeThroughEdge(fromNode, toNode, hubA, hubB, options = {}) {
  if (!hasCoordinates(fromNode) || !hasCoordinates(toNode)) return null;
  if (fromNode.id === toNode.id) return null;

  const distanceMiles = haversineDistanceMiles(
    fromNode.lat,
    fromNode.lon,
    toNode.lat,
    toNode.lon
  );

  const waterCheck = detectWaterCrossing(
    { lat: fromNode.lat, lon: fromNode.lon, continent: fromNode.continent },
    { lat: toNode.lat, lon: toNode.lon, continent: toNode.continent }
  );
  if (waterCheck.blocked && !options.specialCrossing) return null;

  const corridor =
    options.corridor || `${hubA.name} ↔ ${hubB.name} Through Route`;

  const edge = {
    id: `${fromNode.id}-${toNode.id}-through-route`,
    from: fromNode.id,
    to: toNode.id,
    fromNode,
    toNode,
    mode: 'HYPERLOOP',
    edgeType: 'THROUGH_ROUTE',
    routeClass: HYPERLOOP_ROUTE_CLASSES.THROUGH_ROUTE,
    corridor,
    connectsNetworks: [hubA.name, hubB.name],
    distanceMiles,
    supportsPodSplitOff: true,
    requiresStop: false,
    isThroughCorridor: true,
    isInterNetworkConnector: true,
    isSplitOff: false,
    tunnelRequired: false,
    tunnelType: null,
    constructionType: DEFAULT_CONSTRUCTION.constructionType,
    waterCrossing: waterCheck.blocked,
    specialCrossing: options.specialCrossing || false,
    constructionDifficulty: DEFAULT_CONSTRUCTION.constructionDifficulty,
    constructionNotes: null,
    renderable: true,
    edgeCategory: 'THROUGH_ROUTE',
    throughRouteScore: options.throughRouteScore ?? null,
  };

  return enrichEdgeConstruction(edge);
}

function throughPairKey(hubA, hubB) {
  return [hubA.name, hubB.name].sort().join('|');
}

export function generateThroughRoutes(e2eHubs, phase1Nodes, _feederByHub, options = {}) {
  const hubs = (e2eHubs || []).filter(hasCoordinates);
  const allNodes = phase1Nodes || [];
  const hasDirectEdge = options.hasDirectEdge || (() => false);
  const maxPerHub = options.maxPerHub ?? L.maxThroughRoutesPerHub;

  const networks = hubs.map((hub) => ({
    hub,
    members: collectNetworkMembers(hub, allNodes),
    edgeNodes: [],
  }));

  networks.forEach((net) => {
    net.edgeNodes = identifyEdgeNodes(net.members);
  });

  const throughCountByHub = new Map();
  const addedPairs = new Set();
  const edges = [];
  const candidateRoutes = [];

  for (let i = 0; i < networks.length; i += 1) {
    for (let j = i + 1; j < networks.length; j += 1) {
      const netA = networks[i];
      const netB = networks[j];
      const hubA = netA.hub;
      const hubB = netB.hub;

      if (hubA.name === hubB.name) continue;
      if (!continentsCompatible(hubA.continent, hubB.continent)) continue;

      const pairKey = throughPairKey(hubA, hubB);
      if (addedPairs.has(pairKey)) continue;

      const hubDist = haversineDistanceMiles(hubA.lat, hubA.lon, hubB.lat, hubB.lon);
      if (hubDist < L.minHubSeparationMiles || hubDist > L.maxHubSeparationMiles) continue;

      if (!netA.edgeNodes.length || !netB.edgeNodes.length) continue;

      let best = null;
      netA.edgeNodes.forEach((edgeA) => {
        netB.edgeNodes.forEach((edgeB) => {
          const connectorDist = haversineDistanceMiles(
            edgeA.node.lat,
            edgeA.node.lon,
            edgeB.node.lat,
            edgeB.node.lon
          );
          if (connectorDist < L.minConnectorMiles || connectorDist > L.maxConnectorMiles) {
            return;
          }
          if (hasDirectEdge(edgeA.node.id, edgeB.node.id)) return;

          const score = computeThroughRouteScore(
            hubA,
            hubB,
            edgeA,
            edgeB,
            connectorDist,
            hubDist
          );
          if (!best || score > best.score) {
            best = { edgeA, edgeB, connectorDist, score, hubA, hubB };
          }
        });
      });

      if (!best || best.score < L.minRouteScore) continue;

      candidateRoutes.push(best);
    }
  }

  candidateRoutes.sort((a, b) => b.score - a.score);

  candidateRoutes.forEach((pick) => {
    const { hubA, hubB, edgeA, edgeB, score } = pick;
    const countA = throughCountByHub.get(hubA.name) || 0;
    const countB = throughCountByHub.get(hubB.name) || 0;
    if (countA >= maxPerHub || countB >= maxPerHub) return;

    const pairKey = throughPairKey(hubA, hubB);
    if (addedPairs.has(pairKey)) return;
    if (hasDirectEdge(edgeA.node.id, edgeB.node.id)) return;

    const edge = makeThroughEdge(edgeA.node, edgeB.node, hubA, hubB, {
      corridor: `${edgeA.node.name} ↔ ${edgeB.node.name} (${hubA.name}–${hubB.name} Through)`,
      throughRouteScore: score,
    });
    if (!edge) return;

    addedPairs.add(pairKey);
    throughCountByHub.set(hubA.name, countA + 1);
    throughCountByHub.set(hubB.name, countB + 1);
    edges.push(edge);
  });

  const connectedNetworkPairs = new Set(
    edges.map((e) =>
      throughPairKey({ name: e.connectsNetworks[0] }, { name: e.connectsNetworks[1] })
    )
  );

  return {
    edges,
    throughRouteCount: edges.length,
    throughRouteMiles: Math.round(edges.reduce((s, e) => s + e.distanceMiles, 0)),
    connectedFeederNetworks: connectedNetworkPairs.size,
    networks: networks.map((n) => ({
      hub: n.hub.name,
      memberCount: n.members.length,
      edgeNodeCount: n.edgeNodes.length,
      edgeCities: n.edgeNodes.map((e) => e.node.name),
    })),
  };
}
