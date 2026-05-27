/**
 * Robotaxi overlay visibility — zones only, never route edges.
 */

import { isLayerVisibleAtZoom } from './layerRegistry.js';
import {
  isRobotaxiMode,
  normalizeTransportMode,
} from '../data/transportOperatingSystem.js';
import { INTEGRATED_VIEW_FOCUS } from '../ui/integratedGridFilters.js';
import { shouldShowRobotaxiOverlay } from '../map/layerVisibility.js';

/**
 * @param {object} layerState
 */
export function isRobotaxiLayerActive(layerState) {
  return Boolean(layerState?.showRobotaxiLayer);
}

/**
 * Hub mobility zones visible in Robotaxi mode, Civilization Grid, or planetary skeleton.
 * @param {object} layerState
 * @param {string} [transportMode]
 */
export function isHubMobilityOverlayActive(layerState, transportMode) {
  const mode = normalizeTransportMode(transportMode);
  const focus = layerState?.integratedViewFocus;
  if (shouldShowRobotaxiOverlay(focus, layerState)) return true;
  if (isRobotaxiMode(mode)) return layerState?.showRobotaxiLayer !== false;
  if (focus === INTEGRATED_VIEW_FOCUS.AUTO) return layerState?.showRobotaxiLayer !== false;
  return false;
}

/**
 * @param {object} zone
 * @param {object} layerState
 * @param {number} zoom
 */
export function isRobotaxiZoneVisible(zone, layerState, zoom, transportMode) {
  if (!isHubMobilityOverlayActive(layerState, transportMode)) return false;
  if (!zone?.renderable) return false;

  if (zoom < 4) {
    return (
      layerState.showRobotaxiRemoteLastMile !== false &&
      (zone.isMajorHub || zone.remoteLastMileConnector)
    );
  }

  if (zoom < 6) {
    if (!layerState.showRobotaxiServiceZones) return false;
    if (layerState.showRobotaxiAirportConnectors === false) {
      return !zone.airportConnector && !zone.downtownConnector;
    }
    return true;
  }

  return layerState.showRobotaxiServiceZones !== false;
}

export function filterRobotaxiHubDots(zones, layerState, zoom, transportMode) {
  if (!isHubMobilityOverlayActive(layerState, transportMode)) return [];
  if (zoom >= 4) return [];
  if (layerState.showRobotaxiRemoteLastMile === false && zoom < 4) return [];

  return zones
    .filter((z) => z.isMajorHub || z.remoteLastMileConnector)
    .map((z) => ({
      id: z.id,
      lat: z.lat,
      lon: z.lon,
      name: z.parentHubName,
      isMajorHub: z.isMajorHub,
      remoteLastMileConnector: z.remoteLastMileConnector,
    }));
}

export function filterRobotaxiZoneFeatures(zones, layerState, zoom, transportMode) {
  if (!layerState.showRobotaxiServiceZones || !isHubMobilityOverlayActive(layerState, transportMode)) {
    return [];
  }
  if (!isLayerVisibleAtZoom({ minZoom: 4 }, zoom)) return [];

  return zones
    .filter((z) => isRobotaxiZoneVisible(z, layerState, zoom, transportMode))
    .map((z) => z.zoneFeature)
    .filter(Boolean);
}

export function filterRobotaxiPickupDropoff(zones, layerState, zoom, transportMode) {
  if (!layerState.showRobotaxiPickupDropoff || !isHubMobilityOverlayActive(layerState, transportMode)) {
    return [];
  }
  if (zoom < 6) return [];

  const points = [];
  zones.forEach((z) => {
    if (!isRobotaxiZoneVisible(z, layerState, zoom, transportMode)) return;
    (z.pickupDropoffPoints || []).forEach((p) => points.push(p));
  });
  return points;
}

export const ROBOTAXI_COLORS = {
  zoneFill: [160, 255, 120, 28],
  zoneLine: [200, 255, 180, 140],
  hubDot: [220, 255, 200, 220],
  pickupFill: [140, 255, 100, 200],
  pickupLine: [255, 255, 255, 200],
};
