/**
 * Attach feeder cities only to nearest trunk station (no continental bypass).
 */

import { normalizeCityKey } from '../data/hyperloopPhase1Cities.js';
import {
  addEdgeUnique,
  makeEdge,
  haversineDistanceMiles,
  hasCoordinates,
} from '../data/phase1GlobalHyperloopGraph.js';
import { classifyInfrastructureRole } from '../data/classifyWorldCityInfrastructure.js';
import { INFRASTRUCTURE_ROLES } from '../data/infrastructureRoles.js';
import { HYPERLOOP_ROUTE_CLASSES } from '../data/hyperloopRouteClasses.js';

const FEEDER_MAX_MILES = 150;

const TRUNK_EDGE_CATEGORIES = new Set([
  'CONTINENTAL_SPINE',
  'PLANETARY_TRUNK',
  'REGIONAL_TRUNK',
  'CORRIDOR_CHAIN',
  'PLANETARY_GATEWAY',
  'INTERCONTINENTAL_GATEWAY',
  'FEEDER_ATTACHMENT',
  'THROUGH_ROUTE',
]);

const TRUNK_ROLES = new Set([
  INFRASTRUCTURE_ROLES.PLANETARY_TRUNK_NODE,
  INFRASTRUCTURE_ROLES.REGIONAL_TRUNK_NODE,
  INFRASTRUCTURE_ROLES.ACTIVE_E2E_HUB,
]);

function isTrunkStation(node) {
  const role =
    node.infrastructureRole || classifyInfrastructureRole(node);
  if (TRUNK_ROLES.has(role)) return true;
  return Boolean(
    node.isE2EHub ||
      node.isSwitchNode ||
      node.connectedToTrunk ||
      node.tier <= 2
  );
}

function pairExists(edges, a, b) {
  return edges.some(
    (e) =>
      (e.from === a && e.to === b) || (e.from === b && e.to === a)
  );
}

function hasTrunkInfrastructureAccess(cityId, edges) {
  return edges.some((e) => {
    if (e.from !== cityId && e.to !== cityId) return false;
    if (TRUNK_EDGE_CATEGORIES.has(e.edgeCategory)) return true;
    if (e.isIntercontinentalGateway) return true;
    if (e.edgeType === 'HYPERLOOP_TRUNK_LINE' && e.isThroughCorridor) return true;
    return false;
  });
}

/**
 * @returns {{ edgesAdded: number, attachments: number }}
 */
export function applyFeederTrunkAttachment({ nodes = [], edges = [], edgeMap }) {
  const trunkStations = nodes.filter((n) => hasCoordinates(n) && isTrunkStation(n));
  if (!trunkStations.length) return { edgesAdded: 0, attachments: 0 };

  let edgesAdded = 0;
  let attachments = 0;

  nodes.forEach((city) => {
    if (!hasCoordinates(city)) return;
    if (isTrunkStation(city)) return;

    if (hasTrunkInfrastructureAccess(city.id, edges)) return;

    let best = null;
    let bestDist = Infinity;
    trunkStations.forEach((trunk) => {
      if (trunk.id === city.id) return;
      if (trunk.continent && city.continent && trunk.continent !== city.continent) {
        return;
      }
      const d = haversineDistanceMiles(city.lat, city.lon, trunk.lat, trunk.lon);
      if (d < bestDist && d <= FEEDER_MAX_MILES) {
        bestDist = d;
        best = trunk;
      }
    });

    if (!best || pairExists(edges, city.id, best.id)) return;

    const edge = makeEdge(city, best, {
      edgeType: 'SPLIT_OFF_BRANCH',
      routeClass: HYPERLOOP_ROUTE_CLASSES.LOCAL_FEEDER,
      corridor: `Feeder → ${best.name}`,
      edgeCategory: 'FEEDER_ATTACHMENT',
      generatedBy: 'feeder_trunk_attachment',
      isSplitOff: true,
      splitOffFrom: best.id,
      infrastructureTier: 3,
    });

    if (!edge) return;
    const before = edges.length;
    addEdgeUnique(edges, edgeMap, edge);
    if (edges.length > before) {
      edgesAdded += 1;
      attachments += 1;
    }
  });

  return { edgesAdded, attachments };
}
