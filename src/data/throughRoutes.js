/**
 * Through-route definitions (config only). Generation lives in src/graph/generateThroughRoutes.js.
 */

export { THROUGH_ROUTE_LIMITS, THROUGH_CONTINENT_BRIDGES } from './throughRouteConfig.js';

export {
  generateThroughRoutes,
  makeThroughEdge,
} from '../graph/generateThroughRoutes.js';
