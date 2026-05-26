/**
 * Multi-modal overview path visibility — read-only slices of official graph paths.
 */

import {
  isCivilizationGridMode,
  isE2EStarshipMode,
  isHyperloopCoreMode,
  normalizeTransportMode,
} from '../data/transportOperatingSystem.js';
import { isInfrastructurePathVisible } from './infrastructureVisibility.js';

const TRUNK_CATEGORIES = new Set([
  'CONTINENTAL_SPINE',
  'PLANETARY_TRUNK',
  'REGIONAL_TRUNK',
  'PLANETARY_GATEWAY',
  'INTERCONTINENTAL_GATEWAY',
  'THROUGH_ROUTE',
]);

/**
 * Layer state tuned for civilization grid / planetary skeleton views.
 * @param {object} layerState
 * @param {number} zoom
 * @param {string} transportMode
 */
export function buildOverviewLayerState(layerState, zoom, transportMode) {
  const mode = normalizeTransportMode(transportMode);
  const civ = isCivilizationGridMode(mode);
  const e2e = isE2EStarshipMode(mode);

  return {
    ...layerState,
    showHyperloopInfrastructure: layerState.showHyperloopInfrastructure !== false,
    showPlanetaryTrunks: true,
    showRegionalTrunks: zoom >= (civ ? 2.2 : 2.8),
    showGateways: true,
    showThroughRoutes: civ ? zoom >= 3.2 : zoom >= 4,
    showFeeders: zoom >= 5.5,
    showLocalFeeders: zoom >= 6,
    showRemoteCorridorSpines: civ && zoom >= 2,
    showE2MLayer: civ || layerState.showE2MLayer,
    showRobotaxiLayer:
      civ || e2e || layerState.showRobotaxiLayer || layerState.showPlanetarySkeleton,
  };
}

/**
 * @param {object} path
 * @param {object} layerState
 * @param {number} zoom
 * @param {string} transportMode
 */
export function isPlanetarySkeletonPath(path, layerState, zoom, transportMode) {
  if (!path || path.renderable === false) return false;
  const mode = normalizeTransportMode(transportMode);
  if (isHyperloopCoreMode(mode)) return false;

  const overviewState = buildOverviewLayerState(layerState, zoom, transportMode);
  return isInfrastructurePathVisible(path, overviewState, zoom, mode);
}

/**
 * Stronger trunk emphasis at world zoom for hyperloop readability.
 * @param {object} path
 * @param {number} zoom
 */
export function getSkeletonPathWidthBoost(path, zoom) {
  const cat = path.edgeCategory || '';
  if (zoom >= 4) return 1;
  if (TRUNK_CATEGORIES.has(cat) || path.infrastructureTier === 1) return 1.4;
  if (cat === 'PLANETARY_GATEWAY' || path.isIntercontinentalGateway) return 1.25;
  return 1;
}
