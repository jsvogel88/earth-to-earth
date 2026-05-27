/**
 * E2M / cargo / resource route geometry rules.
 * Long-distance E2M MUST use ArcLayer (orbital logistics arcs), not ground PathLayer.
 */

import { classifyE2MSubFamily } from './visualHierarchy.js';

export const E2M_ROUTE_FAMILIES = new Set([
  'e2m',
  'cargo',
  'logistics',
  'cargo_spine',
  'orbital_logistics',
  'resource_corridor',
  'mining_corridor',
  'energy_corridor',
  'port_connector',
]);

/** Explicit short ground-handling route types only. */
export const E2M_LOCAL_GROUND_ROUTE_TYPES = new Set([
  'local_port_connector',
  'terminal_ground_connector',
  'short_logistics_feeder',
]);

export const E2M_LOCAL_GROUND_MAX_KM = 100;
export const E2M_PATH_LAYER_VIOLATION_KM = 500;

/**
 * @param {object} item
 * @returns {boolean}
 */
export function isE2MRouteFamily(item) {
  const mode = String(item?.mode ?? '').toLowerCase();
  const routeType = String(item?.routeType ?? item?.route_type ?? '').toLowerCase();
  if (mode === 'e2m' || mode === 'cargo' || mode === 'logistics') return true;
  return [...E2M_ROUTE_FAMILIES].some(
    (t) => routeType === t || routeType.includes(t.replace('_', ''))
  );
}

/**
 * @param {object} item
 * @returns {boolean}
 */
export function isE2MLocalGroundRoute(item) {
  const routeType = String(item?.routeType ?? item?.route_type ?? '').toLowerCase();
  return E2M_LOCAL_GROUND_ROUTE_TYPES.has(routeType);
}

/**
 * @param {object} item
 * @returns {boolean}
 */
export function shouldRenderE2MAsGroundPath(item) {
  if (!isE2MLocalGroundRoute(item)) return false;
  const dist = item?.distanceKm ?? item?.distance_km ?? null;
  if (dist == null) return true;
  return dist <= E2M_LOCAL_GROUND_MAX_KM;
}

/**
 * @param {object} datum
 * @returns {object}
 */
export function normalizeE2MArc(datum) {
  const sourcePosition =
    datum.sourcePosition ??
    (datum.from ? datum.from : datum.path?.[0] ?? null);
  const targetPosition =
    datum.targetPosition ??
    (datum.to ? datum.to : datum.path?.[datum.path?.length - 1] ?? null);

  return {
    ...datum,
    mode: datum.mode ?? 'e2m',
    sourcePosition,
    targetPosition,
    e2mSubFamily: datum.e2mSubFamily ?? classifyE2MSubFamily(datum),
  };
}

/**
 * Expand multi-point route records into pairwise great-circle arcs.
 * @param {object} datum
 * @returns {object[]}
 */
export function expandE2MToArcs(datum) {
  if (shouldRenderE2MAsGroundPath(datum)) {
    return [];
  }

  if (datum.sourcePosition && datum.targetPosition) {
    return [normalizeE2MArc(datum)];
  }

  const pts = datum.path ?? [];
  if (pts.length < 2) return [];

  const arcs = [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    arcs.push(
      normalizeE2MArc({
        ...datum,
        id: `${datum.id ?? datum.routeId ?? 'e2m'}-arc-${i}`,
        sourcePosition: pts[i],
        targetPosition: pts[i + 1],
      })
    );
  }
  return arcs;
}

/**
 * @param {object} datum
 * @returns {object | null}
 */
export function toE2MGroundPath(datum) {
  const pts = datum.path ?? [];
  if (pts.length >= 2) {
    return {
      ...datum,
      path: pts,
      mode: 'e2m',
      e2mSubFamily: datum.e2mSubFamily ?? classifyE2MSubFamily(datum),
    };
  }
  const from = datum.sourcePosition ?? datum.from;
  const to = datum.targetPosition ?? datum.to;
  if (!from || !to) return null;
  return {
    ...datum,
    path: [from, to],
    mode: 'e2m',
    e2mSubFamily: datum.e2mSubFamily ?? classifyE2MSubFamily(datum),
  };
}

/**
 * Merge canonical pipeline arcs with legacy integrated-graph e2m edges.
 * @param {object[]} canonicalArcs
 * @param {object[]} legacyArcs
 * @returns {object[]}
 */
export function mergeE2MArcSources(canonicalArcs = [], legacyArcs = []) {
  const merged = new Map();
  for (const arc of legacyArcs ?? []) {
    const normalized = normalizeE2MArc(arc);
    if (normalized.sourcePosition && normalized.targetPosition) {
      merged.set(normalized.id ?? `${normalized.sourcePosition}-${normalized.targetPosition}`, normalized);
    }
  }
  for (const arc of canonicalArcs ?? []) {
    const normalized = normalizeE2MArc(arc);
    if (normalized.sourcePosition && normalized.targetPosition) {
      merged.set(normalized.id ?? `${normalized.sourcePosition}-${normalized.targetPosition}`, normalized);
    }
  }
  return [...merged.values()];
}

/**
 * @param {object[]} arcData
 * @param {object[]} pathData
 */
export function validateE2MRenderLayers(arcData = [], pathData = []) {
  if (typeof import.meta === 'undefined' || !import.meta.env?.DEV) return;

  let pathViolations = 0;
  for (const p of pathData) {
    const dist = p?.distanceKm ?? p?.distance_km ?? null;
    if (dist != null && dist > E2M_PATH_LAYER_VIOLATION_KM && !isE2MLocalGroundRoute(p)) {
      pathViolations += 1;
      console.warn('[E2M GEOMETRY] long-distance route in PathLayer', {
        id: p.id,
        distanceKm: dist,
        routeType: p.routeType ?? p.route_type,
      });
    }
  }

  console.info('[E2M GEOMETRY]', {
    arcLayerRoutes: arcData.length,
    pathLayerRoutes: pathData.length,
    pathLayerViolations: pathViolations,
  });

  if (pathViolations > 0) {
    console.warn(
      `[E2M GEOMETRY] expected PathLayer violations = 0, got ${pathViolations}`
    );
  }
}

/**
 * @param {import('@deck.gl/core').Layer[]} layers
 */
export function validateE2MDeckLayers(layers = []) {
  if (typeof import.meta === 'undefined' || !import.meta.env?.DEV) return;

  let arcCount = 0;
  let pathCount = 0;

  for (const layer of layers) {
    const id = String(layer?.id ?? '');
    if (!id.includes('e2m') && !id.includes('E2M')) continue;
    if (id.includes('multi') || id.includes('ground')) {
      pathCount += layer?.props?.data?.length ?? 0;
    } else if (id.includes('integrated-e2m') || id.includes('e2m-orbital')) {
      arcCount += layer?.props?.data?.length ?? 0;
    }
  }

  console.info('[E2M DECK VALIDATION]', { arcCount, pathCount });
}
