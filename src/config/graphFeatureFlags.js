/**
 * Graph builder feature flags — opt-in synthesis; never auto-promotes overlays.
 */
export const GRAPH_FEATURE_FLAGS = Object.freeze({
  /** When true, append declarative strategic feeder edges (official membership only). */
  SYNTHESIZE_STRATEGIC_FEEDERS: false,
});
