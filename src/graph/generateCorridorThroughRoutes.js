/**
 * Through-routes along explicit trunk corridors (shared infrastructure visibility).
 */

import { allInfrastructureTrunks } from '../data/planetaryInfrastructureTrunks.js';
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

function hasThroughPair(edges, fromId, toId) {
  return edges.some(
    (e) =>
      pairKey(e.from, e.to) === pairKey(fromId, toId) &&
      (e.edgeCategory === 'THROUGH_ROUTE' || e.routeClass === 'THROUGH_ROUTE')
  );
}

export function generateCorridorThroughRoutes({
  hubs = [],
  nodes = [],
  edges = [],
  edgeMap,
}) {
  const roiHubNames = new Set(hubs.map((h) => normalizeCityKey(h.name)));
  const coordRegistry = buildPhase1CoordinateRegistry(hubs);
  const index = buildCanonicalNodeIndex(nodes);
  let edgesAdded = 0;
  let corridorMiles = 0;

  const resolveNode = (name) => {
    const key = normalizeCityKey(name);
    return (
      index.byNameKey.get(key) ||
      resolveCanonicalGraphNode({ cityName: name, coordRegistry, index, roiHubNames })
    );
  };

  allInfrastructureTrunks.forEach((trunk) => {
    const seq = trunk.nodes;
    for (let i = 0; i < seq.length - 1; i += 1) {
      const fromNode = resolveNode(seq[i]);
      const toNode = resolveNode(seq[i + 1]);
      if (!fromNode || !toNode || fromNode.id === toNode.id) continue;
      if (hasThroughPair(edges, fromNode.id, toNode.id)) continue;

      const dist = haversineDistanceMiles(
        fromNode.lat,
        fromNode.lon,
        toNode.lat,
        toNode.lon
      );

      const edge = makeEdge(fromNode, toNode, {
        edgeType: 'THROUGH_ROUTE',
        routeClass: HYPERLOOP_ROUTE_CLASSES.THROUGH_ROUTE,
        corridor: `Through: ${trunk.corridor}`,
        edgeCategory: 'THROUGH_ROUTE',
        generatedBy: 'corridor_through_route',
        isThroughCorridor: true,
        infrastructureTier: trunk.tier === 'PLANETARY' ? 1 : 2,
        passengerPriority: true,
      });

      if (!edge) continue;
      const before = edges.length;
      addEdgeUnique(edges, edgeMap, edge);
      if (edges.length > before) {
        edgesAdded += 1;
        corridorMiles += dist;
      }
    }
  });

  return {
    edgesAdded,
    throughRouteMiles: Math.round(corridorMiles),
  };
}
