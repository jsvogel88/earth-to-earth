/**
 * Global spine trunk classification by economic/strategic weight.
 */

export const SPINAL_TRUNK_CLASS = {
  PRIMARY: 'primary_civilization_trunk',
  SECONDARY: 'secondary_continental_trunk',
  TERTIARY: 'tertiary_regional_trunk',
};

const PRIMARY_HUB_KEYS = [
  'new-york',
  'london',
  'singapore',
  'tokyo',
  'dubai',
  'mumbai',
  'shanghai',
  'beijing',
  'hong-kong',
  'paris',
  'frankfurt',
  'los-angeles',
  'san-francisco',
  'seoul',
  'sydney',
];

/**
 * @param {object} edge
 * @param {object} fromNode
 * @param {object} toNode
 * @param {object} routeScore
 */
export function classifySpinalTrunk(edge, fromNode, toNode, routeScore = {}) {
  if (edge.routeType !== 'continental_spine' && edge.routeType !== 'global_spine') {
    return null;
  }

  const civ = routeScore.civilizationImportance ?? 0;
  const gdp = edge.economicWeight?.gdpGeometricMean ?? 0;
  const fromKey = (fromNode?.id ?? '').toLowerCase();
  const toKey = (toNode?.id ?? '').toLowerCase();
  const primaryPair = PRIMARY_HUB_KEYS.some(
    (k) => fromKey.includes(k) && PRIMARY_HUB_KEYS.some((k2) => k2 !== k && toKey.includes(k2))
  );

  if (primaryPair || civ >= 82 || gdp >= 75) {
    return SPINAL_TRUNK_CLASS.PRIMARY;
  }
  if (civ >= 55 || gdp >= 45) {
    return SPINAL_TRUNK_CLASS.SECONDARY;
  }
  return SPINAL_TRUNK_CLASS.TERTIARY;
}
