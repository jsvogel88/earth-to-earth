/** Hub type options library (metadata; map wiring in later phases). */

export const HUB_TYPE_GROUPS = {
  SPACE: 'space',
  GROUND: 'ground',
  INDUSTRIAL: 'industrial',
  CIVILIZATION: 'civilization',
};

export const HUB_TYPES = [
  { id: 'e2e_passenger', label: 'E2E passenger hub', group: HUB_TYPE_GROUPS.SPACE, color: '#d4af37', plannedOnly: false },
  { id: 'e2e_cargo', label: 'E2E cargo hub', group: HUB_TYPE_GROUPS.SPACE, color: '#d4af37', plannedOnly: false },
  { id: 'e2m_launch', label: 'E2M / launch hub', group: HUB_TYPE_GROUPS.SPACE, color: '#ff6b35', plannedOnly: false },
  { id: 'starbase_launch', label: 'Starbase-class launch hub', group: HUB_TYPE_GROUPS.SPACE, color: '#ff4444', plannedOnly: false },
  { id: 'hyperloop_hub', label: 'Hyperloop hub', group: HUB_TYPE_GROUPS.GROUND, color: '#00dcff', plannedOnly: false },
  { id: 'rail_terminal', label: 'Rail terminal', group: HUB_TYPE_GROUPS.GROUND, color: '#8899aa', plannedOnly: true },
  { id: 'port_hub', label: 'Port hub', group: HUB_TYPE_GROUPS.GROUND, color: '#6688aa', plannedOnly: true },
  { id: 'kilaplant_hub', label: 'KilaPlant hub', group: HUB_TYPE_GROUPS.INDUSTRIAL, color: '#7dff9a', plannedOnly: true },
  { id: 'gigafactory_hub', label: 'GigaFactory hub', group: HUB_TYPE_GROUPS.INDUSTRIAL, color: '#c8e060', plannedOnly: true },
  { id: 'terafab_hub', label: 'TeraFab hub', group: HUB_TYPE_GROUPS.INDUSTRIAL, color: '#e8b84d', plannedOnly: true },
  { id: 're2e_resource', label: 'RE2E / rare earth hub', group: HUB_TYPE_GROUPS.INDUSTRIAL, color: '#b060ff', plannedOnly: false },
  { id: 'petabond_deployment', label: 'PetaBond deployment hub', group: HUB_TYPE_GROUPS.CIVILIZATION, color: '#50ffc8', plannedOnly: false },
  { id: 'mars_settlement', label: 'Mars settlement hub', group: HUB_TYPE_GROUPS.CIVILIZATION, color: '#ff8866', plannedOnly: true },
  { id: 'moon_base', label: 'Moon base hub', group: HUB_TYPE_GROUPS.CIVILIZATION, color: '#aaccff', plannedOnly: true },
];

export function getHubTypesByGroup(group) {
  return HUB_TYPES.filter((h) => h.group === group);
}

export function getHubTypeById(id) {
  return HUB_TYPES.find((h) => h.id === id) ?? null;
}
