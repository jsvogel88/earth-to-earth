/**
 * Rule-based construction classification for Hyperloop connector edges.
 */

import { normalizeCityKey } from '../data/hyperloopPhase1Cities.js';
import {
  CONSTRUCTION_TYPES,
  TUNNEL_TYPES,
  CONSTRUCTION_DIFFICULTY,
  DEFAULT_CONSTRUCTION,
} from '../data/constructionTypes.js';

function sortedPairKey(nameA, nameB) {
  return [normalizeCityKey(nameA), normalizeCityKey(nameB)].sort().join('|');
}

function matchesKnownPair(nameA, nameB, pairs) {
  const key = sortedPairKey(nameA, nameB);
  return pairs.some(([a, b]) => sortedPairKey(a, b) === key);
}

const UNDERSEA_PAIRS = [
  ['London', 'Paris'],
  ['Madrid', 'Tangier'],
  ['Madrid', 'Casablanca'],
  ['Seville', 'Tangier'],
  ['Gibraltar', 'Tangier'],
  ['Palermo', 'Tunis'],
  ['Sicily', 'Tunis'],
  ['Singapore', 'Batam'],
  ['Singapore', 'Jakarta'],
  ['Tokyo', 'Osaka'],
  ['Honolulu', 'Los Angeles'],
];

const MOUNTAIN_PAIRS = [
  ['Denver', 'Salt Lake City'],
  ['Salt Lake City', 'Reno'],
  ['Santiago', 'Mendoza'],
  ['La Paz', 'Antofagasta'],
  ['Kathmandu', 'Lhasa'],
  ['Delhi', 'Leh'],
  ['Urumqi', 'Kashgar'],
  ['Zurich', 'Milan'],
  ['Geneva', 'Lyon'],
  ['Vancouver', 'Calgary'],
  ['Denver', 'Albuquerque'],
];

const URBAN_DENSE_CITIES = new Set(
  [
    'New York',
    'Newark',
    'Philadelphia',
    'Boston',
    'Tokyo',
    'Osaka',
    'Yokohama',
    'Seoul',
    'Shanghai',
    'Hong Kong',
    'London',
    'Paris',
    'Frankfurt',
    'Amsterdam',
    'Brussels',
    'Los Angeles',
    'San Francisco',
    'San Jose',
    'Oakland',
    'Berlin',
    'Munich',
  ].map(normalizeCityKey)
);

const ARCTIC_NAME_HINTS =
  /norilsk|dudinka|yakutsk|murmansk|archangel|tiksi|vorkuta|sisimiut|nuuk|ilulissat|fairbanks|nome|anchorage|inuvik|yellowknife|iqaluit|siberia|kamchatka|magadan|chukotka|nunavut|yukon|greenland|alaska|northern russia|northwest territories/i;

const DESERT_NAME_HINTS =
  /sahara|sahel|arabian|outback|gobi|taklamakan|atacama|namib|kalahari|mojave|sonora|bedouin|dubai|abu dhabi|riyadh|jeddah|doha|muscat|alice springs|ulaanbaatar|turkmenistan|uzbekistan|kazakhstan desert/i;

function midpoint(from, to) {
  return {
    lat: (from.lat + to.lat) / 2,
    lon: (from.lon + to.lon) / 2,
  };
}

function isArcticGeography(from, to) {
  const text = `${from?.name} ${to?.name} ${from?.country} ${to?.country}`;
  if (ARCTIC_NAME_HINTS.test(text)) return true;
  const lats = [from?.lat, to?.lat].filter((n) => Number.isFinite(n));
  if (lats.some((lat) => lat >= 66)) return true;
  if (lats.every((lat) => lat >= 58) && ARCTIC_NAME_HINTS.test(text)) return true;
  return false;
}

