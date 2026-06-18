/**
 * canonicalTransportAdapter.js
 *
 * DROP-IN ADAPTER — bridges the canonical transport dataset to the shapes
 * your existing app already consumes.
 *
 * HOW TO USE:
 *   1. Copy src/data/transport/ and src/graph/ into your app's src/
 *   2. Import this adapter in FuturisticTransportMap.jsx or useIntegratedTransportGraph.js
 *   3. Call getIntegratedGraph() to get nodes/edges in the shape generateIntegratedRoutes() returns
 *   4. Call getE2EHubs() to replace CURATED_NETWORK_CITIES + useE2EHubRegistry output
 *   5. Gradually replace individual data sources — nothing breaks until you're ready
 *
 * OUTPUT SHAPES match your existing consumers:
 *   - getIntegratedGraph()   → { nodes, edges }         (matches generateIntegratedRoutes)
 *   - getE2EHubs()           → hub records               (matches useE2EHubRegistry / getMapRoiHubs)
 *   - getHyperloopPaths()    → webRenderablePaths[]      (matches buildPlanetaryHyperloopGraph output)
 *   - getArcLayerData(mode)  → ArcLayer-ready objects    (matches integrated-e2e-routes / starship-routes)
 *   - getPathLayerData(mode) → PathLayer-ready objects   (matches integrated-hyperloop-spine)
 *   - getScatterData(mode)   → ScatterplotLayer-ready    (matches integrated-e2e-hubs, integrated-mineral-hubs)
 *   - getModeRegistry()      → mode config objects       (matches modeRegistry.js TRANSPORT_MODES)
 *   - getLayerVisibility(zoom) → per-layer show/opacity  (replaces zoomVisibility.js logic)
 *
 * DOES NOT:
 *   - Replace robotaxiLayer.js (zones stay as-is — they're overlayOnly)
 *   - Replace parseCities.js or customDestinations (overlays stay as-is)
 *   - Replace layerRegistry.js toggles (UI toggles still work)
 *   - Break anything — all fallback behavior preserved
 */

import nodesRaw from './transport/nodes.json';
import edgesRaw from './transport/edges.json';
import routesRaw from './transport/routes.json';
import layersRaw from './transport/layers.json';
import { MODES, getModeVisibility } from './transport/modeRegistry.js';
import { getTaxonomyMode, getTaxonomyNodeType } from './transport/taxonomyBridge.js';
import { validateEdgeTaxonomy, validateNodeTaxonomy } from '../transportation/validators/taxonomyValidation.js';
import { normalizeRenderIntent } from '../transportation/render/renderIntent.js';
import { matchesRouteFamilies, routeTypeInFamily } from './routeTypeFamilies.js';
import { enrichRouteRecord, enrichEdgeRecord } from './corridorRouteRegistry.js';
import { findStrategicHubForNode } from '../graph/strategicHubRegistry.js';

function inferIntegratedRouteType(edge, taxonomyRouteType) {
  const rt = String(edge?.routeType ?? edge?.route_type ?? taxonomyRouteType ?? '').toLowerCase();
  if (!rt) return 'trunk';

  // Preserve existing integrated graph expectations (integratedGraphTypes.js EDGE_TYPES).
  if (rt.includes('global_arc') || rt.includes('global')) return 'global';
  if (rt.includes('feeder')) return 'feeder';
  if (rt.includes('resource') || rt.includes('mineral') || rt.includes('mining')) return 'resource';
  if (rt.includes('cargo') || rt.includes('industrial') || rt.includes('logistics')) return 'industrial';
  if (rt.includes('last_mile')) return 'last_mile';
  return 'trunk';
}

function inferIntegratedCorridorType(edge, taxonomyMode, taxonomyRouteType) {
  const mode = String(edge?.mode ?? taxonomyMode ?? '').toLowerCase();
  const rt = String(edge?.routeType ?? edge?.route_type ?? taxonomyRouteType ?? '').toLowerCase();

  // Keep existing integratedGraphTypes CORRIDOR_TYPES strings.
  if (mode === 'e2e_starship' || mode === 'e2e') return 'passenger';
  if (mode === 'e2m' || mode === 're2e' || mode === 'cargo' || mode === 'logistics') {
    if (rt.includes('resource') || rt.includes('mineral') || rt.includes('mining')) return 'resource';
    if (rt.includes('industrial') || rt.includes('cargo') || rt.includes('logistics')) return 'industrial';
    return 'freight';
  }
  return 'mixed';
}

