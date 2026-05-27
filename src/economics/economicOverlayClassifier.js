/**
 * Classify routes/nodes for subtle economic overlay coloring.
 */

export const ECONOMIC_CORRIDOR_TYPES = {
  FINANCE: 'finance',
  MANUFACTURING: 'manufacturing',
  LOGISTICS: 'logistics',
  ENERGY: 'energy',
  TECH: 'tech',
  RESOURCE: 'resource',
  PASSENGER: 'passenger',
  MIXED: 'mixed',
};

/** Subtle tint multipliers when GDP overlay is enabled */
export const ECONOMIC_OVERLAY_TINTS = {
  [ECONOMIC_CORRIDOR_TYPES.FINANCE]: [255, 215, 120],
  [ECONOMIC_CORRIDOR_TYPES.MANUFACTURING]: [200, 180, 140],
  [ECONOMIC_CORRIDOR_TYPES.LOGISTICS]: [120, 200, 255],
  [ECONOMIC_CORRIDOR_TYPES.ENERGY]: [255, 160, 60],
  [ECONOMIC_CORRIDOR_TYPES.TECH]: [180, 140, 255],
  [ECONOMIC_CORRIDOR_TYPES.RESOURCE]: [255, 140, 80],
  [ECONOMIC_CORRIDOR_TYPES.PASSENGER]: [255, 200, 140],
  [ECONOMIC_CORRIDOR_TYPES.MIXED]: [160, 200, 220],
};

/**
 * @param {object} node
 * @param {object} [edge]
 */
export function classifyEconomicCorridorType(node, edge = {}) {
  const tags = new Set([...(node?.tags ?? []), ...(node?.roles ?? [])]);
  const modes = new Set([...(node?.modes ?? []), edge?.mode].filter(Boolean));
  const routeType = edge?.routeType ?? '';

  if (edge.mode === 'e2m' || routeType.includes('cargo') || routeType.includes('resource')) {
    return ECONOMIC_CORRIDOR_TYPES.RESOURCE;
  }
  if (tags.has('energy') || routeType.includes('energy')) {
    return ECONOMIC_CORRIDOR_TYPES.ENERGY;
  }
  if (tags.has('finance') || tags.has('banking')) {
    return ECONOMIC_CORRIDOR_TYPES.FINANCE;
  }
  if (tags.has('tech') || tags.has('ai')) {
    return ECONOMIC_CORRIDOR_TYPES.TECH;
  }
  if (tags.has('manufacturing') || tags.has('industrial')) {
    return ECONOMIC_CORRIDOR_TYPES.MANUFACTURING;
  }
  if (modes.has('port') || tags.has('port') || tags.has('logistics')) {
    return ECONOMIC_CORRIDOR_TYPES.LOGISTICS;
  }
  if (edge.mode === 'e2e_starship') {
    return ECONOMIC_CORRIDOR_TYPES.PASSENGER;
  }
  return ECONOMIC_CORRIDOR_TYPES.MIXED;
}
