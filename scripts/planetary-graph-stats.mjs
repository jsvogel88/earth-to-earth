/**
 * Print planetary graph connectivity metrics (uses Vite SSR so ?raw CSV imports resolve).
 */
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const server = await createServer({
  root,
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const mod = await server.ssrLoadModule('/src/graph/buildPlanetaryHyperloopGraph.js');
  const graph = mod.buildPlanetaryHyperloopGraph();
  const renderableIds = new Set(
    graph.nodes.filter((n) => n.renderable !== false && n.lat != null).map((n) => n.id)
  );
  const orphanEdges = graph.edges.filter(
    (e) => !renderableIds.has(e.from) || !renderableIds.has(e.to)
  ).length;
  const duplicateIds =
    graph.nodes.length -
    new Set(graph.nodes.map((n) => n.id)).size;
  const spineEdges = graph.edges.filter(
    (e) =>
      e.edgeCategory === 'CONTINENTAL_SPINE' ||
      e.routeClass === 'CONTINENTAL_SPINE'
  );
  const corridors = [...new Set(spineEdges.map((e) => e.corridor).filter(Boolean))];

  const out = {
    duplicateNodeIds: duplicateIds,
    orphanRenderableEdges: orphanEdges,
    duplicateNodesMerged: graph.metrics?.duplicateNodesMerged,
    continentalSpineEdges: spineEdges.length,
    continentalSpineCorridors: corridors,
    continentalSpineMiles: graph.metrics?.continentalSpineMiles,
    connectivity: graph.metrics?.connectivity,
    webStats: graph.webStats,
    disconnectedSample: (graph.metrics?.connectivity
      ? graph.webStats?.disconnectedNodes
      : null) ?? graph.audit?.disconnectedNodes?.slice?.(0, 15),
  };

  if (graph.audit?.disconnectedNodes) {
    out.disconnectedSample = graph.audit.disconnectedNodes.slice(0, 20).map((n) => n.name);
  }

  const auditMod = await server.ssrLoadModule('/src/graph/graphConnectivityAudit.js');
  const audit = auditMod.auditGraphConnectivity(graph.nodes, graph.edges);
  out.disconnectedNames = audit.disconnectedNodes.slice(0, 25).map((n) => n.name);
  out.componentSizes = audit.connectedComponents.slice(0, 8).map((c) => c.length);

  const operationalNodes = graph.nodes.filter(
    (n) =>
      n.renderable !== false &&
      n.lat != null &&
      !n.futureOnly &&
      !n._sourceRemoteNode &&
      n.nodeType !== 'REMOTE_CARGO_RESOURCE'
  );
  const operationalIds = operationalNodes.map((n) => n.id);
  const operationalEdges = graph.edges.filter(
    (e) =>
      e.renderable !== false &&
      operationalIds.includes(e.from) &&
      operationalIds.includes(e.to) &&
      e.edgeType !== 'CONNECTIVITY_REPAIR_LINK'
  );
  const opComponents = auditMod.findConnectedComponents(operationalIds, operationalEdges);
  out.operationalHyperloop = {
    nodes: operationalNodes.length,
    edges: operationalEdges.length,
    largestComponent: opComponents[0]?.length ?? 0,
    componentCount: opComponents.length,
    topComponents: opComponents.slice(0, 6).map((c) => c.length),
  };

  const idToName = new Map(graph.nodes.map((n) => [n.id, n.name]));
  const hubNames = [
    'London',
    'Tokyo',
    'Dallas',
    'Mexico City',
    'Cape Town',
    'Istanbul',
    'Singapore',
    'Sydney',
    'Nuuk',
    'Anchorage',
    'Kinshasa',
    'Lagos',
  ];
  const nameToId = new Map(
    graph.nodes.map((n) => [n.name.toLowerCase(), n.id])
  );
  const compByNode = new Map();
  audit.connectedComponents.forEach((comp, idx) => {
    comp.forEach((id) => compByNode.set(id, idx));
  });
  out.hubComponents = {};
  hubNames.forEach((name) => {
    const id = nameToId.get(name.toLowerCase());
    const compIdx = id != null ? compByNode.get(id) : null;
    out.hubComponents[name] =
      compIdx == null ? 'missing' : `component_${compIdx}_size_${audit.connectedComponents[compIdx]?.length}`;
  });

  const gatewayEdges = graph.edges.filter((e) => e.isIntercontinentalGateway);
  out.intercontinentalGatewayEdges = gatewayEdges.length;

  const m = graph.metrics || {};
  out.infrastructure = {
    edgeCountBeforePrune: m.edgeCountBeforePrune,
    edgeCountAfterPrune: m.edgeCountAfterPrune,
    finalRenderableEdges: graph.edges.filter((e) => e.renderable !== false).length,
    meshEdgesRemoved: m.meshEdgesRemoved,
    meshRemovedByCategory: m.meshRemovedByCategory,
    infrastructureTrunkEdges: m.infrastructureTrunkEdges,
    infrastructureTrunkCorridors: m.infrastructureTrunkCorridors,
    feederAttachments: m.feederAttachments,
    corridorThroughRoutes: m.corridorThroughRoutes,
    corridorThroughRouteMiles: m.corridorThroughRouteMiles,
    throughRoutes: m.throughRoutes,
    continentalSpineEdges: m.continentalSpineEdges,
    planetaryMergeGatewayEdges: m.planetaryMergeGatewayEdges,
  };

  const trunkEdges = graph.edges.filter(
    (e) =>
      e.edgeCategory === 'PLANETARY_TRUNK' ||
      e.edgeCategory === 'REGIONAL_TRUNK' ||
      e.edgeCategory === 'CORRIDOR_CHAIN'
  );
  out.infrastructureTrunkEdgeCategories = {
    planetary: trunkEdges.filter((e) => e.edgeCategory === 'PLANETARY_TRUNK').length,
    regional: trunkEdges.filter((e) => e.edgeCategory === 'REGIONAL_TRUNK').length,
    corridorChain: trunkEdges.filter((e) => e.edgeCategory === 'CORRIDOR_CHAIN').length,
  };

  const roleCounts = {};
  graph.nodes.forEach((n) => {
    const role = n.infrastructureRole || 'unknown';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  out.infrastructureRoleCounts = roleCounts;

  const classifyMod = await server.ssrLoadModule(
    '/src/data/classifyWorldCityInfrastructure.js'
  );
  const grid = classifyMod.buildWorldCitiesPlanningGrid({ limit: 5000 });
  const gridRoleCounts = {};
  grid.forEach((p) => {
    const role = p.infrastructureRole || 'unknown';
    gridRoleCounts[role] = (gridRoleCounts[role] || 0) + 1;
  });
  out.worldCitiesPlanningGridSample = {
    points: grid.length,
    roleCounts: gridRoleCounts,
  };

  console.log(JSON.stringify(out, null, 2));
} finally {
  await server.close();
}
