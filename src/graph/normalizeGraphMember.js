/**
 * Normalize nodes/edges into the Planetary Mobility graph membership model.
 * Backend intelligence: taxonomy + render intent. Visual geometry chosen downstream.
 */

import { getTaxonomyMode, getTaxonomyNodeType, getTaxonomyRouteType } from '../data/transport/taxonomyBridge.js';
import { normalizeRenderIntent } from '../transportation/render/renderIntent.js';
import { validateEdgeTaxonomy, validateNodeTaxonomy } from '../transportation/validators/taxonomyValidation.js';
import { enrichEdgeRecord } from '../data/corridorRouteRegistry.js';
import { GRAPH_MEMBERSHIP } from './graphMembership.js';
import { CITY_STATUS } from '../transportation/registries/cityStatus.js';
import { NODE_TYPES } from '../transportation/registries/nodeTypes.js';

const DEV_TAXONOMY =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV;

/**
 * @param {object} node
 * @param {{ membership?: string }} [options]
 */
export function normalizeGraphNode(node, options = {}) {
  if (!node?.id) return null;

  const membership = options.membership ?? node.graphMembership ?? GRAPH_MEMBERSHIP.OFFICIAL;
  const cityStatus = node.cityStatus ?? node.city_status ?? inferCityStatus(node, membership);
  const nodeTypes = node.nodeTypes ?? (node.nodeType ? [node.nodeType] : [getTaxonomyNodeType(node)]);

  const normalized = {
    ...node,
    graphMembership: membership,
    cityStatus,
    nodeTypes,
    nodeType: node.nodeType ?? nodeTypes[0],
    taxonomyNodeType: node.taxonomyNodeType ?? getTaxonomyNodeType(node),
    lat: node.lat ?? node.latitude ?? null,
    lon: node.lon ?? node.longitude ?? node.lng ?? null,
    latitude: node.latitude ?? node.lat ?? null,
    longitude: node.longitude ?? node.lon ?? node.lng ?? null,
    hasCoordinates:
      node.hasCoordinates ??
      (Number.isFinite(node.latitude ?? node.lat) && Number.isFinite(node.longitude ?? node.lon ?? node.lng)),
    taxonomyErrors: DEV_TAXONOMY
      ? validateNodeTaxonomy({ cityStatus, nodeTypes, nodeType: nodeTypes[0] })
      : [],
  };

  return normalized;
}

/**
 * @param {object} edge
 * @param {{ membership?: string }} [options]
 */
export function normalizeGraphEdge(edge, options = {}) {
  if (!edge?.id) return null;

  const enriched = enrichEdgeRecord(edge);
  const mode = enriched.mode ?? enriched.edgeMode;
  const routeType = enriched.routeType ?? enriched.route_type;
  const taxonomyMode = enriched.taxonomyMode ?? getTaxonomyMode(mode, routeType);
  const taxonomyRouteType =
    enriched.taxonomyRouteType ??
    (routeType ? getTaxonomyRouteType({ routeType }) : null) ??
    taxonomyMode;

  const membership = options.membership ?? edge.graphMembership ?? GRAPH_MEMBERSHIP.OFFICIAL;

  const base = {
    ...enriched,
    graphMembership: membership,
    mode,
    routeType,
    route_type: routeType,
    taxonomyMode,
    taxonomyRouteType,
    fromNodeId: enriched.fromNodeId ?? enriched.origin_id,
    toNodeId: enriched.toNodeId ?? enriched.destination_id,
    taxonomyErrors: DEV_TAXONOMY
      ? validateEdgeTaxonomy({ mode: taxonomyMode, routeType: taxonomyRouteType })
      : [],
  };

  return { ...base, ...normalizeRenderIntent(base) };
}

function inferCityStatus(node, membership) {
  if (membership === GRAPH_MEMBERSHIP.OVERLAY) {
    if (node.overlayKind === 'custom') return CITY_STATUS.CUSTOM;
    if (node.overlayKind === 'parsed') return CITY_STATUS.PARSED;
    if (node.overlayKind === 'starbase') return CITY_STATUS.PLANNING;
  }
  if (node.isPlanning || node.status === 'planning') return CITY_STATUS.PLANNING;
  if (node.isE2EHub || node.tier === 1) return CITY_STATUS.OFFICIAL;
  return node.cityStatus ?? CITY_STATUS.CANDIDATE;
}

/**
 * Starbase hub record → overlay graph node (never auto-promoted to official).
 * @param {object} hub
 */
export function starbaseHubToOverlayNode(hub) {
  const [lon, lat] = hub.coordinates ?? [];
  const nodeTypes = [NODE_TYPES.STRATEGIC_NODE];
  if ((hub.hubRoles ?? []).includes('E2E')) nodeTypes.push(NODE_TYPES.E2E_LAUNCH_HUB);
  if ((hub.hubRoles ?? []).includes('RE2E') || (hub.hubRoles ?? []).includes('PETABOND_EXPORT')) {
    nodeTypes.push(NODE_TYPES.E2M_HUB);
  }

  return normalizeGraphNode(
    {
      id: `overlay:starbase:${hub.id}`,
      name: hub.name,
      latitude: lat,
      longitude: lon,
      lat,
      lon,
      planet: hub.planet,
      starbaseClass: hub.starbaseClass,
      hubRoles: hub.hubRoles ?? [],
      status: hub.status,
      overlayKind: 'starbase',
      sourceHubId: hub.id,
      nodeTypes,
      modes: ['e2m', 'e2e_starship', 'hyperloop'],
      tags: ['starbase', 'overlay'],
      isPlanning: hub.status !== 'ACTIVE',
    },
    { membership: GRAPH_MEMBERSHIP.OVERLAY }
  );
}

/**
 * @param {object} dest — user custom destination
 */
export function customDestinationToOverlayNode(dest) {
  return normalizeGraphNode(
    {
      id: dest.id?.startsWith('custom:') ? dest.id : `overlay:custom:${dest.id}`,
      name: dest.name,
      country: dest.country,
      latitude: dest.lat,
      longitude: dest.lon,
      lat: dest.lat,
      lon: dest.lon,
      population: dest.population,
      overlayKind: 'custom',
      selectedRole: dest.selectedRole,
      connectionMode: dest.connectionMode,
      nodeTypes: [NODE_TYPES.CUSTOM_DESTINATION],
      modes: dest.enabledLayers ?? [],
      tags: ['custom_destination', 'overlay'],
    },
    { membership: GRAPH_MEMBERSHIP.OVERLAY }
  );
}

/**
 * @param {object} parsed — parsed city overlay
 */
export function parsedCityToOverlayNode(parsed) {
  return normalizeGraphNode(
    {
      id: parsed.id?.startsWith('parsed:') ? parsed.id : `overlay:parsed:${parsed.id}`,
      name: parsed.name ?? parsed.label,
      country: parsed.country,
      latitude: parsed.lat ?? parsed.latitude,
      longitude: parsed.lon ?? parsed.longitude,
      overlayKind: 'parsed',
      nodeTypes: [NODE_TYPES.PARSED_CITY],
      modes: parsed.modes ?? [],
      tags: ['parsed_city', 'overlay'],
    },
    { membership: GRAPH_MEMBERSHIP.OVERLAY }
  );
}
