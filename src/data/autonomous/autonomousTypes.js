/**
 * @file Canonical autonomous transport object shapes (JSDoc).
 */

/**
 * @typedef {object} AutonomousHub
 * @property {string} id
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 * @property {string} [country]
 * @property {string} [region]
 * @property {string[]} hubTypes
 * @property {string[]} modes
 * @property {string|number} [tier]
 * @property {string[]} [tags]
 * @property {string} source
 * @property {string} [canonicalId]
 * @property {object} [metadata]
 */

/**
 * @typedef {object} RobotaxiServiceArea
 * @property {string} id
 * @property {string} type
 * @property {string} modeId
 * @property {string} sourceHubId
 * @property {string} sourceHubName
 * @property {[number, number]} coordinates
 * @property {number} radiusMiles
 * @property {number} radiusMeters
 * @property {import('geojson').Feature} geometry
 * @property {string[]} eligibilityReasons
 */

export {};
