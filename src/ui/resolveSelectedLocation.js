/**
 * Resolve map click / search payloads into classified integrated locations.
 */

import {
  classifyCity,
  classifyMineralHub,
  getEnabledModes,
  isTransferHub,
} from '../modes/classifyLocation.js';
import { normalizeNodeId } from '../graph/integratedGraphTypes.js';
import { getMineralHubById, DEFAULT_MINERAL_HUBS } from '../data/mineralHubs.js';
import { getNetworkCityById } from '../data/worldCities.js';

/**
 * @param {object} raw
 * @returns {boolean}
 */
export function isMineralHubPayload(raw) {
  if (!raw) return false;
  return Boolean(
    raw.mineral_hub_id ||
      raw.mineral_type ||
      raw.nodeType === 'e2m_hub' ||
      raw.nodeType === 'mineral_hub' ||
      raw.isMineralHub ||
      raw.hubKind === 'mineral'
  );
}

/**
 * @param {object} raw
 * @returns {object | null}
 */
export function resolveSelectedLocation(raw) {
  if (!raw) return null;

  if (raw.isStarbaseHub && raw.starbaseDetail) {
    const hub = raw.starbaseDetail;
    return {
      ...hub,
      name: hub.name ?? raw.name,
      lat: raw.lat ?? hub.coordinates?.[1],
      lon: raw.lon ?? hub.coordinates?.[0],
      locationType: 'starbase_hub',
      isStarbaseHub: true,
      starbaseDetail: hub,
    };
  }

  if (raw.mineral_hub_id) {
    const hub = getMineralHubById(raw.mineral_hub_id) ?? raw;
    return classifyMineralHub(normalizeMineralRecord(hub));
  }

  if (isMineralHubPayload(raw)) {
    return classifyMineralHub(normalizeMineralRecord(raw));
  }

  const networkId = raw.networkCityId ?? raw.city_id ?? raw.id;
  const canonical = networkId?.startsWith('net:') ? getNetworkCityById(networkId) : null;

  const merged = {
    ...(canonical ?? {}),
    ...raw,
    lat: raw.lat ?? raw.latitude ?? canonical?.lat,
    lon: raw.lon ?? raw.longitude ?? canonical?.lon,
    population: raw.population ?? canonical?.population,
  };

  const classified = classifyCity(merged);
  return {
    ...classified,
    locationType: classified.isE2EHub ? 'e2e_hub' : 'city',
    enabledModes: getEnabledModes(classified),
    transfer_hub: isTransferHub(classified),
  };
}

/**
 * @param {object} hub
 * @returns {object}
 */
function normalizeMineralRecord(hub) {
  return {
    ...hub,
    lat: hub.lat ?? hub.latitude,
    lon: hub.lon ?? hub.longitude,
    locationType: 'e2m_hub',
  };
}

/**
 * @param {string} nodeId
 * @param {object[]} nodes
 * @returns {object | null}
 */
export function findNodeById(nodeId, nodes) {
  if (!nodeId) return null;
  return (
    (nodes ?? []).find((n) => normalizeNodeId(n) === nodeId) ??
    getMineralHubById(nodeId) ??
    getNetworkCityById(nodeId) ??
    null
  );
}

/**
 * @param {string} refId
 * @param {object[]} nodes
 * @returns {string}
 */
export function resolveNodeDisplayName(refId, nodes) {
  if (!refId) return 'Not yet assigned';
  const node = findNodeById(refId, nodes);
  if (!node) return refId;
  return node.name ?? refId;
}

/**
 * @param {object} location
 * @param {object[]} edges
 * @returns {object[]}
 */
/**
 * Mode badges from classification + connected integrated edges (no mock data).
 * @param {object} location
 * @param {object[]} [connectedEdges]
 * @returns {string[]}
 */
export function deriveDisplayModes(location, connectedEdges = []) {
  if (!location) return [];
  const modes = new Set(getEnabledModes(location));

  for (const edge of connectedEdges ?? []) {
    const mode = edge.mode ?? edge.edgeMode;
    if (mode === 'hyperloop') modes.add('hyperloop');
    if (mode === 'e2m') modes.add('e2m');
    if (mode === 'e2e') modes.add('e2e');
    if (mode === 'loop') modes.add('loop');
    if (mode === 'auto') modes.add('auto');
  }

  if (location.auto_enabled) modes.add('auto');
  if (location.loop_enabled) modes.add('loop');
  if (location.e2e_eligible || location.isE2EHub) modes.add('e2e');
  if (location.e2m_enabled || location.mineral_hub_id) modes.add('e2m');
  if (location.hyperloop_connected) modes.add('hyperloop');

  return [...modes];
}

/**
 * @param {object} location
 * @param {object[]} edges
 * @returns {object[]}
 */
export function getConnectedEdgesForLocation(location, edges) {
  const id = normalizeNodeId(location);
  if (!id) return [];
  return (edges ?? []).filter((e) => {
    const a = e.origin_id ?? e.from;
    const b = e.destination_id ?? e.to;
    return a === id || b === id;
  });
}

/**
 * @param {object[]} edges
 * @param {object[]} allNodes
 * @returns {object[]}
 */
export function getConnectedNodesFromEdges(edges, allNodes) {
  const ids = new Set();
  for (const e of edges ?? []) {
    if (e.origin_id ?? e.from) ids.add(e.origin_id ?? e.from);
    if (e.destination_id ?? e.to) ids.add(e.destination_id ?? e.to);
  }
  return [...ids].map((id) => findNodeById(id, allNodes)).filter(Boolean);
}

/**
 * @param {object} cityLocation
 * @param {object[]} [mineralHubs]
 * @param {number} [maxCount]
 * @returns {object[]}
 */
export function findNearbyMineralHubs(
  cityLocation,
  mineralHubs = DEFAULT_MINERAL_HUBS,
  maxCount = 5
) {
  const lat = cityLocation?.lat ?? cityLocation?.latitude;
  const lon = cityLocation?.lon ?? cityLocation?.longitude;
  if (lat == null || lon == null) return [];

  const scored = (mineralHubs ?? [])
    .map((hub) => {
      const hLat = hub.latitude ?? hub.lat;
      const hLon = hub.longitude ?? hub.lon;
      if (hLat == null || hLon == null) return null;
      const dLat = ((hLat - lat) * Math.PI) / 180;
      const dLon = ((hLon - lon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((hLat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const km = 6371 * 2 * Math.asin(Math.sqrt(a));
      return { hub, km };
    })
    .filter(Boolean)
    .sort((a, b) => a.km - b.km)
    .slice(0, maxCount);

  return scored.map(({ hub }) => hub);
}
