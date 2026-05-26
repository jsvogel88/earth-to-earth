/**
 * Apply planetary continental spine corridor chains — only called from buildPlanetaryHyperloopGraph.
 */

import {
  planetaryContinentalSpines,
  SPINE_CITY_ALIASES,
} from '../data/planetaryContinentalSpines.js';
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

function resolveSpineCityName(name) {
  const key = normalizeCityKey(name);
  return SPINE_CITY_ALIASES[key] || name;
}

function hasUndirectedPair(edges, fromId, toId) {
  return edges.some(
    (e) =>
      (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
  );
}

/**
 * @returns {{ edgesAdded: number, nodesAdded: number, spineMiles: number, corridors: string[], newNodes: object[] }}
 */
export function applyContinentalSpines({
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
  let spineMiles = 0;
  const corridors = [];

  const ensureNode = (cityName) => {
    const canonical = resolveSpineCityName(cityName);
    const existing =
      index.byNameKey.get(normalizeCityKey(canonical)) ||
      resolveCanonicalGraphNode({
        cityName: canonical,
        coordRegistry,
        index,
        roiHubNames,
        defaults: {
          connectedToTrunk: true,
          allowsSplitOff: true,
          nodeType: 'SPINE_CITY',
          primaryCorridor: 'Planetary Spine',
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

  planetaryContinentalSpines.forEach((corridorDef) => {
    const sequence = corridorDef.nodes;
    let corridorAdded = 0;

    for (let i = 0; i < sequence.length - 1; i += 1) {
      const fromNode = ensureNode(sequence[i]);
      const toNode = ensureNode(sequence[i + 1]);
      if (!fromNode || !toNode) continue;
      if (fromNode.id === toNode.id) continue;
      if (hasUndirectedPair(edges, fromNode.id, toNode.id)) continue;

      const dist = haversineDistanceMiles(
        fromNode.lat,
        fromNode.lon,
        toNode.lat,
        toNode.lon
      );

      const edge = makeEdge(fromNode, toNode, {
        edgeType: 'HYPERLOOP_TRUNK_LINE',
        routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
        corridor: corridorDef.corridor,
        edgeCategory: 'CONTINENTAL_SPINE',
        generatedBy: 'planetary_continental_spine',
        isThroughCorridor: true,
        passengerPriority: true,
        specialCrossing: corridorDef.specialCrossing === true,
        tunnelRequired: corridorDef.tunnelRequired === true,
      });

      if (!edge) continue;

      const before = edges.length;
      addEdgeUnique(edges, edgeMap, edge);
      if (edges.length > before) {
        edgesAdded += 1;
        corridorAdded += 1;
        spineMiles += dist;
      }
    }

    if (corridorAdded > 0) corridors.push(corridorDef.corridor);
  });

  return {
    edgesAdded,
    nodesAdded: newNodes.length,
    spineMiles: Math.round(spineMiles),
    corridors,
    newNodes,
  };
}