// ─── Internal indexes (built once) ──────────────────────────────────────────

const _nodesById   = Object.fromEntries(nodesRaw.map(n => [n.id, n]));
const _edgesByMode = {};
const _nodesByMode = {};
const _routesByMode= {};

for (const e of edgesRaw) {
  if (!_edgesByMode[e.mode]) _edgesByMode[e.mode] = [];
  _edgesByMode[e.mode].push(e);
}
for (const n of nodesRaw) {
  for (const m of (n.modes || [])) {
    if (!_nodesByMode[m]) _nodesByMode[m] = [];
    _nodesByMode[m].push(n);
  }
}
for (const r of routesRaw) {
  if (!_routesByMode[r.mode]) _routesByMode[r.mode] = [];
  _routesByMode[r.mode].push(r);
}

// ─── App ID bridge ───────────────────────────────────────────────────────────

/**
 * Convert app's net:{city}:{country} ID → canonical node:city:* ID
 * Use when you have an app-side hub ID and need to look up economics/tier/etc.
 */
export function appIdToCanonicalId(netId) {
  // net:new-york:united-states → node:city:new-york-united-states
  const stripped = netId.replace(/^net:/, '').replace(/:/, '-');
  return `node:city:${stripped}`;
}

/**
 * Convert canonical ID → app net: ID (for hubs that have networkCityId)
 */
export function canonicalIdToAppId(canonicalId) {
  const node = _nodesById[canonicalId];
  return node?.networkCityId || null;
}

// ─── E2E Hub output (replaces useE2EHubRegistry / getMapRoiHubs) ─────────────

/**
 * Returns the 31 curated E2E hubs in the shape toMapHubRecord() produces.
 * Drop-in for getMapRoiHubs() consumer.
 */
export function getE2EHubs() {
  return nodesRaw
    .filter(n => n.isE2EHub)
    .map((n, i) => ({
      // App-compatible fields
      id:              i + 1,                        // numeric pick ID
      networkCityId:   n.networkCityId,              // net:city:country
      name:            n.name,
      country:         n.country,
      latitude:        n.latitude,
      longitude:       n.longitude,
      coordinates:     [n.longitude, n.latitude],
      isE2EHub:        true,
      isActiveE2EHub:  true,
      tier:            n.tier,
      population:      n.population,
      region:          n.region,
      tags:            n.tags || [],
      modes:           n.modes || [],
      // Economics (new — use for ROI display, hub scoring)
      economics:       n.economics || null,
      economicWeight:  n.economics?.economic_weight || 0,
      gdpScore:        n.economics?.gdp_score || 0,
      tradeScore:      n.economics?.trade_score || 0,
      incomeGroup:     n.economics?.income_group || null,
      // Canonical
      canonicalId:     n.id,
    }));
}

// ─── Integrated graph output (replaces generateIntegratedRoutes) ─────────────

/**
 * Returns { nodes, edges } in the shape generateIntegratedRoutes() produces.
 * Pass to deckLayerFactory and useIntegratedTransportGraph as a drop-in.
 *
 * mode filter: 'e2e' | 'e2m' | 'hyperloop' | 'loop' | 'auto' | null (all)
 */
