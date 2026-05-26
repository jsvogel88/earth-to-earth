/**
 * Hyperloop Web visibility by infrastructure tier, transport mode, and zoom.
 */

import { isCivilizationGridMode, isE2MOrbitalMode } from '../data/transportOperatingSystem.js';
import {
  scoreCorridorPath,
  isPriorityRemoteCorridorVisible,
} from './corridorPriorityScore.js';

const TRUNK_CATEGORIES = new Set([
  'CONTINENTAL_SPINE',
  'PLANETARY_TRUNK',
  'REGIONAL_TRUNK',
  'CORRIDOR_CHAIN',
  'PLANETARY_GATEWAY',
  'INTERCONTINENTAL_GATEWAY',
  'THROUGH_ROUTE',
]);

const FEEDER_CATEGORIES = new Set([
  'E2E_FEEDER',
  'FEEDER_ATTACHMENT',
  'SPLIT_OFF',
  'LOCAL',
]);

const OVERLAY_CATEGORIES = new Set([
  'PLANNING_FUTURE_HUB',
  'CONNECTIVITY_REPAIR',
]);

function tierEnabled(layerState, path) {
  const cat = path.edgeCategory || '';
  if (cat === 'PLANETARY_TRUNK' || path.infrastructureTier === 1) {
    return layerState?.showPlanetaryTrunks !== false;
  }
  if (cat === 'REGIONAL_TRUNK' || path.infrastructureTier === 2) {
    return layerState?.showRegionalTrunks !== false;
  }
  if (
    cat === 'PLANETARY_GATEWAY' ||
    cat === 'INTERCONTINENTAL_GATEWAY' ||
    path.isIntercontinentalGateway
  ) {
    return layerState?.showGateways !== false;
  }
  if (cat === 'THROUGH_ROUTE' || path.edgeType === 'THROUGH_ROUTE') {
    return layerState?.showThroughRoutes !== false;
  }
  if (FEEDER_CATEGORIES.has(cat) || path.edgeType === 'LOCAL_CITY_WEB') {
    return layerState?.showFeeders === true;
  }
  return true;
}

/**
 * Railway-style backbone visibility: world zoom shows trunks/gateways; remote uses priority score.
 * @param {object} path
 * @param {object} layerState
 * @param {number} zoom
 * @param {string} [transportMode]
 */
export function isInfrastructurePathVisible(path, layerState, zoom = 5, transportMode) {
  if (!path || path.renderable === false) return false;

  if (isE2MOrbitalMode(transportMode)) return false;
  if (isCivilizationGridMode(transportMode) && layerState?.showHyperloopInfrastructure === false) {
    return false;
  }

  const cat = path.edgeCategory || '';

  if (OVERLAY_CATEGORIES.has(cat)) {
    return false;
  }

  if (!tierEnabled(layerState, path)) return false;

  if (cat === 'EXTENDED_RURAL' || cat === 'GLOBAL_COVERAGE_CORRIDOR') {
    if (!layerState?.showRemoteCorridorSpines && !layerState?.showRemoteCargoRoutes) {
      return false;
    }
    return isPriorityRemoteCorridorVisible(path, zoom);
  }

  if (cat === 'CROSSLINK') {
    if (zoom < 3.2) return false;
    return layerState?.showRegionalTrunks !== false;
  }

  if (FEEDER_CATEGORIES.has(cat) || path.edgeType === 'LOCAL_CITY_WEB') {
    if (zoom < 5.5) return false;
    if (!layerState?.showFeeders && !layerState?.showLocalFeeders) return false;
  }

  if (TRUNK_CATEGORIES.has(cat)) {
    return true;
  }

  if (path.routeClass === 'CONTINENTAL_SPINE' || path.isIntercontinentalGateway) {
    return true;
  }

  if (path.edgeType === 'HYPERLOOP_TRUNK_LINE' && path.isThroughCorridor) {
    return true;
  }

  if (zoom < 3) {
    return (
      path.edgeType === 'HYPERLOOP_TRUNK_LINE' ||
      path.edgeType === 'INTERCONTINENTAL_GATEWAY_ROUTE' ||
      path.edgeType === 'PLANETARY_GATEWAY_ROUTE' ||
      path.edgeType === 'THROUGH_ROUTE' ||
      TRUNK_CATEGORIES.has(cat)
    );
  }

  if (zoom < 4.2) {
    return scoreCorridorPath(path) >= 40 || path.edgeType === 'HYPERLOOP_TRUNK_LINE';
  }

  return true;
}

export function filterInfrastructurePaths(paths, layerState, zoom, transportMode) {
  if (!Array.isArray(paths)) return [];
  return paths.filter((p) =>
    isInfrastructurePathVisible(p, layerState, zoom, transportMode)
  );
}
