/**
 * Zoom-level filter — progressive disclosure by route family and tier.
 */

/**
 * @param {object[]} items
 * @param {number} zoom
 * @param {(item: object) => string} classifyFn
 * @returns {object[]}
 */
export function filterRoutesByZoom(items, zoom, classifyFn) {
  const z = Number(zoom) || 2;

  return (items ?? []).filter((item) => {
    const family = classifyFn(item);
    const tier = item.tier ?? 2;

    if (z <= 3) {
      return (
        family === 'E2E_GLOBAL_ARC' ||
        (family === 'CONTINENTAL_SPINE' && tier === 1)
      );
    }
    if (z <= 5) {
      return (
        family === 'E2E_GLOBAL_ARC' ||
        family === 'CONTINENTAL_SPINE' ||
        (family === 'E2M_CARGO' && tier <= 2)
      );
    }
    if (z <= 8) {
      return family !== 'ROBOTAXI_LOCAL';
    }
    return family !== 'E2E_GLOBAL_ARC' || tier === 1;
  });
}
