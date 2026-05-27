/**
 * Graph membership tiers — separates official backbone from overlays.
 */

export const GRAPH_MEMBERSHIP = {
  OFFICIAL: 'official',
  OVERLAY: 'overlay',
  PLANNING: 'planning',
  DEBUG: 'debug',
};

export const GRAPH_MEMBERSHIP_IDS = new Set(Object.values(GRAPH_MEMBERSHIP));

export function isGraphMembership(value) {
  return GRAPH_MEMBERSHIP_IDS.has(value);
}