export function getIntegratedGraph(modeFilter = null) {
  const modeMap = { e2e: 'e2e_starship', e2m: 'e2m', hyperloop: 'hyperloop', loop: 'regional_loop', auto: 'robotaxi' };
  const canonical = modeFilter ? modeMap[modeFilter] : null;

  const filteredNodes = canonical
    ? nodesRaw.filter(n => n.modes?.includes(canonical))
    : nodesRaw;

  const filteredEdges = canonical
    ? (edgesRaw.filter(e => e.mode === canonical))
    : edgesRaw;

  return {
    nodes: filteredNodes.map(n => ({
      // Integrated graph node shape (integratedGraphTypes.js)
      id:           n.id,
      networkCityId:n.networkCityId || null,
      name:         n.name,
      country:      n.country,
      region:       n.region,
      lat:          n.latitude,
      lng:          n.longitude,
      latitude:     n.latitude,
      longitude:    n.longitude,
      coordinates:  [n.longitude, n.latitude],
      population:   n.population,
      tier:         n.tier,
      // Strategy metadata enrichment: match canonical strategic hubs (NYC, Pilbara, etc.)
      // onto real dataset nodes without changing edge generation.
      node_type:    n.isE2EHub
        ? 'E2E_HUB'
        : (n.modes?.includes('e2m') ? 'E2M_HUB' : 'CITY'),
      taxonomyNodeType: (() => {
        const match = findStrategicHubForNode(n);
        if (!match) return getTaxonomyNodeType(n);
        // Convert strategic hubs into canonical hub node types.
        return match.family === 'e2e' ? 'e2e_hub' : 'e2m_hub';
      })(),
      taxonomyMode: (() => {
        const match = findStrategicHubForNode(n);
        if (!match) return getTaxonomyMode(n.modes?.[0], n.routeType);
        // Strategic hubs should visually and semantically follow the family.
        return match.family === 'e2e' ? 'e2e_starship' : 're2e';
      })(),
      mode:         (() => {
        const match = findStrategicHubForNode(n);
        if (!match) return n.modes?.[0] || 'hyperloop';
        return match.family === 'e2e' ? 'e2e_starship' : 're2e';
      })(),
      modes:        (() => {
        const match = findStrategicHubForNode(n);
        if (!match) return n.modes || [];
        // Keep existing modes but ensure strategic mode is present for UI layer filters.
        const existing = n.modes || [];
        const strategicMode = match.family === 'e2e' ? 'e2e_starship' : 're2e';
        return existing.includes(strategicMode) ? existing : [...existing, strategicMode];
      })(),
      hubRoles: (() => {
        const match = findStrategicHubForNode(n);
        if (!match) return n.hubRoles ?? [];
        return match.family === 'e2e' ? ['E2E'] : ['RE2E'];
      })(),
      tags:         n.tags || [],
      isE2EHub:     n.isE2EHub || false,
      // Economics (NEW — available to any consumer)
      economics:    n.economics || null,
      economicWeight: n.economics?.economic_weight || 0,
      taxonomyErrors:
        (typeof import.meta !== 'undefined' && import.meta.env?.DEV)
          ? validateNodeTaxonomy({
              cityStatus: n.cityStatus,
              nodeTypes: n.nodeTypes,
              nodeType: n.nodeType,
            })
          : [],
    })),

    edges: filteredEdges.map(e => {
      const from = _nodesById[e.fromNodeId];
      const to   = _nodesById[e.toNodeId];
      const taxonomyMode = getTaxonomyMode(e.mode, e.routeType);
      const taxonomyRouteType = (e.routeType && typeof e.routeType === 'string')
        ? getTaxonomyMode(e.mode, e.routeType)
        : null;
      const inferredRouteType = inferIntegratedRouteType(e, taxonomyRouteType ?? taxonomyMode);
      const inferredCorridorType = inferIntegratedCorridorType(
        e,
        taxonomyMode,
        taxonomyRouteType ?? taxonomyMode
      );
      const baseEdge = {
        // Integrated graph edge shape (integratedGraphTypes.js)
        id:            e.id,
        fromNodeId:    e.fromNodeId,
        toNodeId:      e.toNodeId,
        from:          from ? [from.longitude, from.latitude] : null,
        to:            to   ? [to.longitude,   to.latitude]   : null,
        fromName:      from?.name || '',
        toName:        to?.name   || '',
        mode:          _canonicalToIntegratedMode(e.mode),
        route_type:    inferredRouteType,
        routeType:     inferredRouteType,
        taxonomyMode,
        taxonomyRouteType: taxonomyRouteType ?? taxonomyMode,
        corridor_type: inferredCorridorType,
        corridorType:  inferredCorridorType,
        tier:          e.tier || 2,
        status:        e.status || 'conceptual',
        distanceKm:    e.distanceKm || null,
        // Render config — drives PathLayer vs ArcLayer decision
        render:        e.render || { altitudeMode: 'ground', lineStyle: 'solid' },
        // Economics
        economicWeight: e.economicWeight || null,
        taxonomyErrors:
          (typeof import.meta !== 'undefined' && import.meta.env?.DEV)
            ? validateEdgeTaxonomy({
                mode: taxonomyMode,
                routeType: taxonomyRouteType,
              })
            : [],
      };
      return { ...baseEdge, ...normalizeRenderIntent(baseEdge) };
    }).filter(e => e.from && e.to),  // drop orphan edges
  };
}

// ─── Hyperloop path output (replaces webRenderablePaths) ─────────────────────

