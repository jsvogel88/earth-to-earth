/**
 * Canonical network city identity — single source for node ID resolution and edge endpoints.
 */

import {
  normalizeCityKey,
  buildPhase1CoordinateRegistry,
} from '../data/hyperloopPhase1Cities.js';
import {
  networkCityId,
  getNetworkCityByNameCountry,
  worldCityKey,
  normalizeCountryKey,
} from '../data/worldCities.js';
import { lookupCityCoordinates } from '../data/cityCoordinateLookup.js';
import { hasCoordinates } from '../data/planningLayers.js';

export { networkCityId as canonicalNetworkCityId };

export function resolveCanonicalNodeId(name, country = '', existingId = null) {
  if (existingId?.startsWith('net:')) {
    const curated = country
      ? getNetworkCityByNameCountry(name, country)
      : null;
    if (curated?.id && existingId === curated.id) return existingId;
    if (country && existingId === networkCityId(name, country)) return existingId;
  }
  const canonCountry = normalizeCountryKey(country);
  if (canonCountry) {
    const curated = getNetworkCityByNameCountry(name, canonCountry);
    if (curated?.id) return curated.id;
    const curatedRaw = getNetworkCityByNameCountry(name, country);
    if (curatedRaw?.id) return curatedRaw.id;
  }
  return networkCityId(name, canonCountry || country);
}

export function canonicalIdForNode(node) {
  if (!node) return null;
  if (node.networkCityId?.startsWith('net:')) return node.networkCityId;
  if (node.id?.startsWith('net:')) return node.id;
  return resolveCanonicalNodeId(node.name, node.country, node.id);
}

/**
 * @param {object[]} nodes
 */
export function buildCanonicalNodeIndex(nodes = []) {
  const byId = new Map();
  const byNameKey = new Map();
  const byWorldKey = new Map();

  nodes.forEach((node) => {
    if (!node?.name) return;
    const canonicalId = canonicalIdForNode(node);
    const prev = byId.get(canonicalId);
    const merged = prev
      ? {
          ...prev,
          ...node,
          id: canonicalId,
          networkCityId: canonicalId,
          isActiveE2EHub: Boolean(prev.isActiveE2EHub || node.isActiveE2EHub),
          isE2EHub: Boolean(prev.isE2EHub || node.isE2EHub),
          isSwitchNode: Boolean(prev.isSwitchNode || node.isSwitchNode),
          connectedToTrunk: Boolean(prev.connectedToTrunk || node.connectedToTrunk),
          renderable: prev.renderable !== false && node.renderable !== false,
        }
      : { ...node, id: canonicalId, networkCityId: canonicalId };

    byId.set(canonicalId, merged);
    byNameKey.set(normalizeCityKey(node.name), merged);
    byWorldKey.set(worldCityKey(node.name, node.country), merged);
  });

  return { byId, byNameKey, byWorldKey };
}

function preferCoords(curated, registryCoords, lookup) {
  if (curated?.lat != null && curated?.lon != null) {
    return {
      name: curated.name,
      country: curated.country,
      continent: curated.continent,
      lat: curated.lat,
      lon: curated.lon,
    };
  }
  if (registryCoords) return registryCoords;
  if (lookup) return lookup;
  return null;
}

/**
 * Resolve an existing graph node or build a canonical node stub (no duplicate IDs).
 */
