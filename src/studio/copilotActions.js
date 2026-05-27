/**
 * Deterministic Mission Copilot actions (no external AI).
 */

import { MISSION_MODE_SCENARIO_ID } from './scenarioLayerEngine.js';

/**
 * @typedef {{ type: 'apply_scenario', scenarioId: string, explanation: string } | { type: 'apply_mission', missionModeId: string, explanation: string } | { type: 'layer_hint', explanation: string, scenarioId?: string }} CopilotAction
 */

const PROMPT_ACTIONS = [
  {
    match: (t) => /explain.*network/i.test(t),
    action: {
      type: 'layer_hint',
      explanation:
        'The Civilization Grid shows gold E2E arcs, orange RE2E/E2M cargo arcs, and cyan Hyperloop spine. Use Layers for manual control.',
    },
  },
  {
    match: (t) => /million.*mars|mars.*million|1\s*million/i.test(t),
    action: {
      type: 'apply_scenario',
      scenarioId: 'million-people-to-mars',
      explanation:
        'Applying Million People to Mars — E2E + RE2E + Hyperloop with Starbase/PetaBond overlays.',
    },
  },
  {
    match: (t) => /mars civilization|mars logistics/i.test(t),
    action: {
      type: 'apply_scenario',
      scenarioId: 'mars-civilization-network',
      explanation: 'Applying Mars Civilization Network — RE2E focus with Starbase connectivity.',
    },
  },
  {
    match: (t) => /petabond|petabond/i.test(t),
    action: {
      type: 'apply_scenario',
      scenarioId: 'petabond-export-package',
      explanation: 'Applying PetaBond Export Package — RE2E corridors + Starbase/PETABOND highlights.',
    },
  },
  {
    match: (t) => /cargo only|only cargo/i.test(t),
    action: {
      type: 'apply_mission',
      missionModeId: 'earth_cargo',
      explanation: 'Switching to Earth Cargo mission profile — RE2E/mining emphasis.',
    },
  },
  {
    match: (t) => /passenger/i.test(t),
    action: {
      type: 'apply_mission',
      missionModeId: 'earth_passenger',
      explanation: 'Switching to Earth Passenger profile — E2E global focus.',
    },
  },
  {
    match: (t) => /re2e|rare earth/i.test(t),
    action: {
      type: 'apply_mission',
      missionModeId: 're2e_network',
      explanation: 'Switching to RE2E / rare-earth corridor profile.',
    },
  },
  {
    match: (t) => /kilaplant/i.test(t),
    action: {
      type: 'apply_scenario',
      scenarioId: 'kilaplant-deployment-network',
      explanation: 'Applying KilaPlant deployment — mining/RE2E emphasis.',
    },
  },
  {
    match: (t) => /gigafactory/i.test(t),
    action: {
      type: 'apply_scenario',
      scenarioId: 'gigafactory-export-network',
      explanation: 'Applying GigaFactory export network — industrial + Hyperloop feeders.',
    },
  },
  {
    match: (t) => /moon logistics|lunar/i.test(t),
    action: {
      type: 'apply_planet',
      planetId: 'moon',
      explanation: 'Switching to Moon logistics — E2M export + Starbase staging profile.',
    },
  },
  {
    match: (t) => /mars logistics|coloniz/i.test(t),
    action: {
      type: 'apply_planet',
      planetId: 'mars',
      explanation: 'Switching to Mars civilization logistics — million-people buildout profile.',
    },
  },
  {
    match: (t) => /2075|multi.?planetary|timeline 2075/i.test(t),
    action: {
      type: 'apply_timeline',
      presetId: 'multiplanetary_2075',
      explanation: 'Applying 2075 multi-planetary timeline preset.',
    },
  },
  {
    match: (t) => /starbase.*remote|remote.*starbase|dense cit/i.test(t),
    action: {
      type: 'layer_hint',
      explanation:
        'For E2M, remote Starbase-class hubs are preferred over dense city centers: City → Hyperloop/Rail → Remote launch hub → Moon/Mars. I can apply Mars or PetaBond scenarios to illustrate.',
      scenarioId: 'mars-civilization-network',
    },
  },
];

/**
 * @param {string} prompt
 * @returns {{ response: string, action: CopilotAction | null }}
 */
export function resolveCopilotPrompt(prompt) {
  const text = String(prompt ?? '').trim();
  if (!text) {
    return {
      response: 'Describe your mission goal and I can suggest a scenario or layer profile.',
      action: null,
    };
  }

  for (const { match, action } of PROMPT_ACTIONS) {
    if (match(text)) {
      return { response: action.explanation, action };
    }
  }

  return {
    response:
      'Mission Copilot (preview): try “Build a Mars logistics scenario”, “Show PETABOND routes”, or “Explain this network”.',
    action: null,
  };
}

export function scenarioIdForMissionMode(missionModeId) {
  return MISSION_MODE_SCENARIO_ID[missionModeId] ?? 'current-default-network';
}
