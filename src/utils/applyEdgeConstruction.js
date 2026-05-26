import { classifyConstructionRequirement } from './classifyConstructionRequirement.js';

/** Merge construction classification onto an edge (mutates and returns edge). */
export function enrichEdgeConstruction(edge) {
  if (!edge) return edge;
  const classified = classifyConstructionRequirement(edge, edge.fromNode, edge.toNode);
  Object.assign(edge, classified);
  return edge;
}

export function enrichAllEdgeConstruction(edges) {
  return (edges || []).map((e) => enrichEdgeConstruction(e));
}
