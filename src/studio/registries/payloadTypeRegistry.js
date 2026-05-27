/** Payload categories for filtering / scenario focus (Phase 1 UI state). */

export const PAYLOAD_GROUPS = {
  HUMAN: 'human',
  CARGO: 'cargo',
  MOON_MARS: 'moon_mars',
  INDUSTRIAL: 'industrial',
  SPECIAL: 'special',
};

export const PAYLOAD_TYPES = [
  { id: 'passengers', label: 'Passengers', group: PAYLOAD_GROUPS.HUMAN },
  { id: 'settlers', label: 'Settlers', group: PAYLOAD_GROUPS.HUMAN },
  { id: 'general_freight', label: 'General freight', group: PAYLOAD_GROUPS.CARGO },
  { id: 'habitat_modules', label: 'Habitat modules', group: PAYLOAD_GROUPS.MOON_MARS },
  { id: 'mining_equipment', label: 'Mining equipment', group: PAYLOAD_GROUPS.MOON_MARS },
  { id: 'rare_earths', label: 'Rare earths', group: PAYLOAD_GROUPS.INDUSTRIAL },
  { id: 'factory_modules', label: 'Factory modules', group: PAYLOAD_GROUPS.INDUSTRIAL },
  { id: 'petabond_package', label: 'PetaBond package', group: PAYLOAD_GROUPS.SPECIAL, highlight: true },
  { id: 'emergency_supplies', label: 'Emergency supplies', group: PAYLOAD_GROUPS.SPECIAL },
];

export function getPayloadTypesByGroup(group) {
  return PAYLOAD_TYPES.filter((p) => p.group === group);
}

export function getPayloadTypeById(id) {
  return PAYLOAD_TYPES.find((p) => p.id === id) ?? null;
}
