/**
 * Shallow-freeze planetary graph outputs after build (prevents render-time mutation).
 */

function freezeArray(arr) {
  if (!Array.isArray(arr)) return arr;
  arr.forEach((item) => {
    if (item && typeof item === 'object') Object.freeze(item);
  });
  return Object.freeze(arr);
}

export function freezePlanetaryGraph(graph) {
  if (!graph || typeof graph !== 'object') return graph;

  freezeArray(graph.nodes);
  freezeArray(graph.edges);
  freezeArray(graph.paths);
  freezeArray(graph.switchNodes);
  freezeArray(graph.disconnectedNodes);
  freezeArray(graph.connectedComponents);

  if (graph.nodeById && typeof graph.nodeById === 'object') {
    Object.freeze(graph.nodeById);
    Object.values(graph.nodeById).forEach((n) => {
      if (n && typeof n === 'object') Object.freeze(n);
    });
  }

  Object.freeze(graph.metrics);
  Object.freeze(graph.webStats);
  Object.freeze(graph.stats);
  Object.freeze(graph.connectivity);
  return Object.freeze(graph);
}
