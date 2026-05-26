/**
 * View-mode filter — which route families appear per integrated / transport view.
 */

/**
 * @param {object[]} items
 * @param {string} viewMode
 * @param {(item: object) => string} classifyFn
 * @returns {object[]}
 */
export function filterRoutesByView(items, viewMode, classifyFn) {
  return (items ?? []).filter((item) => {
    const family = classifyFn(item);

    switch (viewMode) {
      case 'E2E':
      case 'E2E_STARSHIP':
        return family === 'E2E_GLOBAL_ARC';

      case 'CIVILIZATION_GRID':
        return (
          family === 'E2E_GLOBAL_ARC' ||
          family === 'CONTINENTAL_SPINE' ||
          family === 'REGIONAL_LOOP' ||
          family === 'E2M_CARGO'
        );

      case 'HYPERLOOP_CORE':
        return (
          family === 'CONTINENTAL_SPINE' ||
          family === 'FEEDER_BRANCH' ||
          family === 'REGIONAL_LOOP'
        );

      case 'LOOP':
        return family === 'REGIONAL_LOOP' || family === 'FEEDER_BRANCH';

      case 'E2M_ORBITAL':
      case 'E2M':
        return family === 'E2M_CARGO';

      case 'ROBOTAXI':
        return family === 'ROBOTAXI_LOCAL';

      default:
        return true;
    }
  });
}
