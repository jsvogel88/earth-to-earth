/**
 * Visibility filter — what the map may render. No graph mutation or route generation.
 */

import { hasCoordinates } from '../data/planningLayers.js';
import { isInfrastructurePathVisible } from './infrastructureVisibility.js';
import {
  isHyperloopCoreMode,
  normalizeTransportMode,
} from '../data/transportOperatingSystem.js';

/** @typedef {import('../data/mapLayerDefaults.js').PlanningLayerState} PlanningLayerState */

export function isHyperloopNodeVisible(node, layerState) {
  if (!node || node.disabled || !node.renderable || !hasCoordinates(node)) return false;
  if (!node.futureOnly) return true;
  if (node.potentialRareEarthHub && layerState.showRareEarthHubs) return true;
  if (node.potentialFutureE2EHub && layerState.showFutureHighPopulationHubs) return true;
  if (
    (node.isRemoteNode || node.globalCoverage) &&
    (layerState.showExtendedRuralLayer || layerState.showRareEarthHubs)
  ) {
    return true;
  }
  return false;
}

export function isHyperloopPathVisible(path, layerState) {
  if (!path || path.renderable === false) return false;
  if (path.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR') {
    return layerState.showRemoteCargoRoutes;
  }
  if (path.edgeCategory === 'EXTENDED_RURAL') {
    return layerState.showExtendedRuralLayer || layerState.showRemoteCargoRoutes;
  }
  if (
    path.edgeCategory === 'PLANNING_FUTURE_HUB' ||
    path.generatedBy === 'future_hub_connector'
  ) {
    return layerState.showFutureHighPopulationHubs;
  }
  if (
    path.edgeType === 'CONNECTIVITY_REPAIR_LINK' ||
    path.edgeCategory === 'CONNECTIVITY_REPAIR'
  ) {
    return layerState.showConnectivityRepairLinks;
  }
  if (
    path.edgeCategory === 'THROUGH_ROUTE' ||
    path.routeClass === 'THROUGH_ROUTE' ||
    path.edgeType === 'THROUGH_ROUTE'
  ) {
    return layerState.showThroughRoutes;
  }
  return true;
}

export function isCoreHyperloopWebPath(path, layerState, zoom, transportMode) {
  if (!isHyperloopPathVisible(path, layerState)) return false;
  if (
    path.edgeType === 'CONNECTIVITY_REPAIR_LINK' ||
    path.edgeCategory === 'CONNECTIVITY_REPAIR' ||
    path.generatedBy === 'connectivity_repair'
  ) {
    return false;
  }
  const mode = normalizeTransportMode(transportMode);
  if (!isHyperloopCoreMode(mode) && layerState?.showHyperloopInfrastructure === false) {
    return false;
  }
  if (zoom != null) {
    return isInfrastructurePathVisible(path, layerState, zoom, mode);
  }
  return isInfrastructurePathVisible(path, layerState, 5, mode);
}

export function isHyperloopEdgeVisible(edge, layerState) {
  if (!edge || edge.renderable === false) return false;
  if (edge.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR') {
    return layerState.showRemoteCargoRoutes;
  }
  if (edge.edgeCategory === 'EXTENDED_RURAL') {
    return layerState.showExtendedRuralLayer || layerState.showRemoteCargoRoutes;
  }
  if (edge.edgeCategory === 'PLANNING_FUTURE_HUB' || edge.generatedBy === 'future_hub_connector') {
    return layerState.showFutureHighPopulationHubs;
  }
  if (
    edge.edgeType === 'CONNECTIVITY_REPAIR_LINK' ||
    edge.edgeCategory === 'CONNECTIVITY_REPAIR'
  ) {
    return layerState.showConnectivityRepairLinks;
  }
  if (
    edge.edgeCategory === 'THROUGH_ROUTE' ||
    edge.routeClass === 'THROUGH_ROUTE' ||
    edge.edgeType === 'THROUGH_ROUTE'
  ) {
    return layerState.showThroughRoutes;
  }
  return true;
}

/** Filter paths for a map mode + zoom (read-only). */
export function filterVisiblePaths(paths, { layerState, mapMode, zoom, minZoom = 5 } = {}) {
  if (!Array.isArray(paths)) return [];
  let visible = paths.filter((p) => isHyperloopPathVisible(p, layerState));
  if (isHyperloopCoreMode(normalizeTransportMode(mapMode))) {
    visible = visible.filter((p) => isCoreHyperloopWebPath(p, layerState, zoom, mapMode));
  }
  if (zoom != null && zoom < minZoom) {
    return [];
  }
  return visible;
}
