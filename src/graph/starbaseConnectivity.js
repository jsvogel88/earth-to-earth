/**
 * Deterministic Starbase → network intermodal connectors (thin subordinate lines).
 * TODO: replace nearest-hub heuristic with explicit assigned targets from graph registry.
 */

import { STARBASE_CLASSES } from '../data/starbaseHubs.js';

const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

function hubLonLat(hub) {
  const c = hub.coordinates;
  if (!c || c.length < 2) return null;
  const lon = c[0];
  const lat = c[1];
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) < 0.01 && Math.abs(lon) < 0.01) return null;
  return { lon, lat };
}

/**
 * Role → connector system type + candidate filter for nearest-hub matching.
 */
const ROLE_CONNECTOR_RULES = {
  E2E: {
    systemType: 'e2e',
    maxKm: 12000,
    match: (h, from) =>
      h.id !== from.id &&
      (h.starbaseClass === STARBASE_CLASSES.PASSENGER || (h.hubRoles ?? []).includes('E2E')),
  },
  RE2E: {
    systemType: 're2e',
    maxKm: 16000,
    match: (h, from) =>
      h.id !== from.id &&
      ([STARBASE_CLASSES.PRIME, STARBASE_CLASSES.INDUSTRIAL].includes(h.starbaseClass) ||
        (h.hubRoles ?? []).includes('PETABOND_EXPORT')),
  },
  HYPERLOOP: {
    systemType: 'hyperloop',
    maxKm: 8000,
    match: (h, from) =>
      h.id !== from.id &&
      ((h.hubRoles ?? []).includes('HYPERLOOP') || h.starbaseClass === STARBASE_CLASSES.PASSENGER),
  },
  AUTO_FSD: {
    systemType: 'auto',
    maxKm: 6000,
    match: (h, from) =>
      h.id !== from.id &&
      ((h.hubRoles ?? []).includes('AUTO_FSD') || h.starbaseClass === STARBASE_CLASSES.PASSENGER),
  },
  PETABOND_EXPORT: {
    systemType: 'petabond',
    maxKm: 18000,
    match: (h, from) =>
      h.id !== from.id && (h.hubRoles ?? []).includes('PETABOND_EXPORT'),
  },
};

const MAX_CONNECTORS_PER_HUB = 4;
const PRIORITY_ROLES = ['PETABOND_EXPORT', 'RE2E', 'E2E', 'HYPERLOOP', 'AUTO_FSD'];

/**
 * @param {object[]} earthHubs — pre-filtered Earth hubs with coordinates
 * @param {object[]} [networkNodes] — optional integrated graph nodes { id, lat, lon, … }
 * @returns {object[]}
 */
export function generateStarbaseConnectivity(earthHubs, networkNodes = []) {
  const candidates = [...earthHubs];
  for (const n of networkNodes ?? []) {
    const lat = n.lat ?? n.latitude;
    const lon = n.lon ?? n.longitude ?? n.lng;
    if (lat == null || lon == null) continue;
    candidates.push({
      id: `net:${n.id ?? n.node_id}`,
      name: n.name ?? n.id,
      coordinates: [lon, lat],
      starbaseClass: n.e2e_enabled ? STARBASE_CLASSES.PASSENGER : STARBASE_CLASSES.INDUSTRIAL,
      hubRoles: [
        n.e2e_enabled && 'E2E',
        n.hyperloop_connected && 'HYPERLOOP',
        n.e2m_enabled && 'RE2E',
        n.auto_enabled && 'AUTO_FSD',
      ].filter(Boolean),
    });
  }

  const connectors = [];
  const sortedHubs = [...earthHubs].sort((a, b) => a.id.localeCompare(b.id));

  for (const from of sortedHubs) {
    const fromLL = hubLonLat(from);
    if (!fromLL) continue;
    const roles = (from.hubRoles ?? []).filter((r) => ROLE_CONNECTOR_RULES[r]);
    const orderedRoles = [
      ...PRIORITY_ROLES.filter((r) => roles.includes(r)),
      ...roles.filter((r) => !PRIORITY_ROLES.includes(r)),
    ];
    let added = 0;
    const usedTargets = new Set();

    for (const role of orderedRoles) {
      if (added >= MAX_CONNECTORS_PER_HUB) break;
      const rule = ROLE_CONNECTOR_RULES[role];
      if (!rule) continue;

      let best = null;
      let bestDist = Infinity;
      for (const target of candidates) {
        if (!rule.match(target, from)) continue;
        const toLL = hubLonLat(target);
        if (!toLL) continue;
        const dist = haversineKm(fromLL.lat, fromLL.lon, toLL.lat, toLL.lon);
        if (dist > rule.maxKm || dist < 1) continue;
        const tieKey = `${target.id}`;
        if (dist < bestDist || (dist === bestDist && tieKey < (best?.targetId ?? ''))) {
          bestDist = dist;
          best = { target, toLL, dist, role, systemType: rule.systemType };
        }
      }

      if (!best || usedTargets.has(best.target.id)) continue;
      usedTargets.add(best.target.id);
      connectors.push({
        id: `starbase-conn:${from.id}:${best.target.id}:${role}`,
        fromId: from.id,
        toId: best.target.id,
        fromName: from.name,
        toName: best.target.name,
        role,
        systemType: best.systemType,
        distanceKm: Math.round(bestDist),
        path: [
          [fromLL.lon, fromLL.lat],
          [best.toLL.lon, best.toLL.lat],
        ],
      });
      added += 1;
    }
  }

  return connectors.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * @param {object} hub
 * @returns {boolean}
 */
export function isEarthPlanetHub(hub) {
  return hub?.planet === STARBASE_PLANETS.EARTH;
}
