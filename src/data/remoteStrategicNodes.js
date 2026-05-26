/**
 * Global remote strategic / rare earth hub candidates from coverage seed list.
 */

import { normalizeCityKey } from './hyperloopPhase1Coordinates.js';
import { normalizeNodeId } from './hyperloopPhase1Cities.js';
import { lookupCityCoordinates } from './cityCoordinateLookup.js';
import { PLANNING_DEMO_MIN_ZOOM } from './mapLayerDefaults.js';
import {
  GLOBAL_COVERAGE_SEEDS,
  GLOBAL_COVERAGE_SOURCE,
  STRATEGIC_NODE_TYPES,
} from './globalCoverageRegions.js';
import { hasCoordinates } from './planningLayers.js';

const CITY_ALIASES = {
  'n’djamena': "n'djamena",
  reykjavík: 'reykjavik',
  'tórshavn': 'torshavn',
  ürümqi: 'urumqi',
  'nukuʻalofa': 'nukualofa',
  'ho chi minh city': 'ho chi minh city',
  yaoundé: 'yaounde',
  belém: 'belem',
  santarém: 'santarem',
  córdoba: 'cordoba',
};

function resolveKey(name) {
  const key = normalizeCityKey(name);
  return CITY_ALIASES[key] || key;
}

/** Curated seed coords only — never world-cities.csv */
function lookupCoords(name) {
  const alias = resolveKey(name);
  return lookupCityCoordinates(name) || lookupCityCoordinates(alias) || null;
}

export function buildRemoteStrategicNode(seed) {
  const coords = lookupCoords(seed.name);
  const hasCoords =
    coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lon === 'number' &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lon);

  return {
    id: normalizeNodeId(seed.name, seed.country || coords?.country || 'unknown'),
    name: seed.name,
    country: seed.country || coords?.country || '',
    regionGroup: seed.regionGroup,
    subRegion: seed.subRegion,
    continent: seed.continent || coords?.continent || '',
    lat: hasCoords ? coords.lat : null,
    lon: hasCoords ? coords.lon : null,
    population: null,
    nodeType: seed.nodeType || STRATEGIC_NODE_TYPES.RARE_EARTH_HUB_CANDIDATE,
    potentialRareEarthHub: true,
    potentialRuralE2EHub: true,
    isActiveE2EHub: false,
    e2eHubPhase: 'future-rare-earth',
    cargoPriority: true,
    passengerPriority: false,
    accessPurpose: [
      'remote_cargo',
      'resource_logistics',
      'strategic_access',
      'global_coverage',
    ],
    resourceTypes: [],
    nearestE2EHub: null,
    nearestHyperloopTrunk: null,
    nearestSwitchNode: null,
    nearestPort: null,
    visibleMinZoom: PLANNING_DEMO_MIN_ZOOM,
    requiresValidation: true,
    source: GLOBAL_COVERAGE_SOURCE,
    needsCoordinates: !hasCoords,
    renderable: hasCoords,
    isRemoteNode: true,
    planningOverlay: true,
    globalCoverage: true,
    tooltip:
      'Rare Earth Hub candidate — remote cargo / critical minerals / strategic access.',
  };
}

export function buildRemoteStrategicNodes() {
  return GLOBAL_COVERAGE_SEEDS.map(buildRemoteStrategicNode);
}

/** Curated remote strategic nodes (Rare Earth seed list). */
export const remoteStrategicNodes = buildRemoteStrategicNodes();

export function getGlobalCoverageNodeMetrics(nodes) {
  const all = nodes || [];
  const renderable = all.filter((n) => n.renderable && hasCoordinates(n));
  const byRegion = {};
  REGION_GROUPS_FROM_SEEDS(all).forEach((rg) => {
    byRegion[rg] = renderable.filter((n) => n.regionGroup === rg).length;
  });

  return {
    totalSeeds: all.length,
    renderableNodes: renderable.length,
    needsCoordinates: all.filter((n) => n.needsCoordinates).length,
    byRegion,
    arcticNodes: renderable.filter((n) =>
      `${n.regionGroup} ${n.nodeType}`.toLowerCase().includes('arctic')
    ).length,
    islandNodes: renderable.filter((n) => n.nodeType === STRATEGIC_NODE_TYPES.ISLAND_ACCESS_NODE)
      .length,
    africaNodes: renderable.filter((n) => n.regionGroup?.includes('Africa')).length,
    southAmericaNodes: renderable.filter((n) => n.regionGroup?.includes('South America')).length,
    australiaNodes: renderable.filter((n) => n.regionGroup?.includes('Australia')).length,
    greenlandNodes: renderable.filter((n) => n.regionGroup?.includes('Greenland')).length,
  };
}

function REGION_GROUPS_FROM_SEEDS(nodes) {
  return [...new Set((nodes || []).map((n) => n.regionGroup).filter(Boolean))];
}

export { STRATEGIC_NODE_TYPES };
