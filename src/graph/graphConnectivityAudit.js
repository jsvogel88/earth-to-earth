/**
 * Graph connectivity audit — read-only analysis, no route generation.
 */

import { hasCoordinates } from '../data/planningLayers.js';

export const CONNECTION_STATUS = {
  CONNECTED: 'CONNECTED',
  CONNECTED_VIA_BRANCH: 'CONNECTED_VIA_BRANCH',
  CONNECTED_VIA_TRUNK: 'CONNECTED_VIA_TRUNK',
  CONNECTED_VIA_THROUGH_ROUTE: 'CONNECTED_VIA_THROUGH_ROUTE',
  CONNECTED_VIA_GATEWAY: 'CONNECTED_VIA_GATEWAY',
  NEEDS_COORDINATES: 'NEEDS_COORDINATES',
  FUTURE_ONLY: 'FUTURE_ONLY',
  SPECIAL_CORRIDOR_REQUIRED: 'SPECIAL_CORRIDOR_REQUIRED',
  DISCONNECTED_REVIEW_NEEDED: 'DISCONNECTED_REVIEW_NEEDED',
};

export function buildAdjacencyFromEdges(edges) {
  const adj = new Map();
  (edges || []).forEach((e) => {
    if (!e.from || !e.to) return;
    if (!adj.has(e.from)) adj.set(e.from, new Set());
    if (!adj.has(e.to)) adj.set(e.to, new Set());
    adj.get(e.from).add(e.to);
    adj.get(e.to).add(e.to);
  });
  return adj;
}

export function findConnectedComponents(nodeIds, edges) {
  const adj = buildAdjacencyFromEdges(edges);
  const ids = [...nodeIds];
  const visited = new Set();
  const components = [];

  ids.forEach((startId) => {
    if (visited.has(startId)) return;
    const component = [];
    const queue = [startId];
    visited.add(startId);

    while (queue.length) {
      const cur = queue.shift();
      component.push(cur);
      const neighbors = adj.get(cur);
      if (!neighbors) continue;
      neighbors.forEach((n) => {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      });
    }
    components.push(component);
  });

  return components.sort((a, b) => b.length - a.length);
}

function inferConnectionStatus(node, edgeList, inLargestComponent) {
  if (!hasCoordinates(node)) return CONNECTION_STATUS.NEEDS_COORDINATES;
  if (node.disabled) return CONNECTION_STATUS.FUTURE_ONLY;
  if (node.futureOnly && !node.renderable) return CONNECTION_STATUS.FUTURE_ONLY;
  if (node.requiresSpecialCorridor) return CONNECTION_STATUS.SPECIAL_CORRIDOR_REQUIRED;

  const incident = (edgeList || []).filter(
    (e) => e.from === node.id || e.to === node.id
  );

  if (!incident.length || !inLargestComponent) {
    return CONNECTION_STATUS.DISCONNECTED_REVIEW_NEEDED;
  }

  const repair = incident.find((e) => e.edgeType === 'CONNECTIVITY_REPAIR_LINK');
  if (repair) return CONNECTION_STATUS.CONNECTED_VIA_BRANCH;

  const gateway = incident.find((e) => e.isIntercontinentalGateway);
  if (gateway) return CONNECTION_STATUS.CONNECTED_VIA_GATEWAY;

  const through = incident.find(
    (e) => e.edgeCategory === 'THROUGH_ROUTE' || e.routeClass === 'THROUGH_ROUTE'
  );
  if (through) return CONNECTION_STATUS.CONNECTED_VIA_THROUGH_ROUTE;

  const trunk = incident.find((e) => e.edgeType === 'HYPERLOOP_TRUNK_LINE');
  if (trunk) return CONNECTION_STATUS.CONNECTED_VIA_TRUNK;

  const branch = incident.find(
    (e) =>
      e.edgeCategory === 'EXTENDED_RURAL' ||
      e.edgeCategory === 'SPLIT_OFF' ||
      e.edgeType === 'SPLIT_OFF_BRANCH'
  );
  if (branch) return CONNECTION_STATUS.CONNECTED_VIA_BRANCH;

  return CONNECTION_STATUS.CONNECTED;
}

