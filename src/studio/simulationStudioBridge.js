/**
 * Studio timeline presets → simulation year + mode + optional scenario.
 */

import { SIMULATION_MODES } from '../simulation/simulationModes.js';
import { getSimulationEraLabel, getSimulationMilestones } from '../ui/simulationTimeline.js';

export const SIMULATION_TIMELINE_PRESETS = [
  {
    id: 'foundation_2025',
    label: '2025 — Foundation',
    year: 2025,
    simulationMode: SIMULATION_MODES.CIVILIZATION,
    scenarioId: 'current-default-network',
    missionModeId: 'current_default',
  },
  {
    id: 'expansion_2030',
    label: '2030 — Expansion',
    year: 2030,
    simulationMode: SIMULATION_MODES.EXPANSION,
    scenarioId: 'gigafactory-export-network',
    missionModeId: 'earth_cargo',
  },
  {
    id: 'integration_2040',
    label: '2040 — Integration',
    year: 2040,
    simulationMode: SIMULATION_MODES.CIVILIZATION,
    scenarioId: 'terafab-heavy-industry-network',
    missionModeId: 'earth_cargo',
  },
  {
    id: 'orbital_2050',
    label: '2050 — Orbital logistics',
    year: 2050,
    simulationMode: SIMULATION_MODES.CARGO,
    scenarioId: 'mars-civilization-network',
    missionModeId: 'mars_civilization',
  },
  {
    id: 'multiplanetary_2075',
    label: '2075 — Multi-planetary',
    year: 2075,
    simulationMode: SIMULATION_MODES.CIVILIZATION,
    scenarioId: 'million-people-to-mars',
    missionModeId: 'mars_civilization',
  },
];

export function getSimulationPresetById(id) {
  return SIMULATION_TIMELINE_PRESETS.find((p) => p.id === id) ?? null;
}

export function describeSimulationYear(year) {
  return {
    era: getSimulationEraLabel(year),
    milestones: getSimulationMilestones(year),
  };
}
