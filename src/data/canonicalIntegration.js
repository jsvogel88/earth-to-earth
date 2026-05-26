/**
 * v1.4.0 canonical data integration helpers — adapter wiring with legacy fallbacks.
 */

import {
  getE2EHubs,
  getIntegratedGraph,
  getHyperloopPaths,
  getLayerVisibility,
  getNetworkStats,
  getValidationReport,
} from './canonicalTransportAdapter.js';
import { getTaxonomyMode, getTaxonomyNodeType } from './transport/taxonomyBridge.js';

const LEGACY_CURATED_ROWS = [
  ['New York', 'USA', 40.7128, -74.006, 8335897, 'North America', 'Northeast US'],
  ['London', 'UK', 51.5074, -0.1278, 8982000, 'Europe', 'Western Europe'],
  ['Los Angeles', 'USA', 34.0522, -118.2437, 3990456, 'North America', 'US West'],
  ['San Francisco', 'USA', 37.7749, -122.4194, 883305, 'North America', 'US West'],
  ['Tokyo', 'Japan', 35.6762, 139.6503, 13960000, 'Asia', 'East Asia'],
  ['Singapore', 'Singapore', 1.3521, 103.8198, 5686000, 'Asia', 'Southeast Asia'],
  ['Dubai', 'UAE', 25.2048, 55.2708, 3137000, 'Asia', 'Middle East'],
  ['Hong Kong', 'Hong Kong', 22.3193, 114.1694, 7500000, 'Asia', 'East Asia'],
  ['Shanghai', 'China', 31.2304, 121.4737, 27058000, 'Asia', 'East Asia'],
  ['Paris', 'France', 48.8566, 2.3522, 2161000, 'Europe', 'Western Europe'],
  ['Frankfurt', 'Germany', 50.1109, 8.6821, 753000, 'Europe', 'Western Europe'],
  ['Amsterdam', 'Netherlands', 52.3676, 4.9041, 873000, 'Europe', 'Western Europe'],
  ['Toronto', 'Canada', 43.6629, -79.3957, 2930000, 'North America', 'Canada'],
  ['Chicago', 'USA', 41.8781, -87.6298, 2693976, 'North America', 'US Midwest'],
  ['Miami', 'USA', 25.7617, -80.1918, 467963, 'North America', 'US Southeast'],
  ['Dallas', 'USA', 32.7767, -96.797, 1343000, 'North America', 'US South'],
  ['Houston', 'USA', 29.7604, -95.3698, 2300000, 'North America', 'US South'],
  ['Mexico City', 'Mexico', 19.4326, -99.1332, 8918000, 'North America', 'Mexico'],
  ['São Paulo', 'Brazil', -23.5505, -46.6333, 12252000, 'South America', 'Brazil'],
  ['Buenos Aires', 'Argentina', -34.6037, -58.3816, 2890151, 'South America', 'Argentina'],
  ['Sydney', 'Australia', -33.8688, 151.2093, 5312000, 'Oceania', 'Australia'],
  ['Melbourne', 'Australia', -37.8136, 144.9631, 5078193, 'Oceania', 'Australia'],
  ['Seoul', 'South Korea', 37.5665, 126.978, 9776000, 'Asia', 'East Asia'],
  ['Mumbai', 'India', 19.0876, 72.8691, 20411000, 'Asia', 'South Asia'],
  ['Delhi', 'India', 28.6139, 77.209, 16787941, 'Asia', 'South Asia'],
  ['Bangkok', 'Thailand', 13.7563, 100.5018, 8305000, 'Asia', 'Southeast Asia'],
  ['Istanbul', 'Turkey', 41.0082, 28.9784, 15462000, 'Europe', 'Eurasia'],
  ['Tel Aviv', 'Israel', 32.0853, 34.7818, 460000, 'Asia', 'Middle East'],
  ['Riyadh', 'Saudi Arabia', 24.7136, 46.6753, 7676654, 'Asia', 'Middle East'],
  ['Johannesburg', 'South Africa', -26.2041, 28.0473, 5634800, 'Africa', 'Southern Africa'],
  ['Lagos', 'Nigeria', 6.5244, 3.3792, 15388000, 'Africa', 'West Africa'],
];

function legacyCuratedFromRows(networkCityIdFn) {
  return LEGACY_CURATED_ROWS.map(
    ([name, country, lat, lon, population, continent, region]) => ({
      id: networkCityIdFn(name, country),
      name,
      country,
      lat,
      lon,
      population,
      continent,
      region,
      aliases: [],
      hasCoordinates: true,
    })
  );
}

/**
 * Curated E2E hub cities from v1.4.0 canonical nodes (31 hubs).
 * @param {(name: string, country: string) => string} networkCityIdFn
 */
export function buildCanonicalCuratedNetworkCities(networkCityIdFn) {
  try {
    return getE2EHubs().map((hub) => ({
      id: hub.networkCityId,
      name: hub.name,
      country: hub.country,
      lat: hub.latitude,
      lon: hub.longitude,
      population: hub.population ?? null,
      continent: hub.region ?? '',
      region: hub.region ?? '',
      aliases: [],
      hasCoordinates: true,
      isE2EHub: true,
      tier: hub.tier,
      economics: hub.economics ?? null,
      taxonomyNodeType: getTaxonomyNodeType({
        isE2EHub: true,
        nodeType: 'city',
        tags: hub.tags,
      }),
    }));
  } catch (error) {
    console.warn('[canonical] E2E hub load failed; using legacy curated list', error);
    return legacyCuratedFromRows(networkCityIdFn);
  }
}

/**
 * Deck.gl hub records (toMapHubRecord shape).
 */
