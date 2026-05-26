/**
 * Remove airline-style mesh edges — keep explicit trunk / gateway / corridor infrastructure.
 */

const MESH_EDGE_CATEGORIES = new Set([
  'E2E_FEEDER',
  'EXTENDED_TRUNK',
]);

const TRUNK_EDGE_CATEGORIES = new Set([
  'CONTINENTAL_SPINE',
  'PLANETARY_TRUNK',
  'REGIONAL_TRUNK',
  'CORRIDOR_CHAIN',
  'PLANETARY_GATEWAY',
  'INTERCONTINENTAL_GATEWAY',
  'THROUGH_ROUTE',
]);

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

function isTrunkEdge(edge) {
  if (TRUNK_EDGE_CATEGORIES.has(edge.edgeCategory)) return true;
  if (edge.edgeType === 'HYPERLOOP_TRUNK_LINE' && edge.isThroughCorridor) return true;
  if (edge.routeClass === 'CONTINENTAL_SPINE') return true;
  if (edge.isIntercontinentalGateway) return true;
  return false;
}

/**
 * @returns {{ edges: object[], removed: number, removedByCategory: Record<string, number> }}
 */
export function pruneMeshSpaghetti(edges = []) {
  const trunkPairs = new Set();
  edges.forEach((e) => {
    if (isTrunkEdge(e)) trunkPairs.add(pairKey(e.from, e.to));
  });

  const removedByCategory = {};
  const kept = [];

  edges.forEach((edge) => {
    let remove = false;

    if (MESH_EDGE_CATEGORIES.has(edge.edgeCategory)) {
      remove = true;
    }

    if (edge.edgeCategory === 'CROSSLINK' && trunkPairs.has(pairKey(edge.from, edge.to))) {
      remove = true;
    }

    if (
      edge.edgeType === 'EXTENDED_HYPERLOOP_LINE' &&
      edge.edgeCategory === 'EXTENDED_TRUNK'
    ) {
      remove = true;
    }

    if (remove) {
      const cat = edge.edgeCategory || edge.edgeType || 'unknown';
      removedByCategory[cat] = (removedByCategory[cat] || 0) + 1;
    } else {
      kept.push(edge);
    }
  });

  const removed = edges.length - kept.length;
  return { edges: kept, removed, removedByCategory };
}
