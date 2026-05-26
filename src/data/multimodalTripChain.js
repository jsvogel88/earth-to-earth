/**
 * Multimodal trip chain foundation — planning structure only (no simulation).
 *
 * Example chain:
 * Origin → Robotaxi → Hyperloop feeder → Hyperloop trunk → E2E Starship
 * → Hyperloop feeder → Robotaxi → Final destination
 */

export const TRIP_MODALITIES = {
  ROBOTAXI: 'ROBOTAXI',
  HYPERLOOP_FEEDER: 'HYPERLOOP_FEEDER',
  HYPERLOOP_TRUNK: 'HYPERLOOP_TRUNK',
  HYPERLOOP_GATEWAY: 'HYPERLOOP_GATEWAY',
  E2E_STARSHIP: 'E2E_STARSHIP',
  E2M_ORBITAL: 'E2M_ORBITAL',
  WALK_TRANSFER: 'WALK_TRANSFER',
};

/** Ordered template for premium long-haul passenger trips */
export const PREMIUM_LONG_HAUL_CHAIN = [
  TRIP_MODALITIES.ROBOTAXI,
  TRIP_MODALITIES.HYPERLOOP_FEEDER,
  TRIP_MODALITIES.HYPERLOOP_TRUNK,
  TRIP_MODALITIES.HYPERLOOP_GATEWAY,
  TRIP_MODALITIES.E2E_STARSHIP,
  TRIP_MODALITIES.HYPERLOOP_GATEWAY,
  TRIP_MODALITIES.HYPERLOOP_TRUNK,
  TRIP_MODALITIES.HYPERLOOP_FEEDER,
  TRIP_MODALITIES.ROBOTAXI,
];

/**
 * @typedef {Object} TripChainSegment
 * @property {string} id
 * @property {keyof TRIP_MODALITIES} modality
 * @property {string} fromNodeId
 * @property {string} toNodeId
 * @property {string} [fromName]
 * @property {string} [toName]
 * @property {number} [distanceMiles]
 * @property {boolean} [inheritedCorridor]
 * @property {string} [corridorId]
 * @property {boolean} [requiresValidation]
 */

/**
 * @param {Partial<TripChainSegment>} segment
 * @returns {TripChainSegment}
 */
export function createTripChainSegment(segment) {
  return {
    id: segment.id || `seg-${segment.modality}-${Date.now()}`,
    modality: segment.modality || TRIP_MODALITIES.WALK_TRANSFER,
    fromNodeId: segment.fromNodeId || '',
    toNodeId: segment.toNodeId || '',
    fromName: segment.fromName ?? null,
    toName: segment.toName ?? null,
    distanceMiles: segment.distanceMiles ?? null,
    inheritedCorridor: Boolean(segment.inheritedCorridor),
    corridorId: segment.corridorId ?? null,
    requiresValidation: segment.requiresValidation !== false,
  };
}

/**
 * @param {TripChainSegment[]} segments
 * @returns {{ segments: TripChainSegment[], modalities: string[], valid: boolean }}
 */
export function validateTripChain(segments) {
  const modalities = segments.map((s) => s.modality);
  const valid = segments.every((s) => s.fromNodeId && s.toNodeId && s.modality);
  return { segments, modalities, valid };
}

/**
 * Stub builder for future route planner integration.
 * @param {{ originId: string, destinationId: string, template?: string[] }} params
 */
export function buildTripChainPlaceholder({ originId, destinationId, template = PREMIUM_LONG_HAUL_CHAIN }) {
  return template.map((modality, index) =>
    createTripChainSegment({
      id: `chain-${index}-${modality}`,
      modality,
      fromNodeId: index === 0 ? originId : `via-${index}`,
      toNodeId: index === template.length - 1 ? destinationId : `via-${index + 1}`,
      inheritedCorridor: modality.includes('HYPERLOOP'),
      requiresValidation: true,
    })
  );
}
