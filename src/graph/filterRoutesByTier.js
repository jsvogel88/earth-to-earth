/**
 * Tier filter — node/edge tier visibility by zoom (view-mode aware).
 */

/**
 * @param {object[]} items
 * @param {number} zoom
 * @param {string | null} [viewMode]
 * @returns {object[]}
 */
export function filterRoutesByTier(items, zoom, viewMode = null) {
  const z = Number(zoom) || 2;

  if (viewMode === 'LOOP' || viewMode === 'E2M' || viewMode === 'E2M_ORBITAL') {
    return items ?? [];
  }

  return (items ?? []).filter((item) => {
    const tier = item.tier ?? 2;
    if (z <= 3) return tier === 1;
    if (z <= 5) return tier <= 2;
    if (z <= 8) return tier <= 3;
    return true;
  });
}