function isDesertGeography(from, to) {
  const text = `${from?.name} ${to?.name} ${from?.country} ${to?.country} ${from?.continent} ${to?.continent}`;
  if (DESERT_NAME_HINTS.test(text)) return true;
  const mid = midpoint(from, to);
  const { lat, lon } = mid;
  if (lat >= 15 && lat <= 38 && lon >= 32 && lon <= 62) return true;
  if (lat >= 18 && lat <= 32 && lon >= -18 && lon <= 18) return true;
  if (lat >= -28 && lat <= -18 && lon >= 120 && lon <= 145) return true;
  if (lat >= 35 && lat <= 48 && lon >= 70 && lon <= 95) return true;
  return false;
}

function isMountainGeography(from, to) {
  const mid = midpoint(from, to);
  const { lat, lon } = mid;
  if (lat >= 37 && lat <= 46 && lon >= -115 && lon <= -102) return true;
  if (lat >= -36 && lat <= -18 && lon >= -74 && lon <= -62) return true;
  if (lat >= 43 && lat <= 49 && lon >= 4 && lon <= 14) return true;
  if (lat >= 26 && lat <= 36 && lon >= 74 && lon <= 92) return true;
  return false;
}

function isUrbanDenseCorridor(from, to, edge) {
  const a = normalizeCityKey(from?.name);
  const b = normalizeCityKey(to?.name);
  if (!URBAN_DENSE_CITIES.has(a) && !URBAN_DENSE_CITIES.has(b)) return false;
  if (URBAN_DENSE_CITIES.has(a) && URBAN_DENSE_CITIES.has(b)) return true;
  const dist = edge?.distanceMiles;
  return Number.isFinite(dist) && dist <= 450;
}

function buildResult(partial) {
  return {
    ...DEFAULT_CONSTRUCTION,
    ...partial,
  };
}

function fromExplicitTunnel(edge) {
  if (!edge.tunnelRequired) return null;
  const tunnelType = edge.tunnelType || (edge.waterCrossing ? TUNNEL_TYPES.UNDERSEA : TUNNEL_TYPES.MIXED);
  let constructionType = edge.constructionType;
  if (!constructionType || constructionType === CONSTRUCTION_TYPES.SURFACE) {
    if (tunnelType === TUNNEL_TYPES.UNDERSEA) {
      constructionType = CONSTRUCTION_TYPES.UNDERSEA_TUNNEL;
    } else if (tunnelType === TUNNEL_TYPES.MOUNTAIN) {
      constructionType = CONSTRUCTION_TYPES.MOUNTAIN_TUNNEL;
    } else if (tunnelType === TUNNEL_TYPES.URBAN) {
      constructionType = CONSTRUCTION_TYPES.URBAN_TUNNEL;
    } else {
      constructionType = CONSTRUCTION_TYPES.TUNNEL;
    }
  }
  return buildResult({
    constructionType,
    tunnelRequired: true,
    tunnelType,
    constructionDifficulty:
      edge.constructionDifficulty ||
      (constructionType === CONSTRUCTION_TYPES.UNDERSEA_TUNNEL
        ? CONSTRUCTION_DIFFICULTY.EXTREME
        : CONSTRUCTION_DIFFICULTY.HIGH),
    constructionNotes: edge.constructionNotes,
  });
}

/**
 * Classify physical construction for a Hyperloop edge.
 * @param {object} edge
 * @param {object} [fromNode]
 * @param {object} [toNode]
 */
