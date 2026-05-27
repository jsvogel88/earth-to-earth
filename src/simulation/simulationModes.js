/**
 * Simulation emphasis modes — filter which metrics drive visibility and overlays.
 */

export const SIMULATION_MODES = {
  PASSENGER: 'passenger',
  CARGO: 'cargo',
  ECONOMIC: 'economic',
  RESILIENCE: 'resilience',
  EXPANSION: 'expansion',
  CONGESTION: 'congestion',
  CIVILIZATION: 'civilization',
};

/** @param {string} integratedViewFocus */
export function defaultSimulationModeForView(integratedViewFocus) {
  switch (integratedViewFocus) {
    case 'e2m':
    case 'mining_industrial':
      return SIMULATION_MODES.CARGO;
    case 'loop':
      return SIMULATION_MODES.PASSENGER;
    case 'e2e':
      return SIMULATION_MODES.PASSENGER;
    default:
      return SIMULATION_MODES.CIVILIZATION;
  }
}

/**
 * @param {object} edgeState
 * @param {string} mode
 */
export function simulationMetricForMode(edgeState, mode) {
  if (!edgeState) return 0;
  switch (mode) {
    case SIMULATION_MODES.PASSENGER:
      return edgeState.passengerFlow ?? 0;
    case SIMULATION_MODES.CARGO:
      return edgeState.cargoFlow ?? 0;
    case SIMULATION_MODES.ECONOMIC:
      return edgeState.strategicDependency ?? 0;
    case SIMULATION_MODES.RESILIENCE:
      return edgeState.redundancyLoad ?? 0;
    case SIMULATION_MODES.EXPANSION:
      return edgeState.overflowPressure ?? 0;
    case SIMULATION_MODES.CONGESTION:
      return edgeState.congestion ?? 0;
    case SIMULATION_MODES.CIVILIZATION:
    default:
      return edgeState.routeStress ?? 0;
  }
}
