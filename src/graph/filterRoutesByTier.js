/**
 * Tier filter — node/edge tier visibility by zoom.
 */

/**
 * @param {object[]} items
 * @param {number} zoom
 * @returns {object[]}
 */
export function filterRoutesByTier(items, zoom) {
  const z = Number(zoom) || 2;

  return (items ?? []).filter((item) => {
    const tier = item.tier ?? 2;
    if (z <= 3) return tier === 1;
    if (z <= 5) return tier <= 2;
    if (z <= 8) return tier <= 3;
    return true;
  });
}
