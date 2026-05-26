/**
 * Apply explicit Tier 1 / Tier 2 trunk corridors — buildPlanetaryHyperloopGraph only.
 */

import {
  allInfrastructureTrunks,
} from '../data/planetaryInfrastructureTrunks.js';
import {
  buildPhase1CoordinateRegistry,
  normalizeCityKey,
} from '../data/hyperloopPhase1Cities.js';
import {
  addEdgeUnique,
  makeEdge,
  haversineDistanceMiles,
} from '../data/phase1GlobalHyperloopGraph.js';
import { HYPERLOOP_ROUTE_CLASSES } from '../data/hyperloopRouteClasses.js';
import {
  buildCanonicalNodeIndex,
  resolveCanonicalGraphNode,
} from './canonicalNodeResolution.js';

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

function hasPair(edges, fromId, toId) {
  const key = pairKey(fromId, toId);
  return edges.some((e) => pairKey(e.from, e.to) === key);
}

export function applyInfrastructureTrunks({
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
  let trunkMiles = 0;
  const corridors = [];

  const ensureNode = (cityName) => {
    const key = normalizeCityKey(cityName);
    const existing = index.byNameKey.get(key);
    if (existing) return existing;
    const node = resolveCanonicalGraphNode({
      cityName,
      coordRegistry,
      index,
      roiHubNames,
      defaults: { connectedToTrunk: true, allowsSplitOff: true },
    });
    if (!node) return null;
    if (!index.byId.has(node.id)) {
      index.byId.set(node.id, node);
      index.byNameKey.set(key, node);
      newNodes.push(node);
    }
    return node;
  };

  allInfrastructureTrunks.forEach((trunkDef) => {
    const sequence = trunkDef.nodes;
    let corridorAdded = 0;
    const tier = trunkDef.tier;
    const edgeCategory =
      tier === 'PLANETARY' ? 'PLANETARY_TRUNK' : 'REGIONAL_TRUNK';

    for (let i = 0; i < sequence.length - 1; i += 1) {
      const fromNode = ensureNode(sequence[i]);
      const toNode = ensureNode(sequence[i + 1]);
      if (!fromNode || !toNode || fromNode.id === toNode.id) continue;
      if (hasPair(edges, fromNode.id, toNode.id)) continue;

      const dist = haversineDistanceMiles(
        fromNode.lat,
        fromNode.lon,
        toNode.lat,
        toNode.lon
      );

      const edge = makeEdge(fromNode, toNode, {
        edgeType: 'HYPERLOOP_TRUNK_LINE',
        routeClass:
          trunkDef.routeClass ||
          (tier === 'PLANETARY'
            ? HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE
            : HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP),
        corridor: trunkDef.corridor,
        edgeCategory,
        infrastructureTier: tier === 'PLANETARY' ? 1 : 2,
        generatedBy: 'infrastructure_trunk',
        isThroughCorridor: true,
        passengerPriority: true,
        specialCrossing: trunkDef.specialCrossing === true,
        tunnelRequired: trunkDef.tunnelRequired === true,
      });

      if (!edge) continue;
      const before = edges.length;
      addEdgeUnique(edges, edgeMap, edge);
      if (edges.length > before) {
        edgesAdded += 1;
        corridorAdded += 1;
        trunkMiles += dist;
      }
    }

    if (corridorAdded > 0) corridors.push(trunkDef.corridor);
  });

  return {
    edgesAdded,
    nodesAdded: newNodes.length,
    trunkMiles: Math.round(trunkMiles),
    corridors,
    newNodes,
  };
}