/**
 * Returns path arrays compatible with planetary-skeleton-trunks PathLayer.
 * Each item: { path: [[lon,lat],...], mode, tier, routeId, name }
 *
 * This replaces buildPlanetaryHyperloopGraph webRenderablePaths output
 * for the integrated-hyperloop-spine layer.
 */
function resolveRouteNodeIds(route) {
  return route?.nodeIds ?? route?.nodeSequence ?? [];
}

function coordsFromRoute(route) {
  return resolveRouteNodeIds(route)
    .map((id) => _nodesById[id])
    .filter((n) => n && n.longitude != null && n.latitude != null)
    .map((n) => [n.longitude, n.latitude]);
}

function isArcOnlyTransportMode(item) {
  const mode = String(item?.mode ?? '').toLowerCase();
  return (
    mode === 'e2m' ||
    mode === 're2e' ||
    mode === 'cargo' ||
    mode === 'logistics' ||
    mode === 'e2e_starship'
  );
}

function pathRecordFromRoute(route, options = {}) {
  if (isArcOnlyTransportMode(route)) return null;

  const pathCoords = coordsFromRoute(route);
  if (pathCoords.length < 2) return null;

  const isFeeder = matchesRouteFamilies(route, 'FEEDER');
  const isLoop = matchesRouteFamilies(route, 'REGIONAL_LOOP');
  const tier = route.tier || 2;
  const enriched = enrichRouteRecord(route);

  return {
    path: pathCoords,
    routeId: route.id,
    name: route.name,
    mode: route.mode,
    routeType: route.routeType,
    tier,
    corridorId: enriched.corridorId,
    civilizationImportance: enriched.civilizationImportance,
    economicTier: route.economicTier || tier,
    avgEconomicWeight: route.avgCorridorEconomicWeight || 0,
    widthScale: isFeeder ? 1 : tier === 1 ? 3 : tier === 2 ? 2 : 1.5,
    renderFamily: isFeeder ? 'FEEDER' : isLoop ? 'REGIONAL_LOOP' : 'SPINE',
    ...options.extra,
  };
}

function routesMatchingFamilies(families, options = {}) {
  const { tierMax = 4 } = options;
  return routesRaw.filter((route) => {
    if ((route.tier || 4) > tierMax) return false;
    return matchesRouteFamilies(route, families);
  });
}

function buildPathsFromRoutes(routes, options = {}) {
  const paths = [];
  for (const route of routes) {
    const rec = pathRecordFromRoute(route, options);
    if (rec) paths.push(rec);
  }
  return paths;
}

function withViewStats(data) {
  return {
    ...data,
    stats: {
      nodeCount: data.nodes.length,
      edgeCount: data.edges.length,
      pathCount: data.paths.length,
      arcCount: data.arcs.length,
      routeCount: data.routes.length,
    },
  };
}

const _debugViewStatsLogged = new Set();

/** Dev-only: log view stats once per view name per session */
export function debugLogViewStatsOnce(viewName, stats) {
  if (typeof import.meta === 'undefined' || !import.meta.env?.DEV) return;
  if (_debugViewStatsLogged.has(viewName)) return;
  _debugViewStatsLogged.add(viewName);
  console.info(`[canonical-transport] ${viewName} view`, stats);
}

/**
 * Continental / global spine paths only (excludes loop + feeder families).
 */
export function getSpinePaths(options = {}) {
  return buildPathsFromRoutes(routesMatchingFamilies('SPINE', options), options);
}

export function getRegionalLoopPaths(options = {}) {
  return buildPathsFromRoutes(routesMatchingFamilies('REGIONAL_LOOP', options), options);
}

export function getFeederBranchPaths(options = {}) {
  return buildPathsFromRoutes(routesMatchingFamilies('FEEDER', options), options);
}

export function getConnectedGridPaths(options = {}) {
  return buildPathsFromRoutes(routesMatchingFamilies('GRID_PATH', options), options);
}

export function getConnectedGridArcs() {
  return getArcLayerData('e2e_starship');
}

/**
 * Spine segments that share nodes with regional loop / feeder routes.
 */
export function getLoopSpineConnectorPaths(options = {}) {
  const loopRoutes = routesMatchingFamilies(['REGIONAL_LOOP', 'FEEDER'], options);
  const loopNodeIds = new Set();
  for (const route of loopRoutes) {
    for (const id of resolveRouteNodeIds(route)) loopNodeIds.add(id);
  }
  const spineRoutes = routesMatchingFamilies('SPINE', options).filter((route) =>
    resolveRouteNodeIds(route).some((id) => loopNodeIds.has(id))
  );
  return buildPathsFromRoutes(spineRoutes, options);
}

