import { TRANSPORTATION_MODES, ROUTE_TYPES, GEOMETRY_TYPES } from '../registries/index.js';
import { isE2MLocalGroundRoute } from '../../map/e2mGeometry.js';

/**
 * Normalize edge render intent so graph logic stays separate from map geometry.
 *
 * This is additive: it does not remove legacy `render` blocks.
 */
export function normalizeRenderIntent(edge) {
  const mode = edge?.taxonomyMode ?? edge?.mode;
  const routeType = edge?.taxonomyRouteType ?? edge?.routeType ?? edge?.route_type;

  const legacyAltitude = edge?.render?.altitudeMode ?? null;

  let geometryType = GEOMETRY_TYPES.GROUND;
  if (legacyAltitude === 'arc') {
    geometryType = GEOMETRY_TYPES.ARC;
  } else if (mode === TRANSPORTATION_MODES.E2E_STARSHIP || mode === 'e2e') {
    geometryType = GEOMETRY_TYPES.ARC;
  } else if (
    mode === TRANSPORTATION_MODES.RE2E ||
    mode === TRANSPORTATION_MODES.E2M ||
    mode === TRANSPORTATION_MODES.CARGO ||
    mode === TRANSPORTATION_MODES.LOGISTICS ||
    mode === 'e2m' ||
    mode === 're2e'
  ) {
    geometryType = isE2MLocalGroundRoute(edge) ? GEOMETRY_TYPES.GROUND : GEOMETRY_TYPES.ARC;
  } else if (
    mode === TRANSPORTATION_MODES.ROBOTAXI ||
    mode === TRANSPORTATION_MODES.AUTONOMOUS_AUTO
  ) {
    geometryType = GEOMETRY_TYPES.HALO;
  } else if (mode === TRANSPORTATION_MODES.PLANNING) {
    geometryType = GEOMETRY_TYPES.DASHED_PLANNING;
  } else if (
    routeType === ROUTE_TYPES.FEEDER_ROUTE ||
    routeType === ROUTE_TYPES.LOCAL_CONNECTOR ||
    routeType === ROUTE_TYPES.LAST_MILE
  ) {
    geometryType = GEOMETRY_TYPES.CONNECTOR;
  }

  const isArc = geometryType === GEOMETRY_TYPES.ARC;

  const arcHeight =
    mode === TRANSPORTATION_MODES.E2E_STARSHIP
      ? 'high'
      : mode === TRANSPORTATION_MODES.RE2E ||
          mode === TRANSPORTATION_MODES.E2M ||
          mode === TRANSPORTATION_MODES.CARGO ||
          mode === TRANSPORTATION_MODES.LOGISTICS ||
          mode === 're2e'
        ? 'medium'
        : 'low';

  const colorKey =
    mode === TRANSPORTATION_MODES.E2E_STARSHIP
      ? 'e2e_blue'
      : mode === TRANSPORTATION_MODES.RE2E ||
          mode === TRANSPORTATION_MODES.E2M ||
          mode === TRANSPORTATION_MODES.CARGO ||
          mode === TRANSPORTATION_MODES.LOGISTICS
        ? 'e2m_orange'
        : mode === TRANSPORTATION_MODES.HYPERLOOP_SPINE
          ? 'hyperloop_cyan'
          : mode === TRANSPORTATION_MODES.ROBOTAXI || mode === TRANSPORTATION_MODES.AUTONOMOUS_AUTO
            ? 'auto_teal'
            : mode === TRANSPORTATION_MODES.PORT
              ? 'port_slate'
              : mode === TRANSPORTATION_MODES.RAIL
                ? 'rail_amber'
                : mode === TRANSPORTATION_MODES.ROAD
                  ? 'road_gray'
                  : mode === TRANSPORTATION_MODES.AIR
                    ? 'air_silver'
                    : mode === TRANSPORTATION_MODES.ENERGY
                      ? 'energy_green'
                      : 'default';

  const thickness =
    mode === TRANSPORTATION_MODES.E2E_STARSHIP
      ? 'thick'
      : mode === TRANSPORTATION_MODES.RE2E ||
          mode === TRANSPORTATION_MODES.E2M ||
          mode === TRANSPORTATION_MODES.CARGO
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