export function getCanonicalMapRoiHubs() {
  try {
    return getE2EHubs().map((hub, index) => ({
      id: index,
      networkCityId: hub.networkCityId,
      name: hub.name,
      country: hub.country,
      lat: hub.latitude,
      lon: hub.longitude,
      population: hub.population,
      continent: hub.region,
      region: hub.region,
      isActiveE2EHub: true,
    }));
  } catch (error) {
    console.warn('[canonical] getCanonicalMapRoiHubs failed', error);
    return null;
  }
}

const PLANNING_PATH_CATEGORIES = new Set([
  'EXTENDED_RURAL',
  'CONNECTIVITY_REPAIR',
  'PLANNING_FUTURE_HUB',
  'GLOBAL_COVERAGE_CORRIDOR',
]);

export function isPlanningOnlyHyperloopPath(path) {
  const cat = path?.edgeCategory ?? '';
  if (PLANNING_PATH_CATEGORIES.has(cat)) return true;
  if (path?.edgeType === 'CONNECTIVITY_REPAIR_LINK') return true;
  if (path?.generatedBy === 'connectivity_repair' || path?.generatedBy === 'future_hub_connector') {
    return true;
  }
  return false;
}

/**
 * Canonical hyperloop / loop routes as deck PathLayer-compatible objects.
 */
export function getCanonicalDeckHyperloopPaths(options = {}) {
  const routes = getHyperloopPaths(options);
  return routes.map((route) => {
    const routeType = route.routeType || '';
    let routeClass = 'PLANETARY_TRUNK';
    let edgeCategory = 'PLANETARY_TRUNK';
    if (routeType === 'continental_spine' || routeType === 'intercontinental_connector') {
      routeClass = 'CONTINENTAL_SPINE';
      edgeCategory = 'CONTINENTAL_SPINE';
    } else if (routeType === 'branch' || routeType === 'feeder') {
      routeClass = 'REGIONAL_TRUNK';
      edgeCategory = 'REGIONAL_TRUNK';
    } else if (route.mode === 'regional_loop') {
      routeClass = 'REGIONAL_LOOP';
      edgeCategory = 'REGIONAL_TRUNK';
    }
    return {
      id: route.routeId,
      path: route.path,
      routeClass,
      edgeCategory,
      edgeType: routeClass,
      infrastructureTier: route.tier ?? 2,
      infrastructureOnly: true,
      distanceMiles: null,
      corridor: route.name,
      fromName: route.name,
      toName: route.name,
      taxonomyMode: getTaxonomyMode(route.mode, routeType),
      canonicalRouteId: route.routeId,
      dataSource: 'canonical-v1.4.0',
    };
  });
}

/**
 * Merge canonical spine paths with legacy planning-only paths.
 */
export function mergeCanonicalAndLegacyHyperloopPaths(legacyPaths, options = {}) {
  try {
    const canonical = getCanonicalDeckHyperloopPaths(options);
    if (!canonical.length) return legacyPaths;
    const planningOnly = (legacyPaths ?? []).filter(isPlanningOnlyHyperloopPath);
    return [...canonical, ...planningOnly];
  } catch (error) {
    console.warn('[canonical] hyperloop paths failed; using legacy paths', error);
    return legacyPaths ?? [];
  }
}

const INTEGRATED_MODE_TO_CANONICAL = {
  e2e: 'e2e',
  e2m: 'e2m',
  hyperloop: 'hyperloop',
  loop: 'loop',
  auto: 'auto',
};

/**
 * Integrated graph with canonical-first fallback to legacy generator output.
 */
export function resolveIntegratedGraph({
  modeFilter = null,
  legacyGenerate,
  enrichEdge,
} = {}) {
  const canonicalKey = modeFilter ? INTEGRATED_MODE_TO_CANONICAL[modeFilter] ?? modeFilter : null;
  try {
    const graph = getIntegratedGraph(canonicalKey);
    const edges = enrichEdge
      ? graph.edges.map((edge) => {
          const taxonomyMode = getTaxonomyMode(
            edge.mode === 'e2e' ? 'e2e_starship' : edge.mode === 'loop' ? 'regional_loop' : edge.mode,
            edge.route_type
          );
          return { ...edge, taxonomyMode, ...enrichEdge(edge) };
        })
      : graph.edges.map((edge) => ({
          ...edge,
          taxonomyMode: getTaxonomyMode(
            edge.mode === 'e2e' ? 'e2e_starship' : edge.mode === 'loop' ? 'regional_loop' : edge.mode,
            edge.route_type
          ),
        }));

    return {
      nodes: graph.nodes,
      edges,
      diagnostics: {
        totalNodes: graph.nodes.length,
        totalEdges: graph.edges.length,
        cityCount: graph.nodes.filter((n) => n.node_type === 'CITY' || !n.isE2EHub).length,
        e2eHubCount: graph.nodes.filter((n) => n.isE2EHub).length,
        warnings: ['Integrated graph from canonical v1.4.0 dataset'],
        dataSource: 'canonical-v1.4.0',
      },
      usedCanonical: true,
    };
  } catch (error) {
    console.warn('[canonical] integrated graph failed; falling back to legacy generator', error);
    const legacy = legacyGenerate?.();
    return { ...legacy, usedCanonical: false };
  }
}

/**
 * Canonical zoom-tier visibility merged with legacy tier check.
 */
export function isModeVisibleAtZoomCanonical(integratedMode, zoom) {
  try {
    const canonicalMode =
      integratedMode === 'e2e'
        ? 'e2e_starship'
        : integratedMode === 'loop'
          ? 'regional_loop'
          : integratedMode;
    const vis = getLayerVisibility(zoom);
    const entry = vis[canonicalMode];
    if (entry && typeof entry.show === 'boolean') return entry.show;
  } catch {
    /* fallback below */
  }
  return true;
}

export { getLayerVisibility, getNetworkStats, getValidationReport };
