/**
 * Planning overlay geometry — preview-only paths and hub halos.
 * Never mutates the official planetary graph.
 */

import { normalizeCityKey } from '../data/hyperloopPhase1Cities.js';
import { CORRIDOR_STATUS, CORRIDOR_TYPES } from '../data/corridorPlanningSchema.js';
import { getValidatedGlobalCorridors } from '../data/globalConnectivityCorridors.js';
import { isOverlayVisibleAtZoom, PLANNING_DECK_LAYER_IDS } from './overlayRegistry.js';
import { CIVILIZATION_ANCHORS, PLANETARY_LABEL_ALLOWLIST } from '../map/visualHierarchy.js';
import { PLANETARY_HALO_TIER_MAX } from '../graph/planetaryRouteCap.js';

const ANCHOR_KEYS = new Set(Object.keys(CIVILIZATION_ANCHORS));

function isPlanetaryAnchor(hub) {
  const id = String(hub?.id ?? hub?.networkCityId ?? hub?.name ?? '')
    .toLowerCase()
    .replace(/^node:city:/, '')
    .replace(/\s+/g, '_');
  return ANCHOR_KEYS.has(id) || [...PLANETARY_LABEL_ALLOWLIST].some((k) => id.includes(k));
}

export const PLANNING_CORRIDOR_STYLES = {
  [CORRIDOR_TYPES.GLOBAL_TRUNK]: {
    color: [100, 200, 255, 200],
    width: 4.5,
    dash: [12, 6],
  },
  [CORRIDOR_TYPES.CONTINENTAL_TRUNK]: {
    color: [60, 180, 255, 190],
    width: 3.5,
    dash: [10, 5],
  },
  [CORRIDOR_TYPES.REGIONAL_FEEDER]: {
    color: [0, 210, 230, 170],
    width: 2.5,
    dash: [8, 4],
  },
  [CORRIDOR_TYPES.POLAR_ARCTIC]: {
    color: [180, 230, 255, 180],
    width: 3,
    dash: [6, 5],
  },
  [CORRIDOR_TYPES.UNDERSEA_CONCEPT]: {
    color: [40, 120, 255, 160],
    width: 3,
    dash: [4, 6],
  },
};

const STATUS_OPACITY = {
  [CORRIDOR_STATUS.CONCEPTUAL]: 0.55,
  [CORRIDOR_STATUS.STRATEGIC_STUDY]: 0.65,
  [CORRIDOR_STATUS.FUTURE]: 0.5,
  [CORRIDOR_STATUS.PLANNING]: 0.75,
  [CORRIDOR_STATUS.OFFICIAL]: 0.9,
};

function resolveNodeCoord(name, nodesByKey, worldCityIndex) {
  const key = normalizeCityKey(name);
  const fromGraph = nodesByKey.get(key);
  if (fromGraph?.lat != null && fromGraph.lon != null) {
    return [fromGraph.lon, fromGraph.lat];
  }
  const fromWorld = worldCityIndex?.get(key);
  if (fromWorld?.lat != null && (fromWorld.lon != null || fromWorld.lng != null)) {
    return [fromWorld.lon ?? fromWorld.lng, fromWorld.lat];
  }
  return null;
}

/**
 * @param {object} corridor
 * @param {Map<string, object>} nodesByKey
 * @param {Map<string, object>} [worldCityIndex]
 */
export function buildCorridorPathSegments(corridor, nodesByKey, worldCityIndex) {
  const names =
    corridor.intermediateNodes?.length >= 2
      ? corridor.intermediateNodes
      : [corridor.startNode, corridor.endNode].filter(Boolean);

  const coords = [];
  for (const name of names) {
    const c = resolveNodeCoord(name, nodesByKey, worldCityIndex);
    if (c) coords.push(c);
  }
  if (coords.length < 2) return [];

  const style = PLANNING_CORRIDOR_STYLES[corridor.corridorType] || PLANNING_CORRIDOR_STYLES[CORRIDOR_TYPES.GLOBAL_TRUNK];
  const opacityScale = STATUS_OPACITY[corridor.status] ?? 0.7;

  const segments = [];
  for (let i = 0; i < coords.length - 1; i += 1) {
    segments.push({
      id: `${corridor.id}-seg-${i}`,
      path: [coords[i], coords[i + 1]],
      name: corridor.name,
      corridorType: corridor.corridorType,
      status: corridor.status,
      previewOnly: true,
      planningOverlay: true,
      routeClass: 'GLOBAL_MACRO_CORRIDOR',
      color: style.color.map((v, idx) => (idx === 3 ? Math.round(v * opacityScale) : v)),
      width: style.width,
      dash: style.dash,
      notes: corridor.notes,
      minZoom: corridor.minZoom ?? 0,
    });
  }
  return segments;
}

/**
 * @param {object[]} graphNodes
 * @param {object[]} [corridors]
 * @param {object[]} [worldCities]
 */
export function buildGlobalConnectivityPaths(graphNodes, corridors = getValidatedGlobalCorridors(), worldCities = []) {
  const nodesByKey = new Map();
  graphNodes.forEach((n) => {
    if (n.nameKey) nodesByKey.set(n.nameKey, n);
    else if (n.name) nodesByKey.set(normalizeCityKey(n.name), n);
  });
  const worldCityIndex = new Map();
  worldCities.forEach((c) => {
    if (c.name) worldCityIndex.set(normalizeCityKey(c.name), c);
  });

  return corridors.flatMap((c) => buildCorridorPathSegments(c, nodesByKey, worldCityIndex));
}

export function filterPlanningPathsByZoom(paths, zoom) {
  return paths.filter((p) => {
    const min = p.minZoom ?? 0;
    return zoom >= min;
  });
}

/**
 * Intermodal hub halo scatter points (preview styling).
 * @param {object[]} hubs
 * @param {number} zoom
 */
export function buildIntermodalHubHalos(hubs, zoom) {
  if (zoom > 5.5) return [];
  const z = Number(zoom) || 2;
  const planetary = z < 3;
  return hubs
    .filter((h) => h.lat != null && h.lon != null)
    .filter((h) => {
      if (!planetary) return true;
      return isPlanetaryAnchor(h) || (h.tier ?? 3) <= PLANETARY_HALO_TIER_MAX;
    })
    .map((h) => ({
      id: `halo-${h.id || h.name}`,
      name: h.name,
      lat: h.lat,
      lon: h.lon,
      isE2EHub: Boolean(h.isE2EHub),
      isIntermodal: Boolean(h.isE2EHub || h.isSwitchNode || h.e2mLayer),
      previewOnly: true,
      radius: h.isE2EHub ? 22000 : h.isSwitchNode ? 16000 : 11000,
    }));
}

export function buildE2EHubHalos(activeHubs, zoom) {
  if (zoom > 4) return [];
  const z = Number(zoom) || 2;
  return activeHubs
    .filter((h) => h.lat != null && h.lon != null)
    .filter((h) => (z >= 3 ? true : isPlanetaryAnchor(h)))
    .map((h) => ({
      id: `e2e-halo-${h.id}`,
      name: h.name,
      lat: h.lat,
      lon: h.lon,
      previewOnly: true,
      radius: 24000,
    }));
}

export { PLANNING_DECK_LAYER_IDS };
