import { findConnectedComponents } from '../../graph/graphConnectivityAudit.js';

export function edgeId(edge) {
  if (edge.id) return String(edge.id);
  return `${edge.from}->${edge.to}:${edge.edgeType || edge.edgeCategory || 'edge'}`;
}

export function nodeIdSet(nodes) {
  return new Set((nodes || []).map((n) => n.id).filter(Boolean));
}

export function findDuplicateIds(items, idFn) {
  const seen = new Map();
  const dupes = [];
  (items || []).forEach((item) => {
    const id = idFn(item);
    if (!id) return;
    if (seen.has(id)) dupes.push(id);
    else seen.set(id, true);
  });
  return [...new Set(dupes)];
}

export function findOrphanEdges(nodes, edges) {
  const ids = nodeIdSet(nodes);
  return (edges || []).filter((e) => !ids.has(e.from) || !ids.has(e.to));
}

export function largestConnectedComponentSize(nodes, edges) {
  const ids = (nodes || []).map((n) => n.id).filter(Boolean);
  const components = findConnectedComponents(ids, edges);
  return components[0]?.length ?? 0;
}

export function assertGraphIntegrity(graph, { allowOrphanPlanningNodes = true } = {}) {
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];
  const dupNodes = findDuplicateIds(nodes, (n) => n.id);
  const dupEdges = findDuplicateIds(edges, edgeId);
  const orphans = findOrphanEdges(nodes, edges);

  if (dupNodes.length) {
    throw new Error(`Duplicate node IDs: ${dupNodes.slice(0, 5).join(', ')}`);
  }
  if (dupEdges.length) {
    throw new Error(`Duplicate edge IDs: ${dupEdges.slice(0, 5).join(', ')}`);
  }
  if (orphans.length) {
    throw new Error(`Orphan edges (${orphans.length}): ${edgeId(orphans[0])}`);
  }

  const lcc = largestConnectedComponentSize(nodes, edges);
  if (nodes.length > 0 && lcc === 0 && edges.length > 0) {
    throw new Error('Largest connected component is empty despite edges');
  }

  if (!allowOrphanPlanningNodes) {
    const connected = new Set();
    edges.forEach((e) => {
      connected.add(e.from);
      connected.add(e.to);
    });
    const isolated = nodes.filter(
      (n) => !connected.has(n.id) && !n.futureOnly && !n.planningOverlay
    );
    if (isolated.length) {
      throw new Error(`Unexpected isolated nodes: ${isolated.length}`);
    }
  }

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    pathCount: (graph.paths || []).length,
    largestComponentSize: lcc,
    connectivity: graph.connectivity ?? graph.metrics?.connectivity ?? null,
  };
}

export function cloneGraphSnapshot(graph) {
  return {
    nodeIds: (graph.nodes || []).map((n) => n.id),
    edgeKeys: (graph.edges || []).map(edgeId),
    pathCount: (graph.paths || []).length,
  };
}