/**
 * PathLayer-ready deck objects from canonical path records.
 */
export function canonicalPathsToDeckPaths(paths, { deckMode = 'hyperloop' } = {}) {
  return (paths ?? [])
    .filter((p) => {
      const mode = String(p?.mode ?? '').toLowerCase();
      return mode !== 'e2m' && mode !== 'cargo' && mode !== 'logistics';
    })
    .map((p, i) => {
    const isSpine = p.renderFamily === 'SPINE' || routeTypeInFamily(p.routeType, 'SPINE');
    return {
      id: p.routeId || `canonical-path-${i}`,
      path: p.path,
      routeClass: isSpine ? 'CONTINENTAL_SPINE' : 'REGIONAL',
      edgeCategory: isSpine ? 'CONTINENTAL_SPINE' : 'REGIONAL_TRUNK',
      infrastructureTier: p.tier ?? 2,
      economicTier: p.economicTier ?? p.tier ?? 2,
      renderable: true,
      infrastructureOnly: true,
      fromName: p.name,
      toName: p.name,
      mode: deckMode === 'loop' ? 'loop' : p.mode ?? deckMode,
      routeType: p.routeType,
      widthScale: p.widthScale,
      generatedBy: 'canonical-transport-v1.4.0',
    };
  });
}

function nodesForIds(nodeIds) {
  return [...nodeIds]
    .map((id) => _nodesById[id])
    .filter(Boolean)
    .map((n) => ({
      id: n.id,
      name: n.name,
      country: n.country,
      lat: n.latitude,
      lng: n.longitude,
      latitude: n.latitude,
      longitude: n.longitude,
      tier: n.tier,
      modes: n.modes || [],
      routeType: n.routeType,
      isE2EHub: n.isE2EHub || false,
    }));
}

function edgesForFamilies(families) {
  return edgesRaw
    .filter((e) => {
      if (e.mode === 'robotaxi') return false;
      return matchesRouteFamilies(e, families);
    })
    .map((e) => {
      const from = _nodesById[e.fromNodeId];
      const to = _nodesById[e.toNodeId];
      return {
        id: e.id,
        fromNodeId: e.fromNodeId,
        toNodeId: e.toNodeId,
        from: from ? [from.longitude, from.latitude] : null,
        to: to ? [to.longitude, to.latitude] : null,
        mode: _canonicalToIntegratedMode(e.mode),
        route_type: e.routeType,
        routeType: e.routeType,
      };
    })
    .filter((e) => e.from && e.to);
}

/**
 * Loop view: connected regional_loop + feeder paths from routes.json sequences.
 */
export function getLoopViewData(options = {}) {
  const loopPaths = getRegionalLoopPaths(options);
  const feederPaths = getFeederBranchPaths(options);
  const paths = [...loopPaths, ...feederPaths];
  const spinePaths = getLoopSpineConnectorPaths(options);
  const routes = routesMatchingFamilies(['REGIONAL_LOOP', 'FEEDER'], options);
  const nodeIds = new Set();
  for (const route of routes) {
    for (const id of resolveRouteNodeIds(route)) nodeIds.add(id);
  }
  return withViewStats({
    nodes: nodesForIds(nodeIds),
    edges: edgesForFamilies(['REGIONAL_LOOP', 'FEEDER']),
    arcs: [],
    paths,
    spinePaths,
    routes,
  });
}

/**
 * Grid view: E2E arcs + spine/loop/feeder paths + E2M orbital arcs (not ground paths).
 */
