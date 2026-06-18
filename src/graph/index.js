/**
 * Graph layer public API — route generation and visibility only.
 */

export {
  buildPlanetaryHyperloopGraph,
  normalizePlanetaryNode,
  generateConnectivityRepairLinks,
  CONNECTION_STATUS,
} from './buildPlanetaryHyperloopGraph.js';

export { buildE2EOriginView, slicePlanetaryGraphForOrigin } from './buildE2EOriginView.js';

export { generateThroughRoutes, makeThroughEdge } from './generateThroughRoutes.js';

export { freezePlanetaryGraph } from './freezeGraph.js';

export { applyContinentalSpines } from './applyContinentalSpines.js';
export { applyPlanetaryMergeGateways } from './applyPlanetaryMergeGateways.js';
export { applyInfrastructureTrunks } from './applyInfrastructureTrunks.js';
export { pruneMeshSpaghetti } from './pruneMeshSpaghetti.js';
export { applyFeederTrunkAttachment } from './applyFeederTrunkAttachment.js';
export { generateCorridorThroughRoutes } from './generateCorridorThroughRoutes.js';
export {
  isInfrastructurePathVisible,
  filterInfrastructurePaths,
} from './infrastructureVisibility.js';
export {
  scoreCorridorPath,
  isPriorityRemoteCorridorVisible,
  remoteCorridorMinScore,
} from './corridorPriorityScore.js';

export {
  canonicalNetworkCityId,
  resolveCanonicalNodeId,
  resolveCanonicalGraphNode,
  buildCanonicalNodeIndex,
  deduplicateNodesByNetworkCityId,
  normalizeEdgeEndpoints,
} from './canonicalNodeResolution.js';

export {
  isHyperloopNodeVisible,
  isHyperloopPathVisible,
  isCoreHyperloopWebPath,
  isHyperloopEdgeVisible,
  filterVisiblePaths,
} from './visibleGraphFilter.js';

export {
  auditGraphConnectivity,
  auditVisibleHyperloopGraph,
  findConnectedComponents,
  buildAdjacencyFromEdges,
} from './graphConnectivityAudit.js';

export {
  NODE_TYPES,
  EDGE_MODES,
  EDGE_TYPES,
  CORRIDOR_TYPES,
  createIntegratedEdge,
  edgeKey as integratedEdgeKey,
  normalizeNodeId,
} from './integratedGraphTypes.js';

export {
  getLat,
  getLon,
  hasCoordinates as hasNodeCoordinates,
  haversineDistanceKm,
  sortByDistance,
  findNearest,
} from './geoDistance.js';

export {
  deduplicateEdges,
  findDuplicateEdges,
  findOrphanNodes,
  findOrphanMineralHubs,
  auditGraphIntegrity,
} from './graphIntegrity.js';

export { generateE2ERoutes, isE2EHubNode } from './generateE2ERoutes.js';
export { generateE2MRoutes } from './generateE2MRoutes.js';
export { generateLoopRegionalRoutes } from './generateLoopRegionalRoutes.js';
export { generateIntegratedRoutes } from './generateIntegratedRoutes.js';

export {
  buildPlanetaryMobilityGraph,
  getDisplayGraphEdges,
  countGeometryIntentViolations,
  getOfficialNodes,
  mergeGraphBackbone,
} from './planetaryMobilityGraphEngine.js';
