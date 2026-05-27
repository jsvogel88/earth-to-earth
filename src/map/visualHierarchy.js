/**
 * Phase 7C — three-layer visual identity (orbital / hyperloop / logistics).
 */

export const LAYER_VISUAL_WEIGHT = {
  ORBITAL: { baseWidth: 1.6, baseOpacity: 0.55, glowStrength: 0.06 },
  HYPERLOOP: { baseWidth: 3.0, baseOpacity: 0.92, glowStrength: 0.2 },
  LOGISTICS: { baseWidth: 0, baseOpacity: 0.04, glowStrength: 0 },
};

export const E2E_BASE_STYLE = {
  color: [255, 200, 80],
  baseOpacity: 0.55,
  baseWidth: 1.6,
  glowOpacity: 0.06,
};

export const SPINE_STYLES = {
  global_spine: { color: [0, 207, 255], width: 3.2, opacity: 0.92, glow: true },
  continental_spine: { color: [68, 136, 255], width: 2.4, opacity: 0.85, glow: false },
};

export const PRIORITY_E2E_IDS = new Set([
  'edge:e2e:new-york-london',
  'edge:e2e_starship:new-york-united-states--london-united-kingdom',
  'edge:e2e:los-angeles-tokyo',
  'edge:e2e_starship:los-angeles-united-states--tokyo-japan',
  'edge:e2e:london-dubai',
  'edge:e2e:dubai-singapore',
  'edge:e2e:singapore-sydney',
  'edge:e2e:moscow-beijing',
]);

/** Loose match when canonical edge ids differ by slug */
export function isPriorityE2EEdge(edge) {
  const id = String(edge?.id ?? '').toLowerCase();
  const from = String(edge?.fromNodeId ?? edge?.from ?? '').toLowerCase();
  const to = String(edge?.toNodeId ?? edge?.to ?? '').toLowerCase();
  const hay = `${id}|${from}|${to}`;
  const pairs = [
    ['new-york', 'london'],
    ['los-angeles', 'tokyo'],
    ['london', 'dubai'],
    ['dubai', 'singapore'],
    ['singapore', 'sydney'],
    ['moscow', 'beijing'],
  ];
  return pairs.some(([a, b]) => hay.includes(a) && hay.includes(b));
}

export const E2E_CONTROL_OVERRIDES = {
  'new-york-london': { ctrlLat: 48.0, ctrlLng: -38.0 },
  'london-dubai': { ctrlLat: 36.0, ctrlLng: 18.0 },
  'dubai-singapore': { ctrlLat: 14.0, ctrlLng: 72.0 },
  'singapore-sydney': { ctrlLat: -12.0, ctrlLng: 128.0 },
  'los-angeles-tokyo': { ctrlLat: 44.0, ctrlLng: -168.0 },
  'moscow-beijing': { ctrlLat: 54.0, ctrlLng: 88.0 },
};

/**
 * @param {object} arc
 * @returns {{ width: number, opacity: number }}
 */
export function getE2EArcStyle(arc) {
  const imp = (arc.civilizationImportance ?? arc.importance ?? arc.priority_score ?? 50) / 100;
  return {
    width: E2E_BASE_STYLE.baseWidth * (0.65 + imp * 0.55),
    opacity: E2E_BASE_STYLE.baseOpacity * (0.65 + imp * 0.55),
  };
}

export const E2M_SUBFAMILIES = {
  MINERAL_EXTRACTION: { color: [220, 140, 50], dash: null, width: 1.8 },
  ENERGY_CORRIDOR: { color: [255, 200, 0], dash: [8, 3], width: 2.0 },
  ORBITAL_LOGISTICS: { color: [180, 100, 255], dash: [4, 4], width: 1.4 },
  CARGO_EXPORT: { color: [255, 170, 80], dash: [5, 4], width: 1.5 },
};

/**
 * @param {object} item
 * @returns {keyof typeof E2M_SUBFAMILIES}
 */
export function classifyE2MSubFamily(item) {
  const rt = String(item?.routeType ?? item?.route_type ?? '').toLowerCase();
  const mode = String(item?.mode ?? '');
  if (rt.includes('energy') || rt.includes('oil') || rt.includes('hydrogen')) {
    return 'ENERGY_CORRIDOR';
  }
  if (rt.includes('mining') || rt.includes('mineral') || rt.includes('ore')) {
    return 'MINERAL_EXTRACTION';
  }
  if (rt.includes('orbital') || rt.includes('launch') || rt.includes('mars')) {
    return 'ORBITAL_LOGISTICS';
  }
  if (mode === 'e2e_starship') return 'ORBITAL_LOGISTICS';
  return 'CARGO_EXPORT';
}

