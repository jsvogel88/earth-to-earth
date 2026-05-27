/**
 * Canonical geometry types for route render intent.
 */
export const GEOMETRY_TYPES = {
  ARC: 'arc',
  GROUND: 'ground',
  HALO: 'halo',
  CONNECTOR: 'connector',
  DASHED_PLANNING: 'dashed_planning',
};

export const GEOMETRY_TYPE_IDS = new Set(Object.values(GEOMETRY_TYPES));

export function isGeometryType(value) {
  return GEOMETRY_TYPE_IDS.has(value);
}

export const ARC_HEIGHTS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  INTERPLANETARY: 'interplanetary',
};
