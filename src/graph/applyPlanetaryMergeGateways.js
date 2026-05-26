/**
 * Apply targeted planetary merge gateway chains — only from buildPlanetaryHyperloopGraph.
 */

import {
  planetaryMergeGateways,
  MERGE_GATEWAY_ALIASES,
} from '../data/planetaryMergeGateways.js';
import {
  buildPhase1CoordinateRegistry,
  normalizeCityKey,
} from '../data/hyperloopPhase1Cities.js';
import {
  addEdgeUnique,
  makeEdge,
  haversineDistanceMiles,
} from '../data/phase1GlobalHyperloopGraph.js';
import {
  buildCanonicalNodeIndex,
  resolveCanonicalGraphNode,
} from './canonicalNodeResolution.js';

function resolveGatewayCityName(name) {
  const key = normalizeCityKey(name);
  return MERGE_GATEWAY_ALIASES[key] || name;
}

function hasGatewayPair(edges, fromId, toId) {
  return edges.some(
    (e) =>
      ((e.from === fromId && e.to === toId) ||
        (e.from === toId && e.to === fromId)) &&
      (e.edgeCategory === 'PLANETARY_GATEWAY' ||
        e.edgeType === 'PLANETARY_GATEWAY_ROUTE' ||
        e.isIntercontinentalGateway)
  );
}

/**
 * @returns {{ edgesAdded: number, nodesAdded: number, gatewayMiles: number, corridors: string[], newNodes: object[] }}
 */
export function applyPlanetaryMergeGateways({
  hubs = [],
  nodes = [],
  edges = [],
  edgeMap,
}) {
  const roiHubNames = new Set(hubs.map((h) => normalizeCityKey(h.name)));
  const coordRegistry = buildPhase1CoordinateRegistry(hubs);
  const index = buildCanonicalNodeIndex(nodes);
  const newNodes = [];
  let edgesAdded = 0;
  let gatewayMiles = 0;
  const corridors = [];

  const ensureNode = (cityName, defaults = {}) => {
    const canonical = resolveGatewayCityName(cityName);
    const existing =
      index.byNameKey.get(normalizeCityKey(canonical)) ||
      resolveCanonicalGraphNode({
        cityName: canonical,
        coordRegistry,
        index,
        roiHubNames,
        defaults: {
          isSwitchNode: true,
          connectedToTrunk: true,
          allowsSplitOff: true,
          nodeType: 'PLANETARY_GATEWAY_NODE',
          ...defaults,
        },
      });
    if (!existing) return null;
    const isE2E = roiHubNames.has(normalizeCityKey(existing.name));
    const node = {
      ...existing,
      id: existing.networkCityId || existing.id,
      networkCityId: existing.networkCityId || existing.id,
      tier: isE2E ? 0 : existing.tier ?? 2,
      isE2EHub: isE2E || existing.isE2EHub,
      isSwitchNode: true,
      connectedToTrunk: true,
      renderable: true,
    };
    if (!index.byId.has(node.id)) {
      index.byId.set(node.id, node);
      index.byNameKey.set(normalizeCityKey(node.name), node);
      newNodes.push(node);
    }
    return node;
  };

  planetaryMergeGateways.forEach((gatewayDef) => {
    const sequence = gatewayDef.nodes;
    let corridorAdded = 0;

    for (let i = 0; i < sequence.length - 1; i += 1) {
      const fromNode = ensureNode(sequence[i]);
      const toNode = ensureNode(sequence[i + 1]);
      if (!fromNode || !toNode) continue;
      if (fromNode.id === toNode.id) continue;
      if (hasGatewayPair(edges, fromNode.id, toNode.id)) continue;

      const dist = haversineDistanceMiles(
        fromNode.lat,
        fromNode.lon,
        toNode.lat,
        toNode.lon
      );

      const edge = makeEdge(fromNode, toNode, {
        edgeType: gatewayDef.edgeType || 'PLANETARY_GATEWAY_ROUTE',
        routeClass: gatewayDef.routeClass,
        corridor: gatewayDef.corridor,
        edgeCategory: 'PLANETARY_GATEWAY',
        generatedBy: 'planetary_merge_gateway',
        isThroughCorridor: true,
        passengerPriority: true,
        specialCrossing: gatewayDef.specialCrossing === true,
        tunnelRequired: gatewayDef.tunnelRequired === true,
        tunnelType: gatewayDef.tunnelType || null,
        isIntercontinentalGateway: gatewayDef.isIntercontinentalGateway !== false,
      });

      if (!edge) continue;

      const before = edges.length;
      addEdgeUnique(edges, edgeMap, edge);
      if (edges.length > before) {
        edgesAdded += 1;
        corridorAdded += 1;
        gatewayMiles += dist;
      }
    }

    if (corridorAdded > 0) corridors.push(gatewayDef.corridor);
  });

  return {
    edgesAdded,
    nodesAdded: newNodes.length,
    gatewayMiles: Math.round(gatewayMiles),
    corridors,
    newNodes,
  };
}
