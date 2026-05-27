/**
 * Centralized visual semantics for nodes and routes (registry-driven).
 */

import { TRANSPORTATION_MODES, ROUTE_TYPES } from '../registries/index.js';
import { GEOMETRY_TYPES } from '../registries/geometryTypes.js';
import { normalizeRenderIntent } from './renderIntent.js';
import { RENDER_INTENT_COLOR_TOKENS } from './renderIntentDeckStyle.js';
import { isE2MLocalGroundRoute } from '../../map/e2mGeometry.js';

/** Deck.gl RGB tuples keyed by semantic colorKey. */
export const MODE_COLOR_RGB = {
  [TRANSPORTATION_MODES.E2E_STARSHIP]: RENDER_INTENT_COLOR_TOKENS.e2e_blue,
  [TRANSPORTATION_MODES.E2E_FEEDER]: RENDER_INTENT_COLOR_TOKENS.e2e_blue,
  [TRANSPORTATION_MODES.E2M]: RENDER_INTENT_COLOR_TOKENS.e2m_orange,
  [TRANSPORTATION_MODES.CARGO]: RENDER_INTENT_COLOR_TOKENS.e2m_orange,
  [TRANSPORTATION_MODES.LOGISTICS]: RENDER_INTENT_COLOR_TOKENS.e2m_orange,
  [TRANSPORTATION_MODES.HYPERLOOP_SPINE]: RENDER_INTENT_COLOR_TOKENS.hyperloop_cyan,
  [TRANSPORTATION_MODES.REGIONAL_LOOP]: RENDER_INTENT_COLOR_TOKENS.hyperloop_cyan,
  [TRANSPORTATION_MODES.FEEDER_ROUTE]: RENDER_INTENT_COLOR_TOKENS.default,
  [TRANSPORTATION_MODES.ROBOTAXI]: RENDER_INTENT_COLOR_TOKENS.auto_teal,
  [TRANSPORTATION_MODES.AUTONOMOUS_AUTO]: RENDER_INTENT_COLOR_TOKENS.auto_teal,
};

/**
 * @param {string} mode
 * @returns {[number, number, number]}
 */
export function getModeColor(mode) {
  const key = MODE_COLOR_RGB[mode];
  if (key) return key;
  const intent = normalizeRenderIntent({ mode });
  return RENDER_INTENT_COLOR_TOKENS[intent.visual?.colorKey] ?? RENDER_INTENT_COLOR_TOKENS.default;
}

/**
 * @param {string} routeType
 * @returns {[number, number, number]}
 */
export function getRouteTypeColor(routeType) {
  if (
    routeType === ROUTE_TYPES.GLOBAL_ARC ||
    routeType === ROUTE_TYPES.E2E_PASSENGER_ROUTE ||
    routeType === ROUTE_TYPES.E2E_CARGO_ROUTE
  ) {
    return RENDER_INTENT_COLOR_TOKENS.e2e_blue;
  }
  if (
    routeType === ROUTE_TYPES.CARGO_CORRIDOR ||
    routeType === ROUTE_TYPES.RESOURCE_CORRIDOR ||
    routeType === ROUTE_TYPES.LOGISTICS_CORRIDOR
  ) {
    return RENDER_INTENT_COLOR_TOKENS.e2m_orange;
  }
  if (
    routeType === ROUTE_TYPES.CONTINENTAL_SPINE ||
    routeType === ROUTE_TYPES.GLOBAL_SPINE ||
    routeType === ROUTE_TYPES.REGIONAL_LOOP
  ) {
    return RENDER_INTENT_COLOR_TOKENS.hyperloop_cyan;
  }
  return RENDER_INTENT_COLOR_TOKENS.default;
}

/**
 * @param {object} edge
 * @returns {ReturnType<typeof normalizeRenderIntent> & { rgba: [number, number, number, number] }}
 */
