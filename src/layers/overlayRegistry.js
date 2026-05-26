/**
 * Overlay registry — extended metadata for planning vs official map layers.
 * Complements MAP_LAYER_REGISTRY; does not generate graph edges.
 */

import { MAP_LAYER_REGISTRY, LAYER_TYPES } from './layerRegistry.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';

export const OVERLAY_CATEGORIES = {
  GLOBAL_TRUNK: 'global_trunk',
  REGIONAL_FEEDER: 'regional_feeder',
  LOCAL_SERVICE: 'local_service',
  E2E_ARC: 'e2e_arc',
  E2M_ORBITAL: 'e2m_orbital',
  HYPERLOOP_CORRIDOR: 'hyperloop_corridor',
  ROBOTAXI_ZONE: 'robotaxi_zone',
  CIVILIZATION_MACRO: 'civilization_macro',
  CUSTOM_PREVIEW: 'custom_preview',
  PARSED_PREVIEW: 'parsed_preview',
  METRIC_FUTURE: 'metric_future',
};

export const DATA_SOURCE_TYPES = {
  OFFICIAL_GRAPH: 'official_graph',
  PLANNING_MANUAL: 'planning_manual',
  USER_CUSTOM: 'user_custom',
  PARSED_BULK: 'parsed_bulk',
  GENERATED_OVERLAY: 'generated_overlay',
};

/** Deck layer ids for planning-only overlays (not in MAP_LAYER_REGISTRY) */
export const PLANNING_DECK_LAYER_IDS = {
  GLOBAL_CONNECTIVITY: 'global-connectivity-corridors',
  PLANETARY_SKELETON_TRUNKS: 'planetary-skeleton-trunks',
  PLANETARY_SKELETON_HUBS: 'planetary-skeleton-hubs',
  INTERMODAL_HUB_HALOS: 'intermodal-hub-halos',
  E2E_HUB_HALOS: 'e2e-hub-halos',
};

/**
 * @typedef {Object} OverlayDefinition
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} [transportMode]
 * @property {number} minZoom
 * @property {number} maxZoom
 * @property {string} dataSource
 * @property {boolean} previewOnly
 * @property {string} [deckLayerId]
 * @property {string} [renderLayerType]
 * @property {object} [style]
 * @property {object} [legend]
 * @property {string} [tooltipBehavior]
 */

/** @type {OverlayDefinition[]} */
const PLANNING_OVERLAY_DEFS = [
  {
    id: 'overlay_global_connectivity',
    name: 'Global connectivity corridors',
    category: OVERLAY_CATEGORIES.GLOBAL_TRUNK,
    transportMode: TRANSPORT_MODES.CIVILIZATION_GRID,
    minZoom: 0,
    maxZoom: 22,
    dataSource: DATA_SOURCE_TYPES.PLANNING_MANUAL,
    previewOnly: true,
    deckLayerId: PLANNING_DECK_LAYER_IDS.GLOBAL_CONNECTIVITY,
    renderLayerType: 'path',
    style: { dash: [10, 6], width: 3.5, muted: true },
    legend: { label: 'Conceptual macro corridor', group: 'planning' },
    tooltipBehavior: 'corridor_name_status',
  },
  {
    id: 'overlay_planetary_skeleton',
    name: 'Planetary mobility skeleton',
    category: OVERLAY_CATEGORIES.CIVILIZATION_MACRO,
    minZoom: 0,
    maxZoom: 22,
    dataSource: DATA_SOURCE_TYPES.OFFICIAL_GRAPH,
    previewOnly: false,
    deckLayerId: PLANNING_DECK_LAYER_IDS.PLANETARY_SKELETON_TRUNKS,
    renderLayerType: 'path',
    legend: { label: 'Official trunk (read-only slice)', group: 'infrastructure' },
    tooltipBehavior: 'route_class',
  },
  {
    id: 'overlay_intermodal_halos',
    name: 'Intermodal hub halos',
    category: OVERLAY_CATEGORIES.LOCAL_SERVICE,
    minZoom: 0,
    maxZoom: 5.5,
    dataSource: DATA_SOURCE_TYPES.GENERATED_OVERLAY,
    previewOnly: true,
    deckLayerId: PLANNING_DECK_LAYER_IDS.INTERMODAL_HUB_HALOS,
    renderLayerType: 'scatter',
    legend: { label: 'Major intermodal hub', group: 'hubs' },
    tooltipBehavior: 'hub_name',
  },
  {
    id: 'overlay_robotaxi_zones',
    name: 'Hub mobility service zones',
    category: OVERLAY_CATEGORIES.ROBOTAXI_ZONE,
    transportMode: TRANSPORT_MODES.ROBOTAXI,
    minZoom: 4,
    maxZoom: 22,
    dataSource: DATA_SOURCE_TYPES.GENERATED_OVERLAY,
    previewOnly: true,
    deckLayerId: 'robotaxi-service-zones',
    renderLayerType: 'polygon',
    legend: { label: 'Local autonomous zone', group: 'autonomous' },
    tooltipBehavior: 'hub_zone',
  },
];

