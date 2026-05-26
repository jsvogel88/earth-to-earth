/** @deprecated Import from `src/graph/buildPlanetaryHyperloopGraph.js` or `src/graph/index.js`. */
export {
  buildPlanetaryHyperloopGraph,
  normalizePlanetaryNode,
  generateConnectivityRepairLinks,
  CONNECTION_STATUS,
} from '../graph/buildPlanetaryHyperloopGraph.js';

import { generateConnectivityRepairLinks } from '../graph/buildPlanetaryHyperloopGraph.js';

/** @deprecated Use generateConnectivityRepairLinks */
export function generateConnectivityRepairEdges(nodes, edges, edgeMap) {
  return generateConnectivityRepairLinks(nodes, edges, edgeMap);
}