export function resolveCanonicalGraphNode({
  cityName,
  country = null,
  coordRegistry = null,
  index = null,
  roiHubNames = null,
  defaults = {},
}) {
  const registry = coordRegistry || buildPhase1CoordinateRegistry([]);
  const key = normalizeCityKey(cityName);
  const curated =
    country != null
      ? getNetworkCityByNameCountry(cityName, country)
      : getNetworkCityByNameCountry(cityName, registry.get(key)?.country || '');
  const registryCoords = registry.get(key);
  const lookup = lookupCityCoordinates(cityName);
  const coords = preferCoords(curated, registryCoords, lookup);
  if (!coords || !hasCoordinates(coords)) return null;

  const resolvedCountry = country || coords.country || curated?.country || '';
  const canonicalId = resolveCanonicalNodeId(coords.name || cityName, resolvedCountry);

  if (index?.byId?.has(canonicalId)) return index.byId.get(canonicalId);
  if (index?.byWorldKey?.has(worldCityKey(coords.name || cityName, resolvedCountry))) {
    return index.byWorldKey.get(worldCityKey(coords.name || cityName, resolvedCountry));
  }
  if (index?.byNameKey?.has(normalizeCityKey(coords.name || cityName))) {
    return index.byNameKey.get(normalizeCityKey(coords.name || cityName));
  }

  const isE2E = roiHubNames?.has(normalizeCityKey(coords.name || cityName));
  return {
    id: canonicalId,
    networkCityId: canonicalId,
    name: coords.name || cityName,
    country: resolvedCountry,
    continent: coords.continent || curated?.continent || '',
    lat: coords.lat,
    lon: coords.lon,
    tier: isE2E ? 0 : 2,
    isE2EHub: Boolean(isE2E),
    isActiveE2EHub: Boolean(isE2E),
    isSwitchNode: Boolean(defaults.isSwitchNode),
    allowsSplitOff: defaults.allowsSplitOff !== false,
    connectedToTrunk: defaults.connectedToTrunk !== false,
    renderable: true,
    nodeType: defaults.nodeType || 'HYPERLOOP_CITY',
    ...defaults,
  };
}

function nodeRank(node) {
  if (node.isActiveE2EHub) return 4;
  if (node.isE2EHub) return 3;
  if (node.isSwitchNode) return 2;
  if (node.connectedToTrunk) return 1;
  return 0;
}

/**
 * Collapse duplicate nodes that share the same canonical networkCityId.
 * @returns {{ nodes: object[], idRemap: Map<string, string>, mergedCount: number }}
 */
export function deduplicateNodesByNetworkCityId(nodes = []) {
  const groups = new Map();

  nodes.forEach((node) => {
    if (!node?.name) return;
    const canonicalId = canonicalIdForNode(node);
    if (!groups.has(canonicalId)) groups.set(canonicalId, []);
    groups.get(canonicalId).push(node);
  });

  const idRemap = new Map();
  const deduped = [];

  groups.forEach((variants, canonicalId) => {
    const sorted = [...variants].sort((a, b) => nodeRank(b) - nodeRank(a));
    const primary = sorted[0];
    const merged = {
      ...primary,
      id: canonicalId,
      networkCityId: canonicalId,
      renderable: variants.some((n) => n.renderable !== false),
      isActiveE2EHub: variants.some((n) => n.isActiveE2EHub),
      isE2EHub: variants.some((n) => n.isE2EHub),
      isSwitchNode: variants.some((n) => n.isSwitchNode),
      connectedToTrunk: variants.some((n) => n.connectedToTrunk),
    };
    deduped.push(merged);
    variants.forEach((v) => {
      if (v.id && v.id !== canonicalId) idRemap.set(v.id, canonicalId);
    });
  });

  return {
    nodes: deduped,
    idRemap,
    mergedCount: nodes.length - deduped.length,
  };
}

/**
 * Rewire edge from/to to canonical node IDs and refresh endpoint node refs.
 */
export function normalizeEdgeEndpoints(edges = [], nodes = [], idRemap = new Map()) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const remapId = (id, nodeRef) => {
    if (!id) return id;
    if (idRemap.has(id)) return idRemap.get(id);
    if (nodeRef) {
      const preferred = canonicalIdForNode(nodeRef);
      if (idRemap.has(preferred)) return idRemap.get(preferred);
      if (nodeById.has(preferred)) return preferred;
    }
    return id;
  };

  edges.forEach((edge) => {
    if (!edge) return;

    const fromId = remapId(edge.from, edge.fromNode);
    const toId = remapId(edge.to, edge.toNode);

    edge.from = fromId;
    edge.to = toId;
    edge.fromNode = nodeById.get(fromId) || edge.fromNode;
    edge.toNode = nodeById.get(toId) || edge.toNode;
  });

  return edges;
}
