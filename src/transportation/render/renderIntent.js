import { TRANSPORTATION_MODES, ROUTE_TYPES } from '../registries/index.js';

/**
 * Normalize edge render intent so graph logic stays separate from map geometry.
 *
 * This is additive: it does not remove legacy `render` blocks.
 */
export function normalizeRenderIntent(edge) {
  const mode = edge?.taxonomyMode ?? edge?.mode;
  const routeType = edge?.taxonomyRouteType ?? edge?.routeType ?? edge?.route_type;

  const legacyAltitude = edge?.render?.altitudeMode ?? null;
  const isArc =
    legacyAltitude === 'arc' ||
    mode === TRANSPORTATION_MODES.E2E_STARSHIP ||
    mode === TRANSPORTATION_MODES.E2M ||
    mode === TRANSPORTATION_MODES.CARGO ||
    mode === TRANSPORTATION_MODES.LOGISTICS;

  const geometryType = isArc
    ? 'arc'
    : mode === TRANSPORTATION_MODES.ROBOTAXI || mode === TRANSPORTATION_MODES.AUTONOMOUS_AUTO
      ? 'halo'
      : 'ground';

  const arcHeight =
    mode === TRANSPORTATION_MODES.E2E_STARSHIP
      ? 'high'
      : mode === TRANSPORTATION_MODES.E2M || mode === TRANSPORTATION_MODES.CARGO || mode === TRANSPORTATION_MODES.LOGISTICS
        ? 'medium'
        : 'low';

  const colorKey =
    mode === TRANSPORTATION_MODES.E2E_STARSHIP
      ? 'e2e_blue'
      : mode === TRANSPORTATION_MODES.E2M || mode === TRANSPORTATION_MODES.CARGO || mode === TRANSPORTATION_MODES.LOGISTICS
        ? 'e2m_orange'
        : mode === TRANSPORTATION_MODES.HYPERLOOP_SPINE
          ? 'hyperloop_cyan'
          : mode === TRANSPORTATION_MODES.ROBOTAXI || mode === TRANSPORTATION_MODES.AUTONOMOUS_AUTO
            ? 'auto_teal'
            : 'default';

  const thickness =
    mode === TRANSPORTATION_MODES.E2E_STARSHIP
      ? 'thick'
      : mode === TRANSPORTATION_MODES.E2M || mode === TRANSPORTATION_MODES.CARGO
        ? 'medium'
        : routeType === ROUTE_TYPES.FEEDER_ROUTE
          ? 'thin'
          : 'medium';

  const dashed =
    mode === TRANSPORTATION_MODES.PLANNING ||
    routeType === ROUTE_TYPES.PLANNING_EDGE ||
    edge?.render?.lineStyle === 'dashed' ||
    edge?.render?.lineStyle === 'dotted';

  return {
    geometryType,
    renderAsArc: geometryType === 'arc',
    arcHeight,
    visual: {
      colorKey,
      thickness,
      opacity: 0.8,
      dashed: Boolean(dashed),
      glow: edge?.render?.lineStyle === 'glow' || mode === TRANSPORTATION_MODES.E2E_STARSHIP,
    },
  };
}

