/**
 * Map layer system public API.
 */

export {
  LAYER_GROUPS,
  LAYER_TYPES,
  LEGEND_GROUPS,
  MAP_LAYER_REGISTRY,
  GROUP_SECTION_TITLES,
  getTransportModeLayers,
  getLayersByGroup,
  getLayerById,
  getLayerByStateKey,
  buildDefaultLayerState,
  isLayerVisibleAtZoom,
} from './layerRegistry.js';

export {
  buildCustomConnectionPreviews,
  CONNECTION_MODES,
  PREVIEW_LINE_STYLE,
} from './customConnectionPreview.js';

export {
  PREVIEW_TOOLTIP_TEXT,
  PREVIEW_TOOLTIP_HTML,
  isOverlayPreviewRecord,
  isValidPreviewSegment,
  assertValidPreviewSegment,
  FORBIDDEN_OFFICIAL_GRAPH_FIELDS,
} from './previewSegmentContract.js';

export {
  isRobotaxiLayerActive,
  isHubMobilityOverlayActive,
  isRobotaxiZoneVisible,
  filterRobotaxiHubDots,
  filterRobotaxiZoneFeatures,
  filterRobotaxiPickupDropoff,
  ROBOTAXI_COLORS,
} from './robotaxiVisibility.js';

export {
  OVERLAY_CATEGORIES,
  DATA_SOURCE_TYPES,
  PLANNING_DECK_LAYER_IDS,
  buildOverlayCatalog,
  getOverlayById,
  getOverlaysByCategory,
  isOverlayVisibleAtZoom,
  isPlanningOverlay,
} from './overlayRegistry.js';

export {
  buildGlobalConnectivityPaths,
  filterPlanningPathsByZoom,
  buildIntermodalHubHalos,
  buildE2EHubHalos,
  PLANNING_CORRIDOR_STYLES,
} from './planningOverlayLayers.js';