/**
 * Build overlay catalog from registry + planning defs.
 * @returns {OverlayDefinition[]}
 */
export function buildOverlayCatalog() {
  const fromRegistry = MAP_LAYER_REGISTRY.filter(
    (l) => l.layerType === LAYER_TYPES.OVERLAY || l.deckLayerId
  ).map((l) => ({
    id: `registry_${l.id}`,
    name: l.label,
    category: mapRegistryToCategory(l),
    transportMode: l.transportMode,
    minZoom: l.minZoom ?? 0,
    maxZoom: l.maxZoom ?? 22,
    dataSource: l.id?.includes('custom') || l.id?.includes('parsed')
      ? DATA_SOURCE_TYPES.USER_CUSTOM
      : l.id?.includes('e2m')
        ? DATA_SOURCE_TYPES.GENERATED_OVERLAY
        : DATA_SOURCE_TYPES.OFFICIAL_GRAPH,
    previewOnly: Boolean(
      l.id?.includes('custom') ||
        l.id?.includes('parsed') ||
        l.id?.includes('preview') ||
        l.description?.includes('planning') ||
        l.description?.includes('no')
    ),
    deckLayerId: l.deckLayerId,
    renderLayerType: 'toggle',
    legend: l.legendGroup ? { group: l.legendGroup } : null,
    tooltipBehavior: 'default',
  }));

  return [...fromRegistry, ...PLANNING_OVERLAY_DEFS];
}

function mapRegistryToCategory(layer) {
  if (layer.id?.includes('robotaxi')) return OVERLAY_CATEGORIES.ROBOTAXI_ZONE;
  if (layer.id?.includes('e2m')) return OVERLAY_CATEGORIES.E2M_ORBITAL;
  if (layer.id?.includes('custom') || layer.id?.includes('preview')) {
    return OVERLAY_CATEGORIES.CUSTOM_PREVIEW;
  }
  if (layer.id?.includes('parsed')) return OVERLAY_CATEGORIES.PARSED_PREVIEW;
  if (layer.id?.includes('world_planning')) return OVERLAY_CATEGORIES.CIVILIZATION_MACRO;
  return OVERLAY_CATEGORIES.HYPERLOOP_CORRIDOR;
}

export function getOverlayById(id) {
  return buildOverlayCatalog().find((o) => o.id === id) ?? null;
}

export function getOverlaysByCategory(category) {
  return buildOverlayCatalog().filter((o) => o.category === category);
}

export function isOverlayVisibleAtZoom(overlay, zoom) {
  if (!overlay) return false;
  if (overlay.minZoom != null && zoom < overlay.minZoom) return false;
  if (overlay.maxZoom != null && zoom > overlay.maxZoom) return false;
  return true;
}

export function isPlanningOverlay(overlay) {
  return Boolean(overlay?.previewOnly);
}