export function getGridViewData(options = {}) {
  const paths = getConnectedGridPaths(options);
  const arcs = getConnectedGridArcs(options);
  const e2mArcs = getArcLayerData('e2m').map((a) => ({
    ...a,
    mode: 'e2m',
    renderFamily: 'E2M',
  }));
  const routes = routesMatchingFamilies('GRID_PATH', options);
  const nodeIds = new Set();
  for (const route of routes) {
    for (const id of resolveRouteNodeIds(route)) nodeIds.add(id);
  }

  return withViewStats({
    nodes: nodesForIds(nodeIds),
    edges: edgesForFamilies('GRID_PATH').concat(
      edgesRaw
        .filter((e) => e.mode === 'e2m' || e.mode === 'e2e_starship')
        .map((e) => {
          const from = _nodesById[e.fromNodeId];
          const to = _nodesById[e.toNodeId];
          return {
            id: e.id,
            mode: _canonicalToIntegratedMode(e.mode),
            route_type: e.routeType,
            from: from ? [from.longitude, from.latitude] : null,
            to: to ? [to.longitude, to.latitude] : null,
          };
        })
        .filter((e) => e.from && e.to)
    ),
    arcs,
    e2mArcs,
    paths,
    routes,
  });
}

let _loopPathValidationLogged = false;

/** Dev-only: validate loop path coordinate format once */
export function validateLoopPathsOnce(paths) {
  if (typeof import.meta === 'undefined' || !import.meta.env?.DEV) return;
  if (_loopPathValidationLogged) return;
  _loopPathValidationLogged = true;
  const sample = (paths ?? []).slice(0, 3);
  for (const p of sample) {
    if (!p?.path || p.path.length < 2) {
      console.warn('[canonical-transport] loop path missing coords', p?.routeId);
      continue;
    }
    const [lng, lat] = p.path[0];
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      console.warn('[canonical-transport] loop path not [lng,lat]', p.routeId, p.path[0]);
    }
  }
  console.info('[canonical-transport] loop paths validated', {
    count: paths?.length ?? 0,
    sampleNodes: sample[0]?.path?.length ?? 0,
  });
}

/**
 * Returns path arrays compatible with planetary-skeleton-trunks PathLayer.
 * Spine routes only — loop/feeder paths use getLoopViewData / getGridViewData.
 */
export function getHyperloopPaths(options = {}) {
  return getSpinePaths(options);
}

// ─── ArcLayer output (replaces integrated-e2e-routes / starship-routes) ──────

/**
 * Returns ArcLayer-ready objects for E2E starship and E2M arc routes.
 * mode: 'e2e_starship' | 'e2m' | null (both)
 */
export function getArcLayerData(mode = null) {
  const modes = mode ? [mode] : ['e2e_starship', 'e2m'];
  const arcs  = [];

  for (const m of modes) {
    for (const e of (_edgesByMode[m] || [])) {
      const from = _nodesById[e.fromNodeId];
      const to   = _nodesById[e.toNodeId];
      if (!from || !to) continue;

      const ew  = e.economicWeight?.gdpGeometricMean || 0;
      const tier= e.tier || 2;

      arcs.push({
        id:             e.id,
        sourcePosition: [from.longitude, from.latitude],
        targetPosition: [to.longitude,   to.latitude],
        fromName:       from.name,
        toName:         to.name,
        mode:           m,
        tier,
        routeId:        e.routeId || null,
        distanceKm:     e.distanceKm || null,
        // Economics-driven width/opacity
        economicWeight: ew,
        width:          ew >= 40 ? 4 : ew >= 15 ? 3 : ew >= 5 ? 2 : 1,
        opacity:        ew >= 40 ? 0.9 : ew >= 15 ? 0.7 : 0.5,
        // Color tokens — match your existing hyperloopRouteStyles
        sourceColor:    m === 'e2e_starship' ? [255, 107, 53, 200] : [255, 215, 0, 180],
        targetColor:    m === 'e2e_starship' ? [255, 107, 53, 60]  : [255, 215, 0, 60],
      });
    }
  }

  // Sort by economic weight — highest priority arcs rendered last (on top)
  return arcs.sort((a, b) => a.economicWeight - b.economicWeight);
}

// ─── PathLayer output (replaces integrated-hyperloop-spine + loop routes) ─────

/**
 * Returns PathLayer-ready objects for hyperloop and loop routes.
 * mode: 'hyperloop' | 'regional_loop' | null (both)
 */
export function getPathLayerData(mode = null) {
  if (mode === 'e2m') {
    console.warn('[canonical-transport] getPathLayerData("e2m") is deprecated — use getArcLayerData("e2m")');
    return [];
  }

  const families =
    mode === 'regional_loop'
      ? ['REGIONAL_LOOP']
      : mode === 'hyperloop'
        ? ['SPINE']
        : ['SPINE', 'REGIONAL_LOOP'];

  return buildPathsFromRoutes(routesMatchingFamilies(families)).map((p) => ({
    id: p.routeId,
    path: p.path,
    name: p.name,
    mode: p.mode,
    routeType: p.routeType,
    tier: p.tier,
    economicTier: p.economicTier,
    economicWeight: p.avgEconomicWeight,
    widthScale: p.widthScale,
    color:
      matchesRouteFamilies(p, 'REGIONAL_LOOP')
        ? [168, 255, 62, 160]
        : [0, 212, 255, 200],
  }));
}

