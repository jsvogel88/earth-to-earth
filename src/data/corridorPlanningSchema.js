/**
 * Manual corridor / route planning schema — data-only, no graph mutation.
 * Future: bulk import, economics, elevation, weather, feasibility scoring.
 */

export const CORRIDOR_TYPES = {
  GLOBAL_TRUNK: 'global_trunk',
  CONTINENTAL_TRUNK: 'continental_trunk',
  REGIONAL_FEEDER: 'regional_feeder',
  INTERMODAL_GATEWAY: 'intermodal_gateway',
  UNDERSEA_CONCEPT: 'undersea_concept',
  POLAR_ARCTIC: 'polar_arctic',
  ORBITAL_LOGISTICS: 'orbital_logistics',
  LOCAL_SERVICE: 'local_service',
};

export const CORRIDOR_STATUS = {
  OFFICIAL: 'official',
  PLANNING: 'planning',
  CONCEPTUAL: 'conceptual',
  FUTURE: 'future',
  STRATEGIC_STUDY: 'strategic_study',
};

export const TRANSPORT_MODE_TAGS = {
  HYPERLOOP: 'hyperloop',
  E2E: 'e2e',
  E2M: 'e2m',
  ROBOTAXI: 'robotaxi',
  MULTIMODAL: 'multimodal',
};

/**
 * @typedef {Object} CorridorPlanningRecord
 * @property {string} id
 * @property {string} name
 * @property {string} [startNode]
 * @property {string} [endNode]
 * @property {string[]} [intermediateNodes]
 * @property {string} corridorType
 * @property {string} [mode]
 * @property {string} status
 * @property {number|null} [feasibilityScore]
 * @property {number|null} [economicScore]
 * @property {number|null} [terrainRisk]
 * @property {number|null} [weatherRisk]
 * @property {number|null} [populationServed]
 * @property {string} [notes]
 * @property {number} [minZoom]
 * @property {number} [maxZoom]
 * @property {boolean} [previewOnly]
 */

/**
 * @param {Partial<CorridorPlanningRecord>} fields
 * @returns {CorridorPlanningRecord}
 */
export function createCorridorRecord(fields) {
  return {
    id: fields.id,
    name: fields.name,
    startNode: fields.startNode ?? null,
    endNode: fields.endNode ?? null,
    intermediateNodes: fields.intermediateNodes ?? [],
    corridorType: fields.corridorType ?? CORRIDOR_TYPES.GLOBAL_TRUNK,
    mode: fields.mode ?? TRANSPORT_MODE_TAGS.MULTIMODAL,
    status: fields.status ?? CORRIDOR_STATUS.PLANNING,
    feasibilityScore: fields.feasibilityScore ?? null,
    economicScore: fields.economicScore ?? null,
    terrainRisk: fields.terrainRisk ?? null,
    weatherRisk: fields.weatherRisk ?? null,
    populationServed: fields.populationServed ?? null,
    notes: fields.notes ?? '',
    minZoom: fields.minZoom ?? 0,
    maxZoom: fields.maxZoom ?? 22,
    previewOnly: fields.previewOnly !== false,
  };
}

/**
 * @param {CorridorPlanningRecord} record
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCorridorRecord(record) {
  const errors = [];
  if (!record?.id) errors.push('missing id');
  if (!record?.name) errors.push('missing name');
  if (!record?.corridorType) errors.push('missing corridorType');
  if (!record?.status) errors.push('missing status');
  if (record.previewOnly !== true) {
    errors.push('planning corridors must set previewOnly: true');
  }
  const hasPath =
    (record.startNode && record.endNode) ||
    (Array.isArray(record.intermediateNodes) && record.intermediateNodes.length >= 2);
  if (!hasPath) errors.push('needs start/end or intermediateNodes');
  return { valid: errors.length === 0, errors };
}

export function isPlanningCorridorRecord(record) {
  return Boolean(record?.previewOnly);
}