export const CIVILIZATION_ANCHORS = {
  new_york: { r: 9, glowR: 16, glowOpacity: 0.1, alwaysLabeled: true },
  london: { r: 9, glowR: 16, glowOpacity: 0.1, alwaysLabeled: true },
  dubai: { r: 8, glowR: 14, glowOpacity: 0.09, alwaysLabeled: true },
  singapore: { r: 8, glowR: 14, glowOpacity: 0.09, alwaysLabeled: true },
  tokyo: { r: 8, glowR: 14, glowOpacity: 0.09, alwaysLabeled: true },
  shanghai: { r: 7, glowR: 12, glowOpacity: 0.08, alwaysLabeled: true },
  hong_kong: { r: 7, glowR: 12, glowOpacity: 0.08, alwaysLabeled: true },
  los_angeles: { r: 7, glowR: 12, glowOpacity: 0.08, alwaysLabeled: true },
  sao_paulo: { r: 7, glowR: 12, glowOpacity: 0.08, alwaysLabeled: true },
  mumbai: { r: 7, glowR: 12, glowOpacity: 0.08, alwaysLabeled: true },
};

export const TIER_NODE_SIZES = {
  1: { r: 6, glowR: 12, glowOpacity: 0.1 },
  2: { r: 4, glowR: 0, glowOpacity: 0 },
  3: { r: 2.5, glowR: 0, glowOpacity: 0 },
  4: { r: 1.5, glowR: 0, glowOpacity: 0 },
};

export const PLANETARY_LABEL_ALLOWLIST = new Set([
  'new_york', 'london', 'dubai', 'singapore', 'tokyo', 'shanghai',
  'beijing', 'paris', 'moscow', 'los_angeles', 'toronto', 'sydney',
  'cairo', 'nairobi', 'johannesburg', 'mumbai', 'sao_paulo',
  'hong_kong', 'seoul', 'istanbul',
]);

export const ASIA_BOUNDS = { latMin: -10, latMax: 60, lngMin: 60, lngMax: 150 };

export const CIVILIZATION_CORRIDORS = {
  atlantic_spine: { name: 'Atlantic Spine', color: '#ffffff', rank: 1 },
  pacific_spine: { name: 'Pacific Civilization Spine', color: '#00cfff', rank: 1 },
  eurasian_trunk: { name: 'Eurasian Trunk', color: '#4488ff', rank: 2 },
  gulf_india: { name: 'Gulf–India Corridor', color: '#ffcc00', rank: 2 },
  east_asia_megaregion: { name: 'East Asia Megaregion', color: '#ff6688', rank: 1 },
  african_spine: { name: 'African Resource Spine', color: '#ff9944', rank: 3 },
  south_american: { name: 'South American Corridor', color: '#44ddaa', rank: 3 },
  north_american_grid: { name: 'North American Grid', color: '#6699ff', rank: 2 },
};

/** Phase 8 — corridor-driven route colors (primary = stroke, secondary = glow). */
export const CORRIDOR_COLORS = {
  atlantic_spine: { primary: [220, 230, 255], secondary: [180, 200, 255] },
  pacific_spine: { primary: [0, 207, 255], secondary: [0, 160, 210] },
  eurasian_trunk: { primary: [68, 136, 255], secondary: [50, 100, 220] },
  gulf_india: { primary: [255, 200, 0], secondary: [220, 160, 0] },
  east_asia_megaregion: { primary: [255, 100, 140], secondary: [220, 70, 110] },
  african_spine: { primary: [255, 153, 68], secondary: [220, 120, 50] },
  south_american: { primary: [68, 221, 170], secondary: [50, 180, 140] },
  north_american_grid: { primary: [100, 153, 255], secondary: [80, 120, 220] },
};

export const ROUTE_FAMILY_COLORS = {
  e2e_arc: [255, 200, 80],
  global_spine: [0, 207, 255],
  continental_spine: [68, 136, 255],
  regional_loop: [68, 221, 170],
  feeder_branch: [102, 119, 153],
  e2m_arc: [255, 153, 68],
};

export function getE2EArcTilt(arc) {
  const norm = (s) =>
    String(s ?? '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-');
  const from = norm(arc?.fromNodeId ?? arc?.fromName);
  const to = norm(arc?.toNodeId ?? arc?.toName);
  const hay = `${from}|${to}|${norm(arc?.id)}`;
  const pairs = [
    ['new-york', 'london', 16],
    ['los-angeles', 'tokyo', 14],
    ['london', 'dubai', 12],
    ['dubai', 'singapore', 10],
    ['singapore', 'sydney', 10],
    ['moscow', 'beijing', 12],
  ];
  for (const [a, b, tilt] of pairs) {
    if (hay.includes(a) && hay.includes(b)) return tilt;
  }
  return 0;
}

/**
 * Ground-path colors — hyperloop/loop/feeder only (never E2M/E2E).
 * @param {object} route
 * @param {number} [alpha]
 * @returns {number[]}
 */
