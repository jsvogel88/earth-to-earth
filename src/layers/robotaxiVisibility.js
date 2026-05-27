/**
 * Robotaxi overlay visibility — zones only, never route edges.
 */

import { isLayerVisibleAtZoom } from './layerRegistry.js';
import {
  isCivilizationGridMode,
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
  if (isCivilizationGridMode(mode) && layerState?.showRobotaxiLayer) return true;
  if (layerState?.showPlanetarySkeleton && layerState?.showRobotaxiLayer) return true;
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

/** Robotaxi service ring zoom thresholds (render-only). */
export const ROBOTAXI_SERVICE_ZONE_ZOOM = {
  HIDDEN_MAX: 4,
  STROKE_ONLY_MAX: 6,
};

export const ROBOTAXI_RING_LINE_RGB = [100, 200, 255];
export const ROBOTAXI_RING_FILL_TRANSPARENT = [0, 0, 0, 0];

/**
 * @param {number} zoom
 * @returns {'hidden' | 'stroke_only' | 'full'}
 */
export function getRobotaxiServiceZoneRenderTier(zoom) {
  const z = Number(zoom) || 2;
  if (z < ROBOTAXI_SERVICE_ZONE_ZOOM.HIDDEN_MAX) return 'hidden';
  if (z < ROBOTAXI_SERVICE_ZONE_ZOOM.STROKE_ONLY_MAX) return 'stroke_only';
  return 'full';
}

/**
 * Deck.gl props for robotaxi rings — uses existing zoom-tier pattern.
 * @param {number} zoom
 */
export function getRobotaxiServiceZoneDeckStyle(zoom) {
  const tier = getRobotaxiServiceZoneRenderTier(zoom);
  if (tier === 'hidden') {
    return {
      tier,
      visible: false,
      filled: false,
      stroked: false,
      lineColor: [...ROBOTAXI_RING_LINE_RGB, 0],
      fillColor: ROBOTAXI_RING_FILL_TRANSPARENT,
      lineWidthMinPixels: 1.5,
      layerOpacity: 0,
    };
  }
  if (tier === 'stroke_only') {
    return {
      tier,
      visible: true,
      filled: false,
      stroked: true,
      lineColor: [...ROBOTAXI_RING_LINE_RGB, Math.round(255 * 0.25)],
      fillColor: ROBOTAXI_RING_FILL_TRANSPARENT,
      lineWidthMinPixels: 1.5,
      layerOpacity: 1,
    };
  }
  return {
    tier,
    visible: true,
    filled: false,
    stroked: true,
    lineColor: [100, 200, 255, 120],
    fillColor: ROBOTAXI_RING_FILL_TRANSPARENT,
    lineWidthMinPixels: 1.5,
    layerOpacity: 1,
  };
}

/**
 * @param {number} zoom
 */
export function isRobotaxiServiceRingLayerVisible(zoom) {
  return getRobotaxiServiceZoneRenderTier(zoom) !== 'hidden';
}

/**
 * GeoJSON polygon rings → PathLayer paths (stroke-only render, no fill stacking).
 * @param {object[]} features
 */
export function robotaxiFeaturesToRingPaths(features = []) {
  return features
    .map((feature, index) => {
      const ring = feature?.geometry?.coordinates?.[0];
      if (!Array.isArray(ring) || ring.length < 2) return null;
      return {
        id: feature?.properties?.id ?? `robotaxi-ring-${index}`,
        path: ring,
        ringKind: feature?.properties?.ring ?? null,
      };
    })
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
  zoneFill: [160, 255, 120, Math.round(255 * 0.08)],
  zoneLine: [200, 255, 180, Math.round(255 * 0.45)],
  hubDot: [220, 255, 200, 220],
  pickupFill: [140, 255, 100, 200],
  pickupLine: [255, 255, 255, 200],
};
