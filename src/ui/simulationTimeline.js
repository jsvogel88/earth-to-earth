/**
 * Planetary Mobility OS — simulation timeline (architecture for future network evolution).
 */

export const SIMULATION_YEARS = [2025, 2030, 2040, 2050, 2075];

export const DEFAULT_SIMULATION_YEAR = 2025;

/** @typedef {typeof SIMULATION_YEARS[number]} SimulationYear */

/**
 * Network growth factor by year (placeholder — wire to data pipelines later).
 * @param {number} year
 */
export function getSimulationGrowthFactor(year) {
  const factors = {
    2025: 1,
    2030: 1.15,
    2040: 1.35,
    2050: 1.6,
    2075: 2.2,
  };
  return factors[year] ?? 1;
}

/**
 * Human-readable era label for timeline UI.
 * @param {number} year
 */
export function getSimulationEraLabel(year) {
  if (year <= 2025) return 'Foundation';
  if (year <= 2030) return 'Expansion';
  if (year <= 2040) return 'Integration';
  if (year <= 2050) return 'Orbital logistics';
  return 'Multi-planetary';
}

/**
 * Features unlocked by simulation year (UI hints; map hooks TBD).
 * @param {number} year
 */
export function getSimulationMilestones(year) {
  const milestones = [];
  if (year >= 2030) milestones.push('Hyperloop corridor densification');
  if (year >= 2040) milestones.push('Lunar logistics staging');
  if (year >= 2050) milestones.push('Mars transport windows');
  if (year >= 2075) milestones.push('Civilization-scale grid maturity');
  return milestones;
}
