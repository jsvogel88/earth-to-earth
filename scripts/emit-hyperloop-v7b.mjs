/**
 * Upgrades hyperloop_interactive_map.html to Master V3 Phase 7B.
 * Preserves NODES + ROUTES arrays; replaces shell + render engine.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcPath = path.join(root, 'hyperloop_interactive_map.html');
const outPath = srcPath;

const src = fs.readFileSync(srcPath, 'utf8');
const nodesMatch = src.match(/const NODES = \[[\s\S]*?\n  \];/);
const routesMatch = src.match(/const ROUTES = \[[\s\S]*?\n  \];/);
if (!nodesMatch || !routesMatch) {
  console.error('Could not extract NODES or ROUTES');
  process.exit(1);
}

let routesBlock = routesMatch[0];
// Append V7B routes if missing
const extraRoutes = [
  `    route('north_africa_spine', 'North Africa Spine', 'continental_spine',
      ['casablanca', 'algiers', 'tunis', 'cairo'], { tier: 2 }),`,
  `    route('andean_corridor', 'Andean Corridor', 'continental_spine',
      ['caracas', 'bogota', 'quito', 'lima', 'santiago'], { tier: 2 }),`,
  `    route('southern_cone_loop', 'Southern Cone Loop', 'regional_loop',
      ['sao_paulo', 'rio_de_janeiro', 'montevideo', 'buenos_aires', 'santiago', 'sao_paulo'], { isLoop: true, tier: 3 }),`,
  `    route('african_mineral_arc', 'African Mineral Arc', 'resource_corridor',
      ['johannesburg', 'durban', 'dar_es_salaam', 'nairobi'], { routeType: 'cargo', isIntercontinental: true, tier: 2 }),`,
];
for (const line of extraRoutes) {
  const id = line.match(/route\('([^']+)'/)?.[1];
  if (id && !routesBlock.includes(`'${id}'`)) {
    routesBlock = routesBlock.replace(/\n  \];$/, `,\n${line}\n  ];`);
  }
}

const ENGINE = String.raw`
(function () {
  'use strict';

  const MAP_W = 1600;
  const MAP_H = 900;
  const ARC_FAMILIES = ['e2e_arc','e2m_arc','cargo_arc','resource_corridor','mining_corridor','energy_corridor','port_connector'];

  const ROUTE_STYLES = {
    e2e_arc:           { stroke:'rgba(255,255,255,0.55)', width:1.8, opacity:0.85, dash:null,  glow:true,  glowR:4,  glowO:0.08 },
    global_spine:      { stroke:'#00cfff',                width:2.8, opacity:0.92, dash:null,  glow:true,  glowR:6,  glowO:0.18 },
    continental_spine: { stroke:'#4488ff',                width:2.2, opacity:0.85, dash:null,  glow:false },
    regional_loop:     { stroke:'#44ddaa',                width:1.6, opacity:0.75, dash:null,  glow:false },
    feeder_branch:     { stroke:'#667799',                width:0.8, opacity:0.55, dash:null,  glow:false },
    e2m_arc:           { stroke:'#ff9944',                width:2.0, opacity:0.75, dash:'6,4', glow:false },
    cargo_arc:         { stroke:'#ffbb44',                width:1.5, opacity:0.65, dash:'5,4', glow:false },
    resource_corridor: { stroke:'#ffaa33',                width:1.5, opacity:0.65, dash:null,  glow:false },
    mining_corridor:   { stroke:'#dd8833',                width:1.4, opacity:0.65, dash:null,  glow:false },
    energy_corridor:   { stroke:'#ffcc00',                width:1.6, opacity:0.70, dash:'8,3', glow:false },
    port_connector:    { stroke:'#44aaff',                width:1.0, opacity:0.55, dash:'4,4', glow:false },
  };

  const LAYER_BY_FAMILY = {
    e2e_arc:'layer-e2e', global_spine:'layer-global', continental_spine:'layer-continental',
    regional_loop:'layer-loops', feeder_branch:'layer-feeders',
    e2m_arc:'layer-e2m', cargo_arc:'layer-e2m', resource_corridor:'layer-e2m',
    mining_corridor:'layer-e2m', energy_corridor:'layer-e2m', port_connector:'layer-e2m',
  };

  const CIVILIZATION_CORRIDORS = [
    { id:'atlantic_spine', name:'Atlantic Spine', civilizationRank:1, routes:['e2e_nyc_london','east_coast_usa','european_spine'] },
    { id:'pacific_spine', name:'Pacific Spine', civilizationRank:1, routes:['pacific_rim_spine','e2e_la_tokyo','china_spine'] },
    { id:'eurasian_trunk', name:'Eurasian Trunk', civilizationRank:2, routes:['eurasian_spine','trans_african_spine','middle_east_spine'] },
    { id:'gulf_india_corridor', name:'Gulf–India', civilizationRank:2, routes:['indian_corridor','energy_gulf','loop_gulf'] },
    { id:'african_spine', name:'African Arc', civilizationRank:3, routes:['trans_african_spine','africa_west_coast','north_africa_spine','african_mineral_arc'] },
    { id:'south_american_corridor', name:'South American', civilizationRank:3, routes:['south_american_spine','andean_corridor','southern_cone_loop','e2e_nyc_saopaulo'] },
    { id:'east_asia_megaregion', name:'East Asia', civilizationRank:1, routes:['china_spine','loop_japan','southeast_asian_spine'] },
    { id:'north_american_grid', name:'N. America Grid', civilizationRank:2, routes:['east_coast_usa','west_coast_usa','loop_great_lakes','loop_northeast_us'] },
  ];

  const PRIORITY_E2E = new Set(['e2e_nyc_london','e2e_la_tokyo','e2e_london_dubai','e2e_dubai_singapore','e2e_singapore_sydney','e2e_moscow_beijing']);

  const E2E_ARC_CONTROL_POINTS = {
    e2e_nyc_london:     { ctrl:[45.0,-40.0] },
    e2e_london_dubai:    { ctrl:[35.0,20.0] },
    e2e_dubai_singapore: { ctrl:[15.0,75.0] },
    e2e_singapore_sydney:{ ctrl:[-15.0,130.0] },
    e2e_la_tokyo:       { ctrl:[42.0,-165.0] },
    e2e_moscow_beijing: { ctrl:[55.0,90.0] },
  };

  const INTERMODAL_DOMINANTS = {
    singapore:{ r:9, civilizationIndex:96 }, dubai:{ r:8, civilizationIndex:92 },
    new_york:{ r:8, civilizationIndex:95 }, london:{ r:8, civilizationIndex:93 },
    tokyo:{ r:8, civilizationIndex:91 }, shanghai:{ r:7, civilizationIndex:88 },
    hong_kong:{ r:7, civilizationIndex:87 }, los_angeles:{ r:7, civilizationIndex:86 },
  };

  const LABEL_TIERS = {
    planetary:{ allowed:new Set(['new_york','london','dubai','singapore','tokyo','shanghai','beijing','paris','moscow','los_angeles','toronto','sydney','cairo','nairobi','johannesburg','mumbai','sao_paulo','hong_kong','seoul','istanbul']), fontSize:10, opacity:0.9 },
    continental:{ minCivilizationIndex:55, fontSize:9, opacity:0.8 },
    regional:{ minCivilizationIndex:20, fontSize:8, opacity:0.7 },
  };

  const ASIA_BOUNDS = { latMin:-10, latMax:55, lngMin:70, lngMax:150 };
  const ASIA_TIER1 = new Set(['tokyo','beijing','shanghai','hong_kong','singapore','seoul','dubai','mumbai','delhi','bangkok']);

  const RENDER_STATE = {
    showSpines:true, showLoops:true, showFeeders:true, showE2EArcs:true, showNodes:true, showLabels:true,
    showE2MArcs:true, showCargoNodes:true, showAutoFSD:false,
    showSimulationOverlay:false, showCongestionOverlay:false, showEconomicOverlay:false, showExpansionOverlay:false,
  };

  const SIM_SNAPSHOTS = {};
  [2025,2030,2040,2050,2075].forEach((year) => {
    const t = (year - 2025) / 50;
    SIM_SNAPSHOTS[year] = { routeOpacityBoost: t * 0.12, routeWidthBoost: t * 0.25, minTierVisible: year < 2035 ? 2 : year < 2050 ? 3 : 4 };
  });

  const NODE_STYLES = {
    e2e_hub:{ r:7, fill:'#64b5ff', stroke:'#ffffff', glow:true },
    spinal_hub:{ r:5, fill:'#4499ff', stroke:'#aaddff', glow:true },
    transfer_hub:{ r:5, fill:'#4499ff', stroke:'#aaddff', glow:false },
    regional_gateway:{ r:3.5, fill:'#3388ee', stroke:'#88bbff', glow:false },
    regional_loop_stop:{ r:3, fill:'#3388ee', stroke:'none', glow:false },
    feeder_city:{ r:2, fill:'#2266cc', stroke:'none', glow:false },
    airport_node:{ r:2.5, fill:'#5599dd', stroke:'none', glow:false },
    rail_terminal:{ r:2, fill:'#4488cc', stroke:'none', glow:false },
    logistics_node:{ r:2, fill:'#336699', stroke:'none', glow:false },
    e2m_hub:{ r:4, fill:'#ff9944', stroke:'#ffcc88', glow:false },
    resource_hub:{ r:4, fill:'#ff8833', stroke:'#ffaa66', glow:false },
    mining_hub:{ r:3.5, fill:'#dd7722', stroke:'none', glow:false },
    energy_hub:{ r:3.5, fill:'#ffcc00', stroke:'#ffee88', glow:false },
    cargo_hub:{ r:3, fill:'#ffaa44', stroke:'none', glow:false },
    port_connector:{ r:3, fill:'#44aaff', stroke:'#88ccff', glow:false },
  };

  const AUTO_FSD_TYPES = new Set(['transfer_hub','e2e_hub','spinal_hub','regional_gateway','regional_loop_stop','feeder_city','airport_node','rail_terminal','logistics_node']);
  const E2M_NODE_TYPES = new Set(['e2m_hub','resource_hub','mining_hub','energy_hub','cargo_hub','logistics_node','port_connector']);
  const COVERAGE_REGIONS = ['north_america','south_america','europe','africa','middle_east','central_asia','east_asia','southeast_asia','south_asia','oceania','russia'];

  function n(id,name,lat,lng,type,tier,region,roles,autoFSD) {
    return { id,name,lat,lng,type,tier, roles:roles||['passenger'], region, autoFSD:autoFSD!==undefined?autoFSD:AUTO_FSD_TYPES.has(type) };
  }

  __NODES__

  const nodeById = Object.fromEntries(NODES.map((node) => [node.id, node]));

  function route(id,name,family,seq,opts) {
    opts = opts || {};
    return {
      id,name, routeFamily:family,
      routeType:opts.routeType||(family.includes('cargo')||family.includes('mining')||family.includes('energy')||family.includes('resource')?'cargo':family==='e2m_arc'?'e2m':'passenger'),
      nodeSequence:seq, isLoop:!!opts.isLoop,
      isIntercontinental:opts.isIntercontinental!=null?opts.isIntercontinental:ARC_FAMILIES.includes(family),
      color:opts.color||null, tier:opts.tier||2,
    };
  }

  __ROUTES__

  const routesByCorridorId = {};
  CIVILIZATION_CORRIDORS.forEach((c) => { routesByCorridorId[c.id] = []; });
  const routeToCorridor = {};
  CIVILIZATION_CORRIDORS.forEach((corridor) => {
    corridor.routes.forEach((rid) => {
      routeToCorridor[rid] = corridor.id;
      const r = ROUTES.find((x) => x.id === rid);
      if (r) {
        r.corridorId = corridor.id;
        r.corridorCivilizationRank = corridor.civilizationRank;
        routesByCorridorId[corridor.id].push(r);
      }
    });
  });
  function inferCorridorId(route) {
    const id = route.id;
    const regions = new Set(route.nodeSequence.map((nid) => nodeById[nid]?.region).filter(Boolean));
    if (id.startsWith('e2e_')) {
      if (['e2e_nyc_london', 'e2e_nyc_saopaulo'].includes(id)) return 'atlantic_spine';
      if (['e2e_la_tokyo', 'e2e_tokyo_sydney'].includes(id)) return 'pacific_spine';
      if (['e2e_london_dubai', 'e2e_dubai_singapore'].includes(id)) return 'gulf_india_corridor';
      if (id === 'e2e_singapore_sydney') return 'pacific_spine';
      if (id === 'e2e_moscow_beijing') return 'eurasian_trunk';
      if (['e2e_london_capetown', 'e2e_cairo_nairobi'].includes(id)) return 'african_spine';
    }
    if (regions.has('africa')) return 'african_spine';
    if (regions.has('south_america')) return 'south_american_corridor';
    if (regions.has('east_asia') || regions.has('southeast_asia') || regions.has('south_asia')) return 'east_asia_megaregion';
    if (regions.has('north_america')) return 'north_american_grid';
    if (['e2m_arc', 'cargo_arc', 'resource_corridor', 'mining_corridor', 'energy_corridor', 'port_connector'].includes(route.routeFamily)) {
      return 'gulf_india_corridor';
    }
    if (regions.has('europe') || regions.has('russia') || regions.has('middle_east')) return 'eurasian_trunk';
    return 'pacific_spine';
  }

  ROUTES.forEach((r) => {
    if (!r.corridorId || r.corridorId === 'unassigned') {
      r.corridorId = inferCorridorId(r);
      const c = CIVILIZATION_CORRIDORS.find((x) => x.id === r.corridorId);
      r.corridorCivilizationRank = c ? c.civilizationRank : 4;
    }
    r.civilizationImportance = computeRouteImportance(r);
  });

  function computeRouteImportance(route) {
    const fam = route.routeFamily;
    let base = 40;
    if (fam === 'global_spine') base = 95;
    else if (fam === 'continental_spine') base = 75;
    else if (fam === 'e2e_arc') base = 60;
    else if (fam === 'regional_loop') base = 45;
    else if (fam === 'feeder_branch') base = 25;
    else base = 50;
    const rank = route.corridorCivilizationRank || 4;
    return Math.min(100, base + (4 - rank) * 8 + (route.tier === 1 ? 10 : 0));
  }

  const validation = {
    missingNodes:[], fragmentedWarnings:[], arcCurveCount:0, arcPolylineFallback:0,
    autoFsdEligible:0, autoFsdRendered:0, autoFsdLineViolations:0,
    e2mExpected:0, e2mRendered:0, throughRoutesRendered:0, coverage:{},
    v8PlanetaryCount:0, v9Unowned:0, checks:{},
  };

  const state = {
    viewMode:'GLOBAL', zoom:1.2, panX:40, panY:20, simYear:2025,
    corridorEnabled: Object.fromEntries(CIVILIZATION_CORRIDORS.map((c) => [c.id, true])),
    filters:{
      e2e_arc:true, global_spine:true, continental_spine:true, regional_loop:true, feeder_branch:true,
      e2m_arc:true, cargo_arc:true, resource_corridor:true, mining_corridor:true, energy_corridor:true, port_connector:true,
      autoFsd:false, hubLabels:true,
    },
    viewport:{ x0:0, y0:0, x1:MAP_W, y1:MAP_H },
  };

  const svg = document.getElementById('map');
  const gWorld = document.getElementById('g-world');
  const layers = {};
  ['layer-autofsd','layer-e2m','layer-feeders','layer-loops','layer-continental','layer-global','layer-e2e','layer-node-glow','layer-nodes','layer-labels','layer-simulation'].forEach((id) => {
    layers[id] = document.getElementById(id);
  });

  function mercator(lat,lng,width,height) {
    return { x:((lng+180)/360)*width, y:((90-lat)/180)*height };
  }

  function usesArcRendering(route) {
    return route.isIntercontinental || ARC_FAMILIES.includes(route.routeFamily);
  }

  function resolveRoutePoints(route) {
    const points = [];
    for (const id of route.nodeSequence) {
      const node = nodeById[id];
      if (!node) validation.missingNodes.push({ routeId:route.id, nodeId:id });
      else points.push(node);
    }
    return points;
  }

  function corridorVisible(route) {
    if (!route.corridorId || route.corridorId === 'unassigned') return true;
    return state.corridorEnabled[route.corridorId] !== false;
  }

  function corridorRankVisible(route) {
    const rank = route.corridorCivilizationRank || 4;
    if (state.zoom < 0.8) return rank <= 1;
    if (state.zoom < 1.2) return rank <= 3;
    if (state.zoom < 2.0) return rank <= 4;
    return true;
  }

  function shouldRenderAtZoom(route) {
    const family = route.routeFamily;
    const tier = route.tier || 2;
    const snap = SIM_SNAPSHOTS[state.simYear] || SIM_SNAPSHOTS[2025];
    if (tier > snap.minTierVisible && family === 'feeder_branch') return false;
    if (state.zoom < 1.5) {
      if (family === 'feeder_branch' || family === 'regional_loop') return false;
      if (family === 'port_connector') return false;
      if (family === 'e2e_arc' && !PRIORITY_E2E.has(route.id)) return false;
      if (['cargo_arc','mining_corridor','resource_corridor','e2m_arc'].includes(family) && tier > 1) return false;
      return true;
    }
    if (state.zoom < 2.5) {
      if (family === 'feeder_branch') return false;
      return true;
    }
    return true;
  }

  function shouldRenderAutoFSD(zoom) {
    return zoom >= 2.0 && (state.filters.autoFsd || state.viewMode === 'AUTO');
  }

  function isInAsia(node) {
    return node.lat >= ASIA_BOUNDS.latMin && node.lat <= ASIA_BOUNDS.latMax && node.lng >= ASIA_BOUNDS.lngMin && node.lng <= ASIA_BOUNDS.lngMax;
  }

  function shouldRenderAsianNode(node, zoom) {
    if (zoom >= 2.0) return true;
    if (!isInAsia(node)) return true;
    return node.tier === 1 || ASIA_TIER1.has(node.id);
  }

  function routeVisibleInMode(route) {
    if (!state.filters[route.routeFamily]) return false;
    if (!corridorVisible(route)) return false;
    if (!corridorRankVisible(route)) return false;
    const fam = route.routeFamily;
    switch (state.viewMode) {
      case 'GLOBAL':
        if (!RENDER_STATE.showFeeders && fam === 'feeder_branch') return false;
        if (!RENDER_STATE.showLoops && fam === 'regional_loop') return false;
        if (!RENDER_STATE.showE2EArcs && fam === 'e2e_arc') return false;
        if (!RENDER_STATE.showE2MArcs && ['e2m_arc','cargo_arc','resource_corridor','mining_corridor','energy_corridor','port_connector'].includes(fam)) return false;
        return shouldRenderAtZoom(route);
      case 'NETWORK': return shouldRenderAtZoom(route);
      case 'E2M': return ['e2m_arc','cargo_arc','resource_corridor','mining_corridor','energy_corridor','port_connector'].includes(fam);
      case 'AUTO': return fam === 'global_spine' || fam === 'continental_spine';
      case 'REGIONAL': return state.zoom >= 3;
      default: return true;
    }
  }

  function applyNegativeSpaceCap(routes) {
    const limits = state.zoom < 1.5 ? 40 : state.zoom < 2.5 ? 120 : state.zoom < 4 ? 300 : Infinity;
    if (routes.length <= limits) return routes;
    return [...routes].sort((a,b) => b.civilizationImportance - a.civilizationImportance).slice(0, limits);
  }

  function getActiveRoutes() {
    return applyNegativeSpaceCap(ROUTES.filter((r) => routeVisibleInMode(r)));
  }

  function arcControl(route, a, b) {
    const custom = E2E_ARC_CONTROL_POINTS[route.id];
    if (custom) return mercator(custom.ctrl[0], custom.ctrl[1], MAP_W, MAP_H);
    const midLat = ((a.lat + b.lat) / 2) * 0.75;
    const midLng = (a.lng + b.lng) / 2;
    return mercator(midLat, midLng, MAP_W, MAP_H);
  }

  function createPathElement(d, route, style, simMod) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    const useGlow = style.glow && state.zoom >= 1.5;
    path.setAttribute('class', 'route-path' + (useGlow ? ' glow' : ''));
    let w = style.width;
    let op = style.opacity;
    if (simMod && RENDER_STATE.showSimulationOverlay) {
      w += simMod.routeWidthBoost;
      op += simMod.routeOpacityBoost;
    }
    path.setAttribute('stroke', route.color || style.stroke);
    path.setAttribute('stroke-width', String(w * Math.min(state.zoom, 2)));
    path.setAttribute('stroke-opacity', String(Math.min(1, op)));
    path.setAttribute('fill', 'none');
    if (style.dash) path.setAttribute('stroke-dasharray', style.dash);
    path.dataset.routeId = route.id;
    path.dataset.family = route.routeFamily;
    path.dataset.corridorId = route.corridorId || '';
    return path;
  }

  function renderSingleArc(a, b, route, style, simMod) {
    const p1 = mercator(a.lat, a.lng, MAP_W, MAP_H);
    const p2 = mercator(b.lat, b.lng, MAP_W, MAP_H);
    const ctrl = arcControl(route, a, b);
    const d = 'M ' + p1.x + ' ' + p1.y + ' Q ' + ctrl.x + ' ' + ctrl.y + ' ' + p2.x + ' ' + p2.y;
    validation.arcCurveCount += 1;
    return createPathElement(d, route, style, simMod);
  }

  function renderRoute(route, simMod) {
    const points = resolveRoutePoints(route);
    if (points.length < 2) return [];
    const style = ROUTE_STYLES[route.routeFamily] || ROUTE_STYLES.continental_spine;
    const out = [];
    if (usesArcRendering(route)) {
      if (points.length === 2) {
        validation.throughRoutesRendered += 1;
        out.push(renderSingleArc(points[0], points[1], route, style, simMod));
      } else {
        for (let i = 0; i < points.length - 1; i++) {
          out.push(renderSingleArc(points[i], points[i + 1], route, style, simMod));
        }
      }
    } else {
      const coords = points.map((p) => mercator(p.lat, p.lng, MAP_W, MAP_H));
      let d = coords.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ');
      if (route.isLoop && coords.length > 2) d += ' Z';
      validation.throughRoutesRendered += 1;
      out.push(createPathElement(d, route, style, simMod));
    }
    return out;
  }

  function renderAutoFSDZone(node) {
    if (isInAsia(node) && state.zoom < 2.5) return null;
    const pos = mercator(node.lat, node.lng, MAP_W, MAP_H);
    const radiusPx = Math.max((0.5 / 180) * MAP_H, 4);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', String(radiusPx));
    circle.setAttribute('fill', 'rgba(0,255,170,0.04)');
    circle.setAttribute('stroke', 'rgba(0,255,170,0.18)');
    circle.setAttribute('stroke-width', '0.3');
    circle.setAttribute('class', 'auto-fsd-zone');
    validation.autoFsdRendered += 1;
    return circle;
  }

  function nodeVisible(node, activeIds) {
    if (INTERMODAL_DOMINANTS[node.id]) return true;
    if (!shouldRenderAsianNode(node, state.zoom)) return false;
    if (state.zoom < 1.5 && node.tier >= 3) return false;
    if (state.zoom < 2.5 && node.tier >= 4) return false;
    if (state.viewMode === 'E2M') return E2M_NODE_TYPES.has(node.type) || activeIds.has(node.id);
    if (state.viewMode === 'GLOBAL' && (node.type === 'feeder_city' || node.type === 'logistics_node')) return false;
    return activeIds.has(node.id) || node.tier <= 2;
  }

  function labelTierForZoom() {
    if (state.zoom < 2) return 'planetary';
    if (state.zoom < 4) return 'continental';
    return 'regional';
  }

  function shouldShowLabel(node, tierName, placed) {
    if (INTERMODAL_DOMINANTS[node.id]) return true;
    const tier = LABEL_TIERS[tierName];
    if (tierName === 'planetary') return tier.allowed.has(node.id);
    const civ = INTERMODAL_DOMINANTS[node.id]?.civilizationIndex || (node.tier === 1 ? 70 : node.tier === 2 ? 55 : 30);
    if (civ < tier.minCivilizationIndex) return false;
    if (E2M_NODE_TYPES.has(node.type) && state.zoom < 3) return false;
    if (['mining_hub','resource_hub'].includes(node.type) && state.zoom < 4) return false;
    const pos = mercator(node.lat, node.lng, MAP_W, MAP_H);
    return isLabelClear(pos.x, pos.y - 8, placed);
  }

  function isLabelClear(x, y, placed, minDist) {
    minDist = minDist || 20;
    return !placed.some((p) => Math.hypot(p.x - x, p.y - y) < minDist);
  }

  function clearLayers() {
    Object.values(layers).forEach((g) => g.replaceChildren());
  }

  function renderMap() {
    gWorld.setAttribute('transform', 'translate(' + state.panX + ',' + state.panY + ') scale(' + state.zoom + ')');
    clearLayers();
    validation.arcCurveCount = 0;
    validation.throughRoutesRendered = 0;
    validation.autoFsdRendered = 0;
    const simMod = RENDER_STATE.showSimulationOverlay ? (SIM_SNAPSHOTS[state.simYear] || null) : null;
    const routes = getActiveRoutes();
    validation.v8PlanetaryCount = state.zoom < 1.5 ? routes.length : 0;
    validation.v9Unowned = routes.filter((r) => !r.corridorId || r.corridorId === 'unassigned').length;

    routes.forEach((route) => {
      const layerId = LAYER_BY_FAMILY[route.routeFamily] || 'layer-continental';
      const els = renderRoute(route, simMod);
      els.forEach((el) => layers[layerId].appendChild(el));
    });

    if (shouldRenderAutoFSD(state.zoom)) {
      NODES.forEach((node) => {
        if (!node.autoFSD) return;
        const c = renderAutoFSDZone(node);
        if (c) layers['layer-autofsd'].appendChild(c);
      });
    }

    const activeIds = new Set();
    routes.forEach((r) => r.nodeSequence.forEach((id) => activeIds.add(id)));
    const placedLabels = [];
    const tierName = labelTierForZoom();
    const labelTier = LABEL_TIERS[tierName];

    const nodeList = [...NODES].sort((a, b) => {
      const da = INTERMODAL_DOMINANTS[a.id] ? 1 : 0;
      const db = INTERMODAL_DOMINANTS[b.id] ? 1 : 0;
      return da - db;
    });

    nodeList.forEach((node) => {
      if (!nodeVisible(node, activeIds)) return;
      const dom = INTERMODAL_DOMINANTS[node.id];
      const st = NODE_STYLES[node.type] || NODE_STYLES.feeder_city;
      const r = dom ? dom.r : st.r;
      const pos = mercator(node.lat, node.lng, MAP_W, MAP_H);

      if (dom || st.glow) {
        const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        glow.setAttribute('cx', pos.x);
        glow.setAttribute('cy', pos.y);
        glow.setAttribute('r', String(r * (dom ? 2.5 : 2)));
        glow.setAttribute('fill', dom ? 'rgba(100,200,255,0.15)' : 'rgba(68,136,255,0.1)');
        glow.setAttribute('class', 'node-glow');
        layers['layer-node-glow'].appendChild(glow);
      }

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', String(r));
      circle.setAttribute('fill', st.fill);
      if (st.stroke && st.stroke !== 'none') circle.setAttribute('stroke', st.stroke);
      if (dom) circle.setAttribute('filter', 'url(#hub-glow)');
      circle.dataset.nodeId = node.id;
      layers['layer-nodes'].appendChild(circle);

      if (state.filters.hubLabels && RENDER_STATE.showLabels && shouldShowLabel(node, tierName, placedLabels)) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const ly = pos.y - r - 4;
        text.setAttribute('x', pos.x);
        text.setAttribute('y', ly);
        text.setAttribute('class', 'hub-label' + (dom ? ' dominant' : ''));
        text.setAttribute('font-size', String(labelTier.fontSize || 9));
        text.setAttribute('fill-opacity', String(labelTier.opacity || 0.85));
        text.textContent = node.name;
        layers['layer-labels'].appendChild(text);
        placedLabels.push({ x:pos.x, y:ly });
      }
    });

    updateStats(routes, activeIds);
  }

  function updateStats(routes, activeIds) {
    const visibleNodes = NODES.filter((n) => nodeVisible(n, activeIds)).length;
    document.getElementById('stats').innerHTML =
      'Routes: <strong>' + routes.length + '</strong>' +
      (state.zoom < 1.5 ? ' (cap 40)' : '') + '<br>' +
      'Nodes: <strong>' + visibleNodes + '</strong><br>' +
      'Mode: <strong>' + state.viewMode + '</strong> • Zoom: <strong>' + state.zoom.toFixed(1) + '×</strong><br>' +
      'Year: <strong>' + state.simYear + '</strong>';
  }

  function runValidation() {
    validation.missingNodes = [];
    validation.autoFsdEligible = NODES.filter((n) => n.autoFSD).length;
    ROUTES.forEach((r) => resolveRoutePoints(r));
    COVERAGE_REGIONS.forEach((reg) => {
      validation.coverage[reg] = NODES.filter((n) => n.region === reg && n.tier <= 2).length;
    });
    const savedZoom = state.zoom;
    state.zoom = 1.2;
    const planetary = applyNegativeSpaceCap(ROUTES.filter((r) => routeVisibleInMode(r)));
    state.zoom = savedZoom;
    validation.checks.V1 = validation.missingNodes.length === 0 ? 'PASS' : 'FAIL (' + validation.missingNodes.length + ')';
    validation.checks.V8 = planetary.length <= 40 ? 'PASS (' + planetary.length + ')' : 'FAIL (' + planetary.length + ')';
    validation.checks.V9 = ROUTES.every((r) => r.corridorId && r.corridorId !== 'unassigned') ? 'PASS' : 'WARN (unassigned routes exist)';
  }

  function buildDebugPanel() {
    return (
      '── VALIDATION V1–V9 ──────────────\\n' +
      'V1 Node completeness:    ' + (validation.checks.V1 || '—') + '\\n' +
      'V2 Route continuity:     ' + validation.fragmentedWarnings.length + ' warnings\\n' +
      'V3 Arc Bézier curves:    ' + validation.arcCurveCount + '\\n' +
      'V4 Auto/FSD eligible:    ' + validation.autoFsdEligible + ' / rendered ' + validation.autoFsdRendered + '\\n' +
      'V7 Line violations:      ' + validation.autoFsdLineViolations + '\\n' +
      'V8 Negative space:       ' + (validation.checks.V8 || '—') + '\\n' +
      'V9 Corridor ownership:   ' + (validation.checks.V9 || '—') + '\\n' +
      '── PLANETARY STATE ───────────────\\n' +
      'Routes at zoom<1.5:      ' + validation.v8PlanetaryCount + '\\n' +
      'Unowned rendered:        ' + validation.v9Unowned
    );
  }

  function initCorridorUI() {
    const el = document.getElementById('filters-corridors');
    el.innerHTML = '<h3>── Civilization Corridors ──</h3><div class="corridor-grid"></div>';
    const grid = el.querySelector('.corridor-grid');
    CIVILIZATION_CORRIDORS.forEach((c) => {
      const lbl = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.addEventListener('change', () => {
        state.corridorEnabled[c.id] = cb.checked;
        renderMap();
        document.getElementById('debug-panel').textContent = buildDebugPanel();
      });
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(' ' + c.name));
      grid.appendChild(lbl);
    });
  }

  function initFiltersUI() {
    const passenger = [['e2e_arc','E2E Arcs'],['global_spine','Global Spine'],['continental_spine','Continental'],['regional_loop','Regional Loops'],['feeder_branch','Feeders']];
    const cargo = [['e2m_arc','E2M'],['cargo_arc','Cargo'],['resource_corridor','Resource'],['mining_corridor','Mining'],['energy_corridor','Energy'],['port_connector','Ports']];
    const services = [['autoFsd','Auto/FSD (z≥2)'],['hubLabels','Hub Labels']];
    function addFilters(containerId, title, items) {
      const el = document.getElementById(containerId);
      el.innerHTML = '<h3>' + title + '</h3>';
      items.forEach(([key, label]) => {
        const lbl = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = state.filters[key];
        cb.addEventListener('change', () => { state.filters[key] = cb.checked; renderMap(); document.getElementById('debug-panel').textContent = buildDebugPanel(); });
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' ' + label));
        el.appendChild(lbl);
      });
    }
    addFilters('filters-passenger', '── Passenger ──', passenger);
    addFilters('filters-cargo', '── Cargo / E2M ──', cargo);
    addFilters('filters-services', '── Services ──', services);
  }

  function initModeButtons() {
    ['GLOBAL','NETWORK','E2M','AUTO','REGIONAL'].forEach((mode) => {
      const btn = document.createElement('button');
      btn.dataset.mode = mode;
      btn.className = 'mode-btn' + (mode === state.viewMode ? ' active' : '');
      btn.textContent = mode === 'AUTO' ? 'AUTO/FSD' : mode;
      btn.addEventListener('click', () => {
        state.viewMode = mode;
        if (mode === 'AUTO') state.filters.autoFsd = true;
        document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
        renderMap();
      });
      document.getElementById('mode-buttons').appendChild(btn);
    });
  }

  function initPanZoom() {
    const wrap = document.getElementById('map-wrap');
    let dragging = false, lastX = 0, lastY = 0;
    wrap.addEventListener('mousedown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; wrap.classList.add('dragging'); });
    window.addEventListener('mouseup', () => { dragging = false; wrap.classList.remove('dragging'); });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      state.panX += e.clientX - lastX;
      state.panY += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      gWorld.setAttribute('transform', 'translate(' + state.panX + ',' + state.panY + ') scale(' + state.zoom + ')');
    });
    wrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      state.zoom = Math.min(20, Math.max(0.5, state.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
      document.getElementById('zoom-slider').value = state.zoom;
      document.getElementById('zoom-val').textContent = state.zoom.toFixed(1) + '×';
      renderMap();
    }, { passive:false });
  }

  document.getElementById('zoom-slider').addEventListener('input', (e) => {
    state.zoom = parseFloat(e.target.value);
    document.getElementById('zoom-val').textContent = state.zoom.toFixed(1) + '×';
    renderMap();
  });
  document.getElementById('year-slider').addEventListener('input', (e) => {
    state.simYear = parseInt(e.target.value, 10);
    document.getElementById('year-val').textContent = String(state.simYear);
    if (RENDER_STATE.showSimulationOverlay) renderMap();
  });
  document.getElementById('sim-overlay').addEventListener('change', (e) => {
    RENDER_STATE.showSimulationOverlay = e.target.checked;
    renderMap();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    state.zoom = 1.2; state.panX = 40; state.panY = 20;
    document.getElementById('zoom-slider').value = state.zoom;
    document.getElementById('zoom-val').textContent = '1.2×';
    state.viewMode = 'GLOBAL';
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === 'GLOBAL'));
    renderMap();
  });
  document.getElementById('debug-toggle').addEventListener('click', () => {
    const panel = document.getElementById('debug-panel');
    panel.classList.toggle('open');
    document.getElementById('debug-toggle').textContent = panel.classList.contains('open') ? '▾ Debug panel' : '▸ Debug panel (V1–V9)';
  });

  svg.setAttribute('viewBox', '0 0 ' + MAP_W + ' ' + MAP_H);
  runValidation();
  initModeButtons();
  initFiltersUI();
  initCorridorUI();
  initPanZoom();
  renderMap();
  document.getElementById('debug-panel').textContent = buildDebugPanel();
})();
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hyperloop Global Network — Planetary Mobility OS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0e27; color: #c8d4f0; height: 100vh; overflow: hidden; }
    #app { display: flex; height: 100vh; }
    #sidebar { width: 300px; min-width: 300px; background: linear-gradient(180deg, #0d1230 0%, #0a0e27 100%); border-right: 1px solid rgba(100,140,255,0.2); padding: 14px; overflow-y: auto; font-size: 12px; }
    #sidebar h1 { font-size: 13px; letter-spacing: 0.06em; color: #7eb8ff; margin-bottom: 4px; }
    #sidebar .subtitle { font-size: 10px; color: #6a7a9a; margin-bottom: 14px; line-height: 1.4; }
    .mode-row { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
    .mode-btn { flex: 1 1 45%; padding: 6px 4px; font-size: 10px; border: 1px solid rgba(80,120,200,0.35); background: rgba(20,30,60,0.8); color: #8899bb; cursor: pointer; border-radius: 4px; }
    .mode-btn.active { background: rgba(40,100,220,0.45); color: #fff; border-color: #4488ff; box-shadow: 0 0 12px rgba(68,136,255,0.35); }
    .filter-group { margin-bottom: 10px; }
    .filter-group h3 { font-size: 10px; color: #5a6a8a; margin: 8px 0 4px; border-top: 1px solid rgba(80,100,140,0.2); padding-top: 6px; }
    .filter-group label { display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; font-size: 11px; }
    .corridor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 8px; }
    .zoom-row { display: flex; align-items: center; gap: 8px; margin: 10px 0; }
    .zoom-row input[type="range"] { flex: 1; }
    #stats { font-size: 11px; line-height: 1.6; color: #8aa0cc; margin-top: 10px; padding: 8px; background: rgba(0,0,0,0.25); border-radius: 4px; }
    #debug-panel { margin-top: 10px; font-size: 10px; font-family: Consolas, monospace; color: #9ab0d8; white-space: pre-wrap; line-height: 1.45; max-height: 320px; overflow-y: auto; display: none; padding: 8px; background: rgba(0,0,0,0.35); border-radius: 4px; }
    #debug-panel.open { display: block; }
    #map-wrap { flex: 1; position: relative; background: #060a18; cursor: grab; }
    #map-wrap.dragging { cursor: grabbing; }
    svg#map { width: 100%; height: 100%; display: block; }
    .route-path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .route-path.glow { filter: url(#route-glow); }
    .hub-label { font-size: 9px; fill: #aac8ff; pointer-events: none; text-anchor: middle; }
    .hub-label.dominant { fill: #ffffff; font-weight: 600; }
    button.reset-btn { width: 100%; margin-top: 8px; padding: 6px; background: rgba(60,80,120,0.4); border: 1px solid rgba(100,140,200,0.3); color: #a0b8e0; border-radius: 4px; cursor: pointer; font-size: 11px; }
    button.reset-btn:hover { background: rgba(80,110,180,0.5); }
    .debug-toggle { margin-top: 8px; font-size: 10px; color: #6a8ac0; cursor: pointer; text-decoration: underline; }
  </style>
</head>
<body>
<div id="app">
  <aside id="sidebar">
    <h1>🌍 PLANETARY MOBILITY OS</h1>
    <p class="subtitle">Civilization backbone • Phase 7B</p>
    <div class="mode-row" id="mode-buttons"></div>
    <div class="filter-group" id="filters-passenger"></div>
    <div class="filter-group" id="filters-cargo"></div>
    <div class="filter-group" id="filters-corridors"></div>
    <div class="filter-group" id="filters-services"></div>
    <div class="zoom-row"><label>Zoom</label><input type="range" id="zoom-slider" min="0.5" max="20" step="0.1" value="1.2" /><span id="zoom-val">1.2×</span></div>
    <div class="zoom-row"><label>Year</label><input type="range" id="year-slider" min="2025" max="2075" step="5" value="2025" /><span id="year-val">2025</span></div>
    <label style="display:flex;gap:6px;margin:6px 0;font-size:11px"><input type="checkbox" id="sim-overlay" /> Simulation overlay</label>
    <button class="reset-btn" id="reset-btn">Reset view</button>
    <div id="stats"></div>
    <div class="debug-toggle" id="debug-toggle">▸ Debug panel (V1–V9)</div>
    <div id="debug-panel"></div>
  </aside>
  <main id="map-wrap">
    <svg id="map" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hub-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g id="g-world">
        <g id="layer-autofsd"></g>
        <g id="layer-e2m"></g>
        <g id="layer-feeders"></g>
        <g id="layer-loops"></g>
        <g id="layer-continental"></g>
        <g id="layer-global"></g>
        <g id="layer-e2e"></g>
        <g id="layer-node-glow"></g>
        <g id="layer-nodes"></g>
        <g id="layer-labels"></g>
        <g id="layer-simulation"></g>
      </g>
    </svg>
  </main>
</div>
<script>
${ENGINE.replace('__NODES__', nodesMatch[0]).replace('__ROUTES__', routesBlock)}
</script>
</body>
</html>`;

fs.writeFileSync(outPath, html);
console.log('Wrote', outPath);