/**
 * Match pasted mineral site names against the default mineral hub dataset.
 */

import { DEFAULT_MINERAL_HUBS } from '../../data/mineralHubs.js';

/**
 * @typedef {Object} ParsedMineralRecord
 * @property {string} id
 * @property {string} rawText
 * @property {string|null} matchedHubId
 * @property {string} name
 * @property {string} country
 * @property {string} region
 * @property {string} mineral_type
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} confidence
 * @property {'matched'|'unresolved'|'suggested'} status
 * @property {object[]} [suggestions]
 */

function normalize(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * @param {string} line
 * @param {object[]} hubs
 * @returns {ParsedMineralRecord}
 */
function matchLine(line, hubs) {
  const rawText = String(line || '').trim();
  const key = normalize(rawText);

  if (!key) {
    return {
      id: `mineral-unresolved:${Date.now()}`,
      rawText,
      matchedHubId: null,
      name: rawText,
      country: '',
      region: '',
      mineral_type: '',
      latitude: 0,
      longitude: 0,
      confidence: 0,
      status: 'unresolved',
      suggestions: [],
    };
  }

  const exact = hubs.find((h) => normalize(h.name) === key);
  if (exact) {
    return {
      id: `parsed-mineral:${exact.mineral_hub_id}`,
      rawText,
      matchedHubId: exact.mineral_hub_id,
      name: exact.name,
      country: exact.country,
      region: exact.region,
      mineral_type: exact.mineral_type,
      latitude: exact.latitude,
      longitude: exact.longitude,
      confidence: 1,
      status: 'matched',
    };
  }

  const partial = hubs.filter(
    (h) => normalize(h.name).includes(key) || key.includes(normalize(h.name))
  );

  if (partial.length === 1) {
    const hub = partial[0];
    return {
      id: `parsed-mineral:${hub.mineral_hub_id}`,
      rawText,
      matchedHubId: hub.mineral_hub_id,
      name: hub.name,
      country: hub.country,
      region: hub.region,
      mineral_type: hub.mineral_type,
      latitude: hub.latitude,
      longitude: hub.longitude,
      confidence: 0.75,
      status: 'matched',
    };
  }

  if (partial.length > 1) {
    return {
      id: `mineral-suggest:${key}`,
      rawText,
      matchedHubId: null,
      name: rawText,
      country: '',
      region: '',
      mineral_type: '',
      latitude: 0,
      longitude: 0,
      confidence: 0.4,
      status: 'suggested',
      suggestions: partial.slice(0, 5),
    };
  }

  return {
    id: `mineral-unresolved:${key}`,
    rawText,
    matchedHubId: null,
    name: rawText,
    country: '',
    region: '',
    mineral_type: '',
    latitude: 0,
    longitude: 0,
    confidence: 0,
    status: 'unresolved',
    suggestions: [],
  };
}

/**
 * @param {string} text
 * @param {object[]} [hubs]
 * @returns {{ matched: ParsedMineralRecord[], unresolved: ParsedMineralRecord[], suggested: ParsedMineralRecord[] }}
 */
export function parseMineralSiteList(text, hubs = DEFAULT_MINERAL_HUBS) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results = lines.map((line) => matchLine(line, hubs));

  return {
    matched: results.filter((r) => r.status === 'matched'),
    unresolved: results.filter((r) => r.status === 'unresolved'),
    suggested: results.filter((r) => r.status === 'suggested'),
  };
}
