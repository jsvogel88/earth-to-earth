/**
 * Phase 7D — dev validation counts for geometry + topology.
 */

import { classifyRouteFamily, ROUTE_FAMILIES } from '../graph/classifyRouteFamily.js';
import {
  detectFragmentedCorridors,
  filterUnownedPlanetaryRoutes,
  regionalTrunkVisibility,
  isCorridorOwnedForPlanetary,
} from '../graph/planetaryTopology.js';
import { isHyperloopOceanCrossing } from '../graph/hyperloopGeometry.js';
import {
  isE2MRouteFamily,
  isE2MLocalGroundRoute,
  E2M_PATH_LAYER_VIOLATION_KM,
} from './e2mGeometry.js';
import { isPriorityE2EEdge } from './visualHierarchy.js';
import adapter from '../data/canonicalTransportAdapter.js';

/**
 * @param {object} params
 * @returns {object}
 */
export function computePlanetaryValidation({
  buckets = {},
  visibleEdges = [],
  zoom = 2,
  deckLayers = [],
} = {}) {
  const z = Number(zoom) || 2;
  const nodesById = adapter.nodesById ?? {};

  let e2mPathViolations = 0;
  let e2ePathViolations = 0;
  let hyperloopOceanViolations = 0;
  let autoLineViolations = 0;
  let unownedVisible = 0;

  const allPathLike = [
    ...(buckets.trunkPaths ?? []),
    ...(buckets.loopPaths ?? []),
    ...(buckets.feederPaths ?? []),
  ];

  for (const p of allPathLike) {
    if (isE2MRouteFamily(p)) {
      const dist = p.distanceKm ?? 0;
      if (!isE2MLocalGroundRoute(p) || dist > E2M_PATH_LAYER_VIOLATION_KM) {
        e2mPathViolations += 1;
      }
    }
    if (p.mode === 'e2e_starship' || p.mode === 'e2e') e2ePathViolations += 1;
    if (p.mode === 'robotaxi' || p.mode === 'autonomous_auto') autoLineViolations += 1;

    const from = p.from ?? p.path?.[0];
    const to = p.to ?? p.path?.[p.path?.length - 1];
    if (from && to) {
      const fromNode = { longitude: from[0], latitude: from[1] };
      const toNode = { longitude: to[0], latitude: to[1] };
      if (isHyperloopOceanCrossing(fromNode, toNode, p)) {
        hyperloopOceanViolations += 1;
      }
    }
  }

  if (z < 3) {
    for (const edge of visibleEdges) {
      if (!isCorridorOwnedForPlanetary(edge, z)) unownedVisible += 1;
    }
  }

  const { fragmented } = detectFragmentedCorridors(adapter.routes ?? []);
  const ownedAtPlanetary = filterUnownedPlanetaryRoutes(visibleEdges, z);
  const regions = regionalTrunkVisibility(ownedAtPlanetary);

  let e2mArcCount = buckets.cargoArcs?.length ?? 0;
  let e2eArcCount = buckets.arcs?.length ?? 0;
  let hyperloopPathCount = buckets.trunkPaths?.length ?? 0;

  for (const layer of deckLayers ?? []) {
    const id = String(layer?.id ?? '');
    const n = layer?.props?.data?.length ?? 0;
    if (id.includes('integrated-e2m') && !id.includes('ground')) e2mArcCount = Math.max(e2mArcCount, n);
    if (id.includes('integrated-e2e')) e2eArcCount = Math.max(e2eArcCount, n);
    if (id.includes('integrated-hyperloop')) hyperloopPathCount = Math.max(hyperloopPathCount, n);
    if (id.includes('robotaxi') && id.includes('route')) autoLineViolations += n;
  }

  const visiblePlanetaryRoutes =
    (buckets.arcs?.length ?? 0) +
    (buckets.cargoArcs?.length ?? 0) +
    (buckets.trunkPaths?.length ?? 0);

  return {
    geometry: {
      e2eArcsRendered: e2eArcCount,
      e2ePathViolations,
      e2mArcsRendered: e2mArcCount,
      e2mPathViolations,
      hyperloopPathsRendered: hyperloopPathCount,
      hyperloopOceanViolations,
      autoLineViolations,
    },
    topology: {
      namedCorridors: new Set((adapter.routes ?? []).map((r) => r.corridorId).filter(Boolean)).size,
      corridorOwnedRoutes: ownedAtPlanetary.length,
      unownedVisibleRoutes: unownedVisible,
      fragmentedCorridors: fragmented.length,
      danglingStubsHidden: Math.max(0, (visibleEdges?.length ?? 0) - ownedAtPlanetary.length),
      visiblePlanetaryRouteCount: visiblePlanetaryRoutes,
    },
    regional: regions,
    pass:
      e2mPathViolations === 0 &&
      e2ePathViolations === 0 &&
      autoLineViolations === 0 &&
      hyperloopOceanViolations === 0 &&
      (z >= 3 || unownedVisible === 0),
  };
}

/**
 * @param {object[]} edges
 * @param {number} zoom
 * @returns {number}
 */
export function countDanglingStubs(edges, zoom) {
  if (Number(zoom) >= 3) return 0;
  return (edges ?? []).filter((e) => {
    const family = classifyRouteFamily(e);
    return (
      family === ROUTE_FAMILIES.FEEDER_BRANCH ||
      family === ROUTE_FAMILIES.REGIONAL_LOOP ||
      ((family === ROUTE_FAMILIES.E2M_CARGO || family === ROUTE_FAMILIES.CONTINENTAL_SPINE) &&
        !isCorridorOwnedForPlanetary(e, zoom) &&
        !isPriorityE2EEdge(e))
    );
  }).length;
}
