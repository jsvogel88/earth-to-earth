export const VIEW_MODES = [
  { id: 'earth_map', label: 'Earth Map', description: 'Plan corridors, hubs, and regions on the 2D map.' },
  {
    id: 'earth_globe',
    label: 'Earth Globe',
    description: 'Elevated 2D perspective (pitch) on the Earth map.',
    plannedOnly: false,
  },
  {
    id: 'planet_view',
    label: 'Planet View',
    description: 'Earth / Moon / Mars logistics profiles.',
    plannedOnly: false,
  },
  { id: 'infrastructure_grid', label: 'Infrastructure Grid', description: 'Hyperloop, rail, ports, industrial zones.' },
  {
    id: 'payload_flow',
    label: 'Payload Flow',
    description: 'Cargo corridors + simulation flow overlay.',
    plannedOnly: false,
  },
  {
    id: 'manufacturing_flow',
    label: 'Manufacturing Flow',
    description: 'Industrial package profile + flow overlay.',
    plannedOnly: false,
  },
  {
    id: 'launch_window',
    label: 'Launch Window',
    description: 'Mars transfer window profile (2050 staging).',
    plannedOnly: false,
  },
  {
    id: 'scenario_compare',
    label: 'Scenario Compare',
    description: 'Diff saved layer snapshots in Versions.',
    plannedOnly: false,
  },
];

export const DEFAULT_VIEW_MODE = 'earth_map';

export function getViewModeById(id) {
  return VIEW_MODES.find((v) => v.id === id) ?? null;
}
