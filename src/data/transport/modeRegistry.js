/**
 * modeRegistry.js
 * Canonical mode definitions for the global hyperloop transport network.
 * Each mode controls visibility, zoom behavior, visual style, and render pipeline.
 */

export const MODES = {
  e2e_starship: {
    id: "e2e_starship",
    label: "E2E Starship",
    description: "Global point-to-point rocket/hypersonic routes",
    defaultVisible: true,
    minZoom: 1,
    maxZoom: 10,
    nodeTypes: ["city"],
    routeTypes: ["global_backbone"],
    visualPriority: 1,
    supports2D: true,
    supports3D: true,
    colorToken: "#FF6B35",
    lineStyle: "glow",
    widthTier: "thick",
    altitudeMode: "arc",         // render as great-circle arcs, NOT ground paths
    zoomTiers: {
      "1-3": { show: true, opacity: 1.0, labelVisible: false },
      "4-5": { show: true, opacity: 0.8, labelVisible: false },
      "6-8": { show: false, opacity: 0, labelVisible: false },
      "9+":  { show: false, opacity: 0, labelVisible: false },
    },
  },

  hyperloop: {
    id: "hyperloop",
    label: "Hyperloop",
    description: "Ground-tube high-speed intercity corridors",
    defaultVisible: true,
    minZoom: 1,
    maxZoom: 10,
    nodeTypes: ["city", "junction"],
    routeTypes: ["continental_spine", "regional_spine"],
    visualPriority: 2,
    supports2D: true,
    supports3D: true,
    colorToken: "#00D4FF",
    lineStyle: "solid",
    widthTier: "medium",
    altitudeMode: "ground",      // render as ground/tube corridors, NOT arcs
    zoomTiers: {
      "1-3": { show: true, opacity: 0.7, labelVisible: false },
      "4-5": { show: true, opacity: 1.0, labelVisible: false },
      "6-8": { show: true, opacity: 1.0, labelVisible: true },
      "9+":  { show: true, opacity: 1.0, labelVisible: true },
    },
  },

  regional_loop: {
    id: "regional_loop",
    label: "Regional Loop",
    description: "Metro-area and regional feeder loop networks",
    defaultVisible: true,
    minZoom: 3,
    maxZoom: 10,
    nodeTypes: ["city", "suburb", "junction"],
    routeTypes: ["regional_loop", "metro_loop"],
    visualPriority: 3,
    supports2D: true,
    supports3D: false,
    colorToken: "#A8FF3E",
    lineStyle: "dashed",
    widthTier: "thin",
    altitudeMode: "ground",
    zoomTiers: {
      "1-3": { show: false, opacity: 0, labelVisible: false },
      "4-5": { show: true, opacity: 0.5, labelVisible: false },
      "6-8": { show: true, opacity: 0.9, labelVisible: false },
      "9+":  { show: true, opacity: 1.0, labelVisible: true },
    },
  },

  e2m: {
    id: "e2m",
    label: "E2M Cargo",
    description: "End-to-middle logistics, cargo, and industrial routes",
    defaultVisible: false,
    minZoom: 2,
    maxZoom: 10,
    nodeTypes: ["city", "port", "industrial", "logistics"],
    routeTypes: ["cargo_spine", "resource_corridor"],
    visualPriority: 4,
    supports2D: true,
    supports3D: true,
    colorToken: "#FFD700",
    lineStyle: "dotted",
    widthTier: "thin",
    altitudeMode: "arc",
    zoomTiers: {
      "1-3": { show: false, opacity: 0, labelVisible: false },
      "4-5": { show: true, opacity: 0.6, labelVisible: false },
      "6-8": { show: true, opacity: 0.9, labelVisible: false },
      "9+":  { show: true, opacity: 1.0, labelVisible: true },
    },
  },

  robotaxi: {
    id: "robotaxi",
    label: "Robotaxi / Auto",
    description: "Autonomous last-mile feeder zones — LOCAL only, never global routes",
    defaultVisible: false,
    minZoom: 6,          // never shows at global zoom — this prevents global spaghetti
    maxZoom: 10,
    nodeTypes: ["city", "suburb", "station"],
    routeTypes: ["local_feeder", "autonomous_zone"],
    visualPriority: 5,
    supports2D: true,
    supports3D: false,
    colorToken: "#C084FC",
    lineStyle: "thin",
    widthTier: "hairline",
    altitudeMode: "ground",
    maxEdgeDistanceKm: 80,   // HARD LIMIT — robotaxi edges > 80km are invalid
    zoomTiers: {
      "1-3": { show: false, opacity: 0, labelVisible: false },
      "4-5": { show: false, opacity: 0, labelVisible: false },
      "6-8": { show: true, opacity: 0.7, labelVisible: false },
      "9+":  { show: true, opacity: 1.0, labelVisible: true },
    },
  },

  rail: {
    id: "rail",
    label: "Legacy Rail",
    description: "Existing conventional rail for context/comparison",
    defaultVisible: false,
    minZoom: 4,
    maxZoom: 10,
    nodeTypes: ["city", "station"],
    routeTypes: ["rail_spine"],
    visualPriority: 6,
    supports2D: true,
    supports3D: false,
    colorToken: "#94A3B8",
    lineStyle: "solid",
    widthTier: "thin",
    altitudeMode: "ground",
    zoomTiers: {
      "1-3": { show: false, opacity: 0, labelVisible: false },
      "4-5": { show: true, opacity: 0.4, labelVisible: false },
      "6-8": { show: true, opacity: 0.7, labelVisible: false },
      "9+":  { show: true, opacity: 1.0, labelVisible: true },
    },
  },

  port: {
    id: "port",
    label: "Port / Maritime",
    description: "Major seaports and maritime freight hubs",
    defaultVisible: false,
    minZoom: 3,
    maxZoom: 10,
    nodeTypes: ["port", "city"],
    routeTypes: ["maritime_spine"],
    visualPriority: 7,
    supports2D: true,
    supports3D: true,
    colorToken: "#38BDF8",
    lineStyle: "dotted",
    widthTier: "thin",
    altitudeMode: "ground",
    zoomTiers: {
      "1-3": { show: false, opacity: 0, labelVisible: false },
      "4-5": { show: true, opacity: 0.5, labelVisible: false },
      "6-8": { show: true, opacity: 0.9, labelVisible: false },
      "9+":  { show: true, opacity: 1.0, labelVisible: true },
    },
  },

  grid: {
    id: "grid",
    label: "Planning Grid",
    description: "Conceptual planning grid for coverage analysis",
    defaultVisible: false,
    minZoom: 1,
    maxZoom: 6,
    nodeTypes: ["grid_node"],
    routeTypes: ["grid_edge"],
    visualPriority: 8,
    supports2D: true,
    supports3D: false,
    colorToken: "#334155",
    lineStyle: "thin",
    widthTier: "hairline",
    altitudeMode: "ground",
    zoomTiers: {
      "1-3": { show: true, opacity: 0.3, labelVisible: false },
      "4-5": { show: true, opacity: 0.5, labelVisible: false },
      "6-8": { show: false, opacity: 0, labelVisible: false },
      "9+":  { show: false, opacity: 0, labelVisible: false },
    },
  },

  custom: {
    id: "custom",
    label: "Custom Destinations",
    description: "User-added or manually curated points of interest",
    defaultVisible: true,
    minZoom: 1,
    maxZoom: 10,
    nodeTypes: ["custom", "poi"],
    routeTypes: ["custom"],
    visualPriority: 9,
    supports2D: true,
    supports3D: true,
    colorToken: "#F59E0B",
    lineStyle: "solid",
    widthTier: "thin",
    altitudeMode: "ground",
    zoomTiers: {
      "1-3": { show: true, opacity: 1.0, labelVisible: false },
      "4-5": { show: true, opacity: 1.0, labelVisible: false },
      "6-8": { show: true, opacity: 1.0, labelVisible: true },
      "9+":  { show: true, opacity: 1.0, labelVisible: true },
    },
  },
};

export const MODE_IDS = Object.keys(MODES);

export function getMode(modeId) {
  return MODES[modeId] || null;
}

export function getVisibleModes(zoom) {
  return Object.values(MODES).filter(m => zoom >= m.minZoom);
}

export function getZoomTierKey(zoom) {
  if (zoom <= 3) return "1-3";
  if (zoom <= 5) return "4-5";
  if (zoom <= 8) return "6-8";
  return "9+";
}

export function getModeVisibility(modeId, zoom) {
  const mode = MODES[modeId];
  if (!mode) return { show: false, opacity: 0, labelVisible: false };
  const tierKey = getZoomTierKey(zoom);
  return mode.zoomTiers[tierKey] || { show: false, opacity: 0, labelVisible: false };
}

export default MODES;