export function auditGraphConnectivity(nodes, edges, options = {}) {
  const allNodes = nodes || [];
  const allEdges = edges || [];

  const renderableNodes = allNodes.filter((n) => n.renderable && hasCoordinates(n));
  const renderableIds = renderableNodes.map((n) => n.id);

  const missingCoordinateNodes = allNodes.filter(
    (n) => !hasCoordinates(n) || n.needsCoordinates
  ).length;

  const futureOnlyNodes = allNodes.filter(
    (n) =>
      n.futureOnly ||
      n.e2eHubPhase === 'future' ||
      n.e2eHubPhase === 'future-rare-earth' ||
      (n.potentialFutureE2EHub && !n.isActiveE2EHub)
  ).length;

  const disabledNodes = allNodes.filter((n) => n.disabled).length;

  const edgeRenderableIds = new Set(renderableIds);
  const connectivityEdges = allEdges.filter(
    (e) => edgeRenderableIds.has(e.from) && edgeRenderableIds.has(e.to)
  );

  const components = findConnectedComponents(renderableIds, connectivityEdges);
  const largestComponent = components[0] || [];
  const largestSet = new Set(largestComponent);

  const connectedNodes = largestComponent.length;
  const disconnectedNodes = Math.max(0, renderableNodes.length - connectedNodes);
  const connectivityPercent = renderableNodes.length
    ? Math.round((connectedNodes / renderableNodes.length) * 1000) / 10
    : 0;

  const disconnectedNodeList = renderableNodes
    .filter((n) => !largestSet.has(n.id))
    .map((n) => ({
      id: n.id,
      name: n.name,
      country: n.country,
      connectionStatus: CONNECTION_STATUS.DISCONNECTED_REVIEW_NEEDED,
      connectionReason: n.connectionReason || 'Not in largest connected component',
    }));

  const annotatedNodes = allNodes.map((node) => {
    const inLargest = largestSet.has(node.id);
    const status = inferConnectionStatus(node, connectivityEdges, inLargest);
    const pathHint = inLargest
      ? node.connectionPathToNetwork || 'In planetary Hyperloop Web'
      : null;

    return {
      ...node,
      connectionStatus: status,
      connectionPathToNetwork: pathHint,
      connectionReason:
        node.connectionReason ||
        (status === CONNECTION_STATUS.DISCONNECTED_REVIEW_NEEDED
          ? 'Awaiting connector or special corridor'
          : null),
      inLargestComponent: inLargest,
    };
  });

  const repairLinks = connectivityEdges.filter(
    (e) => e.edgeType === 'CONNECTIVITY_REPAIR_LINK' || e.generatedBy === 'connectivity_repair'
  ).length;

  return {
    nodes: annotatedNodes,
    metrics: {
      totalNodes: allNodes.length,
      renderableNodes: renderableNodes.length,
      connectedNodes,
      disconnectedNodes,
      connectedComponents: components.length,
      largestConnectedComponentSize: largestComponent.length,
      largestComponentSize: largestComponent.length,
      connectivityPercent,
      missingCoordinateNodes,
      futureOnlyNodes,
      disabledNodes,
      repairLinksGenerated: repairLinks,
      repairLinks,
    },
    disconnectedNodes: disconnectedNodeList,
    connectedComponents: components,
    largestComponentIds: largestSet,
  };
}

export function auditVisibleHyperloopGraph(nodes, edges, layerState, pathFilter) {
  const { isHyperloopNodeVisible, isHyperloopEdgeVisible } = pathFilter;
  const visibleNodes = (nodes || []).filter((n) => isHyperloopNodeVisible(n, layerState));
  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = (edges || []).filter(
    (e) =>
      visibleIds.has(e.from) &&
      visibleIds.has(e.to) &&
      isHyperloopEdgeVisible(e, layerState)
  );
  const audit = auditGraphConnectivity(visibleNodes, visibleEdges);
  return {
    ...audit,
    metrics: {
      ...audit.metrics,
      auditScope: 'visible_map_graph',
    },
  };
}