// ─── ScatterplotLayer output (replaces integrated-e2e-hubs, integrated-mineral-hubs)

/**
 * Returns ScatterplotLayer-ready objects.
 * mode: 'e2e_starship' | 'e2m' | 'hyperloop' | null (tier 1+2 hubs)
 */
export function getScatterData(mode = null) {
  const source = mode ? (_nodesByMode[mode] || []) : nodesRaw.filter(n => n.tier <= 2);
  return source.map(n => ({
    id:           n.id,
    coordinates:  [n.longitude, n.latitude],
    name:         n.name,
    country:      n.country,
    tier:         n.tier,
    isE2EHub:     n.isE2EHub || false,
    population:   n.population,
    economicWeight: n.economics?.economic_weight || 0,
    // Radius scaled by tier + economic weight
    radius:       n.tier === 1 ? 80000 : n.tier === 2 ? 50000 : 30000,
    color:        n.isE2EHub
      ? [255, 107, 53, 220]
      : n.tier === 1
        ? [0, 212, 255, 200]
        : [100, 200, 255, 150],
  }));
}

// ─── Layer visibility (replaces zoomVisibility.js) ───────────────────────────

/**
 * Returns per-mode visibility config for a given zoom level.
 * Replaces the patchwork of zoomVisibility.js + edgeHasValidVisibilityZoom.
 *
 * Usage in FuturisticTransportMap.jsx:
 *   const vis = getLayerVisibility(viewState.zoom);
 *   if (!vis.hyperloop.show) skip hyperloop layer...
 */
export function getLayerVisibility(zoom) {
  const result = {};
  for (const [modeId, mode] of Object.entries(MODES)) {
    result[modeId] = getModeVisibility(modeId, zoom);
  }
  return result;
}

// ─── Mode registry (replaces transportOperatingSystem.js + modeRegistry.js) ──

/**
 * Returns mode config in a shape compatible with your existing TRANSPORT_MODES usage.
 */
export function getModeRegistry() {
  return Object.fromEntries(
    Object.entries(MODES).map(([id, mode]) => [
      // Map canonical ID to app's TRANSPORT_MODES keys
      _canonicalToAppModeKey(id),
      {
        id,
        label:          mode.label,
        description:    mode.description,
        defaultVisible: mode.defaultVisible,
        minZoom:        mode.minZoom,
        colorToken:     mode.colorToken,
        lineStyle:      mode.lineStyle,
        supports3D:     mode.supports3D,
        altitudeMode:   mode.altitudeMode,
        graphBehavior:  id === 'robotaxi' ? 'overlayOnly' : 'integrated',
        zoomTiers:      mode.zoomTiers,
      }
    ])
  );
}

// ─── Network stats (for Metrics panel) ──────────────────────────────────────

/**
 * Returns stats for the Metrics panel / diagnostics.
 */
export function getNetworkStats() {
  const byMode    = {};
  const byRegion  = {};
  const byTier    = { 1:0, 2:0, 3:0, 4:0 };

  for (const n of nodesRaw) {
    byRegion[n.region] = (byRegion[n.region] || 0) + 1;
    byTier[n.tier] = (byTier[n.tier] || 0) + 1;
    for (const m of (n.modes || [])) {
      if (!byMode[m]) byMode[m] = { nodes: 0, edges: 0 };
      byMode[m].nodes++;
    }
  }
  for (const e of edgesRaw) {
    if (!byMode[e.mode]) byMode[e.mode] = { nodes: 0, edges: 0 };
    byMode[e.mode].edges++;
  }

  const totalDistKm = edgesRaw.reduce((s, e) => s + (e.distanceKm || 0), 0);
  const e2eCount    = edgesRaw.filter(e => e.mode === 'e2e_starship').length;
  const hlCount     = edgesRaw.filter(e => e.mode === 'hyperloop').length;

  return {
    totalNodes:     nodesRaw.length,
    totalEdges:     edgesRaw.length,
    totalRoutes:    routesRaw.length,
    totalLayers:    layersRaw.length,
    e2eHubs:        nodesRaw.filter(n => n.isE2EHub).length,
    tier1Nodes:     byTier[1],
    tier2Nodes:     byTier[2],
    totalDistanceKm:Math.round(totalDistKm),
    e2eEdges:       e2eCount,
    hyperloopEdges: hlCount,
    byMode,
    byRegion,
    byTier,
    version:        '1.4.0',
    dataSource:     'canonical-transport-dataset',
  };
}

