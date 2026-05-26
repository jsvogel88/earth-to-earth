/**
 * Rare Earth / remote strategic hub candidates — curated global seed list only.
 * Coordinates from cityCoordinateLookup (Phase 1 manual + coverage supplements).
 * Does NOT use world-cities.csv or render the 5k master file on the main map.
 */

import { buildRemoteStrategicNodes, getGlobalCoverageNodeMetrics } from './remoteStrategicNodes.js';
import { hasCoordinates } from './planningLayers.js';

/**
 * Global rare-earth / remote strategic candidates from user seed list.
 */
export function buildRareEarthHubCandidates() {
  return buildRemoteStrategicNodes();
}

export const rareEarthHubCandidates = buildRareEarthHubCandidates();

export function getRareEarthHubMetrics(nodes) {
  const coverage = getGlobalCoverageNodeMetrics(nodes);
  const renderable = (nodes || []).filter((n) => n.renderable && hasCoordinates(n));
  return {
    ...coverage,
    visibleRareEarthHubs: renderable.length,
    arcticLogisticsNodes: coverage.arcticNodes,
    remoteCargoNodes: renderable.filter((n) => n.cargoPriority).length,
    criticalMineralsNodes: renderable.filter(
      (n) =>
        n.nodeType === 'CRITICAL_MINERALS_NODE' ||
        n.accessPurpose?.includes('critical_minerals')
    ).length,
    rareEarthNodes: renderable.filter(
      (n) =>
        n.nodeType === 'RARE_EARTH_NODE' ||
        n.nodeType === 'RARE_EARTH_HUB_CANDIDATE'
    ).length,
    remoteStrategicNodes: renderable.filter((n) => n.globalCoverage).length,
  };
}
