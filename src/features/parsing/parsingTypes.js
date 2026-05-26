/**
 * Parsed city overlay types — overlay-only, no graph mutation.
 */

/** @typedef {'parsed'|'mapFallback'|'preview'} ParsedCitySource */

/** @typedef {'exact'|'fuzzy'|'alias'|'existingMapNode'|'unresolved'} ParsedMatchedBy */

/**
 * @typedef {Object} ParsedCityRecord
 * @property {string} id — stable overlay id
 * @property {string} city
 * @property {string} country
 * @property {number} lat
 * @property {number} lng
 * @property {number|null} population
 * @property {ParsedCitySource} source
 * @property {number} parsingConfidence — 0..1
 * @property {ParsedMatchedBy} matchedBy
 * @property {string} suggestedRole
 * @property {string} [worldCityId]
 * @property {string} [rawInput]
 * @property {boolean} [isPreview]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} ParseLineResult
 * @property {string} rawInput
 * @property {'valid'|'invalid'|'duplicate'|'alreadyAdded'|'unresolved'} status
 * @property {ParsedCityRecord|null} city
 * @property {string} [reason]
 * @property {ParsedCityRecord[]} [suggestions]
 */

/**
 * @typedef {Object} ParseCitiesResult
 * @property {ParseLineResult[]} lines
 * @property {ParsedCityRecord[]} valid
 * @property {ParseLineResult[]} invalid
 * @property {ParseLineResult[]} duplicates
 * @property {ParseLineResult[]} alreadyAdded
 * @property {ParseLineResult[]} unresolved
 * @property {number} totalLines
 * @property {number} parsedCount
 * @property {number} failedCount
 * @property {number} duplicateCount
 * @property {number} alreadyAddedCount
 */

/**
 * @typedef {Object} ImportSession
 * @property {string} id
 * @property {string} createdAt
 * @property {number} lineCount
 * @property {number} addedCount
 * @property {string} [label]
 */

export const PARSED_CITY_STORAGE_KEY = 'transport-map-parsed-cities-v1';
export const PARSED_SESSIONS_STORAGE_KEY = 'transport-map-parse-sessions-v1';

export const PARSE_STATUS = {
  VALID: 'valid',
  INVALID: 'invalid',
  DUPLICATE: 'duplicate',
  ALREADY_ADDED: 'alreadyAdded',
  UNRESOLVED: 'unresolved',
};