// ─── Validation output (for Data Inspector) ──────────────────────────────────

export function getValidationReport() {
  const errors   = [];
  const warnings = [];
  const nodeIds  = new Set(nodesRaw.map(n => n.id));

  for (const e of edgesRaw) {
    if (!nodeIds.has(e.fromNodeId)) errors.push({ type: 'ORPHAN_FROM', edgeId: e.id, missing: e.fromNodeId });
    if (!nodeIds.has(e.toNodeId))   errors.push({ type: 'ORPHAN_TO',   edgeId: e.id, missing: e.toNodeId });
  }

  for (const n of nodesRaw) {
    if (!n.hasCoordinates) warnings.push({ type: 'MISSING_COORDS', nodeId: n.id, name: n.name });
    if (!n.modes?.length)  warnings.push({ type: 'EMPTY_MODES',    nodeId: n.id, name: n.name });
  }

  const nodesWithEdges = new Set([...edgesRaw.map(e => e.fromNodeId), ...edgesRaw.map(e => e.toNodeId)]);
  const isolated = nodesRaw.filter(n => !nodesWithEdges.has(n.id));

  return {
    valid:     errors.length === 0,
    errors,
    warnings,
    isolatedNodeCount: isolated.length,
    isolatedNodes:     isolated.map(n => ({ id: n.id, name: n.name, tier: n.tier })),
  };
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function _canonicalToIntegratedMode(mode) {
  const map = { e2e_starship: 'e2e', e2m: 'e2m', hyperloop: 'hyperloop', regional_loop: 'loop', robotaxi: 'auto' };
  return map[mode] || mode;
}

function _canonicalToAppModeKey(id) {
  const map = {
    e2e_starship:  'E2E_STARSHIP',
    hyperloop:     'HYPERLOOP_CORE',
    regional_loop: 'CIVILIZATION_GRID',
    e2m:           'E2M_ORBITAL',
    robotaxi:      'ROBOTAXI',
    rail:          'RAIL',
    port:          'PORT',
    grid:          'GRID',
    custom:        'CUSTOM',
  };
  return map[id] || id.toUpperCase();
}

/** All canonical edges (raw transport graph) with corridor metadata. */
export function getAllEdges() {
  return edgesRaw.map(enrichEdgeRecord);
}

// ─── Default export: everything bundled ──────────────────────────────────────

export default {
  // Raw data
  nodes:   nodesRaw,
  edges:   edgesRaw,
  routes:  routesRaw,
  layers:  layersRaw,
  nodesById: _nodesById,
  getAllEdges,

  // App-compatible outputs
  getE2EHubs,
  getIntegratedGraph,
  getHyperloopPaths,
  getSpinePaths,
  getRegionalLoopPaths,
  getFeederBranchPaths,
  getConnectedGridPaths,
  getConnectedGridArcs,
  getLoopViewData,
  getGridViewData,
  getLoopSpineConnectorPaths,
  canonicalPathsToDeckPaths,
  debugLogViewStatsOnce,
  validateLoopPathsOnce,
  getArcLayerData,
  getPathLayerData,
  getScatterData,
  getLayerVisibility,
  getModeRegistry,
  getNetworkStats,
  getValidationReport,

  // ID bridge
  appIdToCanonicalId,
  canonicalIdToAppId,

  // Direct lookup
  getNodeById:    (id)   => _nodesById[id]          || null,
  getNodesByMode: (mode) => _nodesByMode[mode]       || [],
  getEdgesByMode: (mode) => _edgesByMode[mode]       || [],
  getRoutesByMode:(mode) => _routesByMode[mode]      || [],
  getE2ENodes:    ()     => nodesRaw.filter(n => n.isE2EHub),
  getTier1Nodes:  ()     => nodesRaw.filter(n => n.tier === 1),
  getTransferHubs:()     => nodesRaw.filter(n => n.tags?.includes('transfer_hub')),
};