export function getCorridorRouteColor(route, alpha = 200) {
  const mode = String(route?.mode ?? '').toLowerCase();
  const rt = String(route?.routeType ?? route?.route_type ?? '');

  if (mode === 'e2e_starship' || mode === 'e2e') {
    return [...E2E_BASE_STYLE.color, alpha];
  }
  if (mode === 'e2m' || mode === 'cargo' || mode === 'logistics') {
    return [...ROUTE_FAMILY_COLORS.e2m_arc, alpha];
  }

  if (
    rt === 'branch' ||
    rt === 'feeder' ||
    rt === 'feeder_route' ||
    rt === 'regional_feeder'
  ) {
    return [...ROUTE_FAMILY_COLORS.feeder_branch, Math.round(alpha * 0.85)];
  }
  if (rt === 'regional_loop' || mode === 'loop' || mode === 'regional_loop') {
    return [255, 180, 60, alpha];
  }
  if (mode === 'hyperloop' || rt.includes('spine') || rt.includes('trunk')) {
    return [...ROUTE_FAMILY_COLORS.global_spine, alpha];
  }

  const corridorId = route?.corridorId;
  if (corridorId && CORRIDOR_COLORS[corridorId]) {
    const [r, g, b] = CORRIDOR_COLORS[corridorId].primary;
    const blend = 0.35;
    const cyan = ROUTE_FAMILY_COLORS.global_spine;
    return [
      Math.round(cyan[0] * (1 - blend) + r * blend),
      Math.round(cyan[1] * (1 - blend) + g * blend),
      Math.round(cyan[2] * (1 - blend) + b * blend),
      alpha,
    ];
  }
  return [68, 136, 255, alpha];
}

/**
 * @param {object} edge
 * @returns {string}
 */
export function inferCorridorId(edge) {
  if (edge?.corridorId) return edge.corridorId;

  // Support both edge-shaped inputs (fromNodeId/toNodeId) and route-shaped
  // inputs (nodeIds / nodeSequence).
  const nodeIds = edge?.nodeIds ?? edge?.nodeSequence ?? [];
  const fromId =
    edge?.fromNodeId ?? edge?.from ?? nodeIds?.[0] ?? '';
  const toId =
    edge?.toNodeId ?? edge?.to ?? nodeIds?.[nodeIds.length - 1] ?? '';

  const from = String(fromId ?? '').toLowerCase();
  const to = String(toId ?? '').toLowerCase();
  const region = `${from}|${to}`;
  if (region.includes('africa') || region.includes('cairo') || region.includes('lagos')) {
    return 'african_spine';
  }
  if (region.includes('sao-paulo') || region.includes('bogota') || region.includes('lima')) {
    return 'south_american';
  }
  if (region.includes('singapore') || region.includes('tokyo') || region.includes('shanghai')) {
    return 'east_asia_megaregion';
  }
  if (region.includes('dubai') || region.includes('mumbai') || region.includes('riyadh')) {
    return 'gulf_india';
  }
  if (region.includes('new-york') || region.includes('toronto') || region.includes('chicago')) {
    return 'north_american_grid';
  }
  if (region.includes('london') || region.includes('paris')) return 'atlantic_spine';
  if (region.includes('los-angeles') || region.includes('vancouver')) return 'pacific_spine';
  return 'eurasian_trunk';
}

/**
 * @param {object} node
 * @returns {object}
 */
export function getNodeVisualStyle(node) {
  const id = String(node?.id ?? node?.networkCityId ?? '')
    .replace(/^node:city:/, '')
    .replace(/^net:/, '')
    .split(':')[0];
  const anchor = CIVILIZATION_ANCHORS[id];
  if (anchor) return anchor;
  return TIER_NODE_SIZES[node?.tier ?? 2] ?? TIER_NODE_SIZES[2];
}

/**
 * @param {object} node
 * @param {number} zoom
 * @returns {boolean}
 */
export function shouldShowE2MLabel(node, zoom) {
  if (zoom < 4) return false;
  if (zoom < 5) return (node?.tier ?? 3) <= 1;
  if (zoom < 6) return (node?.tier ?? 3) <= 2;
  return true;
}

/**
 * @param {object} node
 * @param {number} zoom
 * @returns {boolean}
 */
export function shouldRenderNodeInAsia(node, zoom) {
  const lat = node?.latitude ?? node?.lat;
  const lng = node?.longitude ?? node?.lon ?? node?.lng;
  if (lat == null || lng == null) return true;
  const inAsia =
    lat >= ASIA_BOUNDS.latMin &&
    lat <= ASIA_BOUNDS.latMax &&
    lng >= ASIA_BOUNDS.lngMin &&
    lng <= ASIA_BOUNDS.lngMax;
  if (!inAsia) return true;
  if (zoom >= 2.5) return true;
  if (zoom >= 1.5) return (node?.tier ?? 3) <= 2;
  return node?.tier === 1;
}
