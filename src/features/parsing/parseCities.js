/**
 * Bulk city paste parser — overlay-only, transport-agnostic.
 */

import { suggestRoleAndLayersForCity } from '../../data/userCustomDestinations.js';
import { PARSE_STATUS } from './parsingTypes.js';
import { prepareInputLines } from './parsingUtils.js';
import { matchCityLine } from './cityMatcher.js';

const CHUNK_SIZE = 100;

/**
 * @param {import('./parsingTypes.js').ParsedCityRecord} city
 */
function withSuggestedRole(city) {
  const suggestion = suggestRoleAndLayersForCity({
    name: city.city,
    country: city.country,
    population: city.population,
  });
  return { ...city, suggestedRole: suggestion.role };
}

/**
 * @param {string} rawInput
 * @param {object} [options]
 * @param {Set<string>} [options.existingWorldCityIds]
 * @param {Set<string>} [options.existingParsedIds]
 * @param {object[]} [options.mapNodes]
 * @param {(progress: { done: number, total: number }) => void} [options.onProgress]
 */
export async function parseCityList(rawInput, options = {}) {
  const lines = prepareInputLines(rawInput);
  const total = lines.length;
  const existingIds = options.existingWorldCityIds || new Set();
  const existingParsed = options.existingParsedIds || new Set();
  const seenInBatch = new Set();

  const result = {
    lines: [],
    valid: [],
    invalid: [],
    duplicates: [],
    alreadyAdded: [],
    unresolved: [],
    totalLines: total,
    parsedCount: 0,
    failedCount: 0,
    duplicateCount: 0,
    alreadyAddedCount: 0,
  };

  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    const chunk = lines.slice(i, i + CHUNK_SIZE);
    for (const line of chunk) {
      const { match, matchedBy, suggestions, reason } = matchCityLine(line, {
        mapNodes: options.mapNodes,
      });

      if (!match || match.lat == null || match.lng == null) {
        const entry = {
          rawInput: line,
          status: PARSE_STATUS.UNRESOLVED,
          city: null,
          reason: reason || 'Missing coordinates',
          suggestions: suggestions || [],
        };
        result.lines.push(entry);
        result.unresolved.push(entry);
        result.failedCount += 1;
        continue;
      }

      const enriched = withSuggestedRole(match);
      const dedupeKey = enriched.worldCityId || `${enriched.city}|${enriched.country}`;

      if (seenInBatch.has(dedupeKey)) {
        const entry = {
          rawInput: line,
          status: PARSE_STATUS.DUPLICATE,
          city: enriched,
          reason: 'Duplicate in paste',
        };
        result.lines.push(entry);
        result.duplicates.push(entry);
        result.duplicateCount += 1;
        continue;
      }
      seenInBatch.add(dedupeKey);

      if (existingIds.has(enriched.worldCityId) || existingParsed.has(enriched.id)) {
        const entry = {
          rawInput: line,
          status: PARSE_STATUS.ALREADY_ADDED,
          city: enriched,
          reason: 'Already on map',
        };
        result.lines.push(entry);
        result.alreadyAdded.push(entry);
        result.alreadyAddedCount += 1;
        continue;
      }

      if (matchedBy === 'unresolved') {
        const entry = {
          rawInput: line,
          status: PARSE_STATUS.UNRESOLVED,
          city: null,
          suggestions: suggestions || [],
          reason,
        };
        result.lines.push(entry);
        result.unresolved.push(entry);
        result.failedCount += 1;
        continue;
      }

      const entry = {
        rawInput: line,
        status: PARSE_STATUS.VALID,
        city: enriched,
      };
      result.lines.push(entry);
      result.valid.push(enriched);
      result.parsedCount += 1;
    }

    if (options.onProgress) {
      options.onProgress({ done: Math.min(i + CHUNK_SIZE, total), total });
    }
    if (lines.length > CHUNK_SIZE) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return result;
}

/**
 * Synchronous parse for unit tests (small inputs).
 */
export function parseCityListSync(rawInput, options = {}) {
  const lines = prepareInputLines(rawInput);
  const existingIds = options.existingWorldCityIds || new Set();
  const existingParsed = options.existingParsedIds || new Set();
  const seenInBatch = new Set();

  const result = {
    lines: [],
    valid: [],
    invalid: [],
    duplicates: [],
    alreadyAdded: [],
    unresolved: [],
    totalLines: lines.length,
    parsedCount: 0,
    failedCount: 0,
    duplicateCount: 0,
    alreadyAddedCount: 0,
  };

  for (const line of lines) {
    const { match, suggestions, reason } = matchCityLine(line, { mapNodes: options.mapNodes });

    if (!match || match.lat == null || match.lng == null) {
      const entry = {
        rawInput: line,
        status: PARSE_STATUS.UNRESOLVED,
        city: null,
        reason: reason || 'Missing coordinates',
        suggestions: suggestions || [],
      };
      result.lines.push(entry);
      result.unresolved.push(entry);
      result.failedCount += 1;
      continue;
    }

    const enriched = withSuggestedRole(match);
    const dedupeKey = enriched.worldCityId || `${enriched.city}|${enriched.country}`;

    if (seenInBatch.has(dedupeKey)) {
      const entry = { rawInput: line, status: PARSE_STATUS.DUPLICATE, city: enriched };
      result.lines.push(entry);
      result.duplicates.push(entry);
      result.duplicateCount += 1;
      continue;
    }
    seenInBatch.add(dedupeKey);

    if (existingIds.has(enriched.worldCityId) || existingParsed.has(enriched.id)) {
      const entry = { rawInput: line, status: PARSE_STATUS.ALREADY_ADDED, city: enriched };
      result.lines.push(entry);
      result.alreadyAdded.push(entry);
      result.alreadyAddedCount += 1;
      continue;
    }

    const entry = { rawInput: line, status: PARSE_STATUS.VALID, city: enriched };
    result.lines.push(entry);
    result.valid.push(enriched);
    result.parsedCount += 1;
  }

  return result;
}
