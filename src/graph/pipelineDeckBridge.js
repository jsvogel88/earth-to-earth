/**
 * Convert route display pipeline buckets into deck.gl layer data shapes.
 */

/**
 * @param {object[]} segments
 * @param {object} options
 * @returns {object[]}
 */
export function bucketSegmentsToDeckPaths(
  segments,
  { deckMode = 'hyperloop', routeClass = 'CONTINENTAL_SPINE', edgeCategory = 'CONTINENTAL_SPINE' } = {}
) {
  return (segments ?? []).map((seg, i) => ({
    id: seg.id || `pipeline-path-${i}`,
    path: [seg.from, seg.to],
    routeClass,
    edgeCategory,
    infrastructureTier: seg.tier ?? 2,
    economicTier: seg.tier ?? 2,
    renderable: true,
    infrastructureOnly: true,
    fromName: seg.fromName,
    toName: seg.toName,
    mode: deckMode,
    routeType: seg.routeType,
    widthScale: (seg.width ?? 2) / 2,
    distanceKm: seg.distanceKm,
    civilizationImportance: seg.civilizationImportance,
    economicCorridorType: seg.economicCorridorType,
    spinalTrunkClass: seg.spinalTrunkClass,
    corridorId: seg.corridorId,
    e2mSubFamily: seg.e2mSubFamily,
    generatedBy: 'route-display-pipeline',
  }));
}

/**
 * @param {object[]} segments
 * @param {object} options
 * @returns {object[]}
 */
export function bucketSegmentsToDeckArcs(
  segments,
  { deckMode = 'e2m', routeClass = 'E2M', edgeCategory = 'E2M_CORRIDOR' } = {}
) {
  return (segments ?? []).map((seg, i) => ({
    id: seg.id || `pipeline-e2m-arc-${i}`,
    sourcePosition: seg.sourcePosition ?? seg.from,
    targetPosition: seg.targetPosition ?? seg.to,
    routeClass,
    edgeCategory,
    infrastructureTier: seg.tier ?? 2,
    economicTier: seg.tier ?? 2,
    renderable: true,
    fromName: seg.fromName,
    toName: seg.toName,
    mode: deckMode,
    routeType: seg.routeType,
    distanceKm: seg.distanceKm,
    civilizationImportance: seg.civilizationImportance,
    economicCorridorType: seg.economicCorridorType,
    spinalTrunkClass: seg.spinalTrunkClass,
    corridorId: seg.corridorId,
    e2mSubFamily: seg.e2mSubFamily,
    economicWeight: seg.economicWeight,
    generatedBy: 'route-display-pipeline',
  }));
}

/**
 * @param {object} buckets
 * @returns {{
 *   canonicalGridArcs: object[],
 *   canonicalSpinePaths: object[],
 *   canonicalLoopPaths: object[],
 *   canonicalE2mArcs: object[],
 *   canonicalE2mPaths: object[],
 * }}
 */
export function pipelineBucketsToCanonicalDeck(buckets) {
  const canonicalE2mArcs = bucketSegmentsToDeckArcs(buckets.cargoArcs ?? buckets.cargoPaths, {
    deckMode: 'e2m',
    routeClass: 'E2M',
    edgeCategory: 'E2M_CORRIDOR',
  });

  return {
    canonicalGridArcs: buckets.arcs ?? [],
    canonicalSpinePaths: bucketSegmentsToDeckPaths(buckets.trunkPaths, {
      deckMode: 'hyperloop',
      routeClass: 'CONTINENTAL_SPINE',
      edgeCategory: 'CONTINENTAL_SPINE',
    }),
    canonicalLoopPaths: [
      ...bucketSegmentsToDeckPaths(buckets.loopPaths, {
        deckMode: 'loop',
        routeClass: 'REGIONAL',
        edgeCategory: 'REGIONAL_TRUNK',
      }),
      ...bucketSegmentsToDeckPaths(buckets.feederPaths, {
        deckMode: 'loop',
        routeClass: 'REGIONAL',
        edgeCategory: 'FEEDER',
      }),
    ],
    canonicalE2mArcs,
    /** @deprecated use canonicalE2mArcs — kept empty to prevent PathLayer misuse */
    canonicalE2mPaths: [],
  };
}