export function classifyConstructionRequirement(edge, fromNode, toNode) {
  if (!edge) return { ...DEFAULT_CONSTRUCTION };

  const from = fromNode ?? edge.fromNode;
  const to = toNode ?? edge.toNode;
  const nameA = from?.name || edge.fromName || '';
  const nameB = to?.name || edge.toName || '';

  const explicit = fromExplicitTunnel(edge);
  if (explicit && edge.constructionType && edge.constructionType !== CONSTRUCTION_TYPES.SURFACE) {
    return explicit;
  }
  if (edge.tunnelRequired) {
    return explicit || fromExplicitTunnel({ ...edge, tunnelRequired: true });
  }

  const isConnector =
    edge.routeClass === 'THROUGH_ROUTE' ||
    edge.edgeType === 'THROUGH_ROUTE' ||
    edge.edgeCategory === 'THROUGH_ROUTE' ||
    edge.isIntercontinentalGateway ||
    edge.edgeCategory === 'INTERCONTINENTAL_GATEWAY' ||
    edge.edgeType === 'INTERCONTINENTAL_GATEWAY_ROUTE' ||
    edge.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR' ||
    edge.routeClass === 'REMOTE_CARGO' ||
    edge.routeClass === 'ARCTIC_LOGISTICS' ||
    edge.routeClass === 'DESERT_LOGISTICS' ||
    edge.routeClass === 'OUTBACK_RESOURCE';

  if (
    matchesKnownPair(nameA, nameB, UNDERSEA_PAIRS) ||
    (edge.waterCrossing && edge.specialCrossing) ||
    (edge.isIntercontinentalGateway && edge.waterCrossing)
  ) {
    return buildResult({
      constructionType: CONSTRUCTION_TYPES.UNDERSEA_TUNNEL,
      tunnelRequired: true,
      tunnelType: TUNNEL_TYPES.UNDERSEA,
      constructionDifficulty: CONSTRUCTION_DIFFICULTY.EXTREME,
      constructionNotes: 'Known water crossing / gateway undersea segment',
    });
  }

  if (matchesKnownPair(nameA, nameB, MOUNTAIN_PAIRS) || (isConnector && isMountainGeography(from, to))) {
    return buildResult({
      constructionType: CONSTRUCTION_TYPES.MOUNTAIN_TUNNEL,
      tunnelRequired: true,
      tunnelType: TUNNEL_TYPES.MOUNTAIN,
      constructionDifficulty: CONSTRUCTION_DIFFICULTY.HIGH,
      constructionNotes: 'High-terrain / mountain corridor',
    });
  }

  if (isConnector && isUrbanDenseCorridor(from, to, edge)) {
    return buildResult({
      constructionType: CONSTRUCTION_TYPES.URBAN_TUNNEL,
      tunnelRequired: true,
      tunnelType: TUNNEL_TYPES.URBAN,
      constructionDifficulty: CONSTRUCTION_DIFFICULTY.HIGH,
      constructionNotes: 'Dense urban / metro corridor',
    });
  }

  if (isConnector && isArcticGeography(from, to)) {
    return buildResult({
      constructionType: CONSTRUCTION_TYPES.ARCTIC_ENGINEERING,
      tunnelRequired: false,
      tunnelType: TUNNEL_TYPES.ARCTIC,
      constructionDifficulty: CONSTRUCTION_DIFFICULTY.HIGH,
      constructionNotes: 'Arctic / permafrost engineering',
    });
  }

  if (isConnector && isDesertGeography(from, to)) {
    return buildResult({
      constructionType: CONSTRUCTION_TYPES.DESERT_CORRIDOR,
      tunnelRequired: false,
      tunnelType: null,
      constructionDifficulty: CONSTRUCTION_DIFFICULTY.MEDIUM,
      constructionNotes: 'Desert / remote surface corridor',
    });
  }

  if (edge.routeClass === 'THROUGH_ROUTE' || edge.edgeType === 'THROUGH_ROUTE') {
    const dist = edge.distanceMiles;
    const difficulty =
      Number.isFinite(dist) && dist > 800
        ? CONSTRUCTION_DIFFICULTY.MEDIUM
        : CONSTRUCTION_DIFFICULTY.LOW;
    return buildResult({
      constructionDifficulty: difficulty,
      constructionNotes: 'Inter-network through connector',
    });
  }

  if (edge.constructionType && edge.constructionType !== CONSTRUCTION_TYPES.SURFACE) {
    return buildResult({
      constructionType: edge.constructionType,
      tunnelRequired: Boolean(edge.tunnelRequired),
      tunnelType: edge.tunnelType,
      constructionDifficulty: edge.constructionDifficulty || CONSTRUCTION_DIFFICULTY.LOW,
      constructionNotes: edge.constructionNotes,
    });
  }

  return buildResult({
    constructionDifficulty: edge.constructionDifficulty || CONSTRUCTION_DIFFICULTY.LOW,
    constructionNotes: edge.constructionNotes,
  });
}