export function getRouteVisualStyle(edge) {
  const intent = edge?.geometryType
    ? {
        geometryType: edge.geometryType,
        renderAsArc: edge.renderAsArc,
        arcHeight: edge.arcHeight,
        visual: edge.visual ?? {},
      }
    : normalizeRenderIntent(edge);

  const rgb =
    RENDER_INTENT_COLOR_TOKENS[intent.visual?.colorKey] ??
    getModeColor(edge?.taxonomyMode ?? edge?.mode);
  const opacity = intent.visual?.opacity ?? 0.8;
  return {
    ...intent,
    rgba: [rgb[0], rgb[1], rgb[2], Math.round(opacity * 255)],
  };
}

/**
 * @param {object} node
 * @returns {{ r: number, glowR?: number, glowOpacity?: number, color?: [number, number, number] }}
 */
export function getNodeVisualStyle(node) {
  const tier = node?.tier ?? 2;
  const baseR = tier === 1 ? 9 : tier === 2 ? 7 : 5;
  const modes = node?.modes ?? [];
  let color = [180, 200, 220];
  if (modes.includes(TRANSPORTATION_MODES.E2E_STARSHIP)) color = RENDER_INTENT_COLOR_TOKENS.e2e_blue;
  else if (modes.some((m) => m === 'e2m' || m === 'cargo')) color = RENDER_INTENT_COLOR_TOKENS.e2m_orange;
  else if (modes.includes(TRANSPORTATION_MODES.HYPERLOOP_SPINE)) color = RENDER_INTENT_COLOR_TOKENS.hyperloop_cyan;

  if (node?.overlayKind === 'starbase' || node?.isStarbaseHub) {
    return { r: 11, glowR: 20, glowOpacity: 0.15, color: [255, 80, 60] };
  }

  return {
    r: baseR,
    glowR: baseR + 6,
    glowOpacity: tier === 1 ? 0.12 : 0.06,
    color,
  };
}

/**
 * @param {object} node
 * @param {number} zoom
 * @returns {boolean}
 */
export function shouldRenderNodeAtZoom(node, zoom) {
  const z = Number(zoom) || 2;
  const tier = node?.tier ?? 3;
  if (node?.overlayKind || node?.isStarbaseHub) return true;
  if (tier === 1) return true;
  if (z >= 5) return true;
  if (z >= 3.5) return tier <= 2;
  if (z >= 2.5) return tier <= 2;
  return tier === 1;
}

/**
 * @param {object} edge
 * @param {number} zoom
 * @returns {boolean}
 */
export function shouldRenderEdgeAtZoom(edge, zoom) {
  const z = Number(zoom) || 2;
  const priority = edge?.priority_score ?? edge?.priority ?? 0.5;
  const tier = edge?.tier ?? 2;
  if (edge?.geometryType === GEOMETRY_TYPES.ARC || edge?.renderAsArc) {
    if (z < 2) return priority > 0.7 || tier === 1;
    return true;
  }
  if (z < 4 && tier > 2 && priority < 0.35) return false;
  return true;
}

/**
 * Re-export geometry helper for render intent normalization.
 * @param {object} edge
 */
export function resolveEdgeGeometryType(edge) {
  const mode = edge?.taxonomyMode ?? edge?.mode;
  if (mode === TRANSPORTATION_MODES.E2E_STARSHIP || mode === 'e2e') {
    return GEOMETRY_TYPES.ARC;
  }
  if (
    mode === TRANSPORTATION_MODES.E2M ||
    mode === TRANSPORTATION_MODES.CARGO ||
    mode === TRANSPORTATION_MODES.LOGISTICS ||
    mode === 'e2m'
  ) {
    if (isE2MLocalGroundRoute(edge)) return GEOMETRY_TYPES.GROUND;
    return GEOMETRY_TYPES.ARC;
  }
  if (mode === TRANSPORTATION_MODES.ROBOTAXI || mode === TRANSPORTATION_MODES.AUTONOMOUS_AUTO) {
    return GEOMETRY_TYPES.HALO;
  }
  if (mode === TRANSPORTATION_MODES.PLANNING) return GEOMETRY_TYPES.DASHED_PLANNING;
  return GEOMETRY_TYPES.GROUND;
}
