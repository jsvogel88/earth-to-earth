/**
 * Transportation mode options library (education + future map toggles).
 * Existing map modes remain in transportOperatingSystem / layerRegistry.
 */

export const MODE_LIBRARY_GROUPS = {
  SPACE: 'space',
  HIGH_SPEED_GROUND: 'high_speed_ground',
  CONVENTIONAL_GROUND: 'conventional_ground',
  LOCAL: 'local',
  MARITIME: 'maritime',
  INDUSTRIAL: 'industrial',
};

export const TRANSPORTATION_MODE_LIBRARY = [
  { id: 'e2e_passenger', label: 'E2E Starship passenger', group: MODE_LIBRARY_GROUPS.SPACE, color: '#d4af37', wired: true },
  { id: 'e2e_cargo', label: 'E2E Starship cargo', group: MODE_LIBRARY_GROUPS.SPACE, color: '#d4af37', wired: false },
  { id: 'e2m_moon', label: 'E2M Moon routes', group: MODE_LIBRARY_GROUPS.SPACE, color: '#ff6b35', wired: true },
  { id: 'e2m_mars', label: 'E2M Mars routes', group: MODE_LIBRARY_GROUPS.SPACE, color: '#ff6b35', wired: true },
  { id: 'hyperloop_trunk', label: 'Hyperloop trunk', group: MODE_LIBRARY_GROUPS.HIGH_SPEED_GROUND, color: '#00dcff', wired: true },
  { id: 'hyperloop_feeder', label: 'Hyperloop feeder', group: MODE_LIBRARY_GROUPS.HIGH_SPEED_GROUND, color: '#00dcff', wired: true },
  { id: 'regional_loop', label: 'Regional Loop', group: MODE_LIBRARY_GROUPS.HIGH_SPEED_GROUND, color: '#00dcff', wired: true },
  { id: 'rail_freight', label: 'Rail freight', group: MODE_LIBRARY_GROUPS.CONVENTIONAL_GROUND, color: '#8899aa', wired: false },
  { id: 'road_freight', label: 'Road freight', group: MODE_LIBRARY_GROUPS.CONVENTIONAL_GROUND, color: '#666677', wired: false },
  { id: 'robotaxi', label: 'Robotaxi zones', group: MODE_LIBRARY_GROUPS.LOCAL, color: '#7dff9a', wired: true },
  { id: 're2e', label: 'RE2E rare-earth corridors', group: MODE_LIBRARY_GROUPS.INDUSTRIAL, color: '#ff6b35', wired: true },
  { id: 'petabond_routes', label: 'PetaBond deployment', group: MODE_LIBRARY_GROUPS.INDUSTRIAL, color: '#50ffc8', wired: true },
];

export function getTransportationModeById(id) {
  return TRANSPORTATION_MODE_LIBRARY.find((m) => m.id === id) ?? null;
}

export const MODE_GROUP_LABELS = {
  [MODE_LIBRARY_GROUPS.SPACE]: 'Space / Rocket',
  [MODE_LIBRARY_GROUPS.HIGH_SPEED_GROUND]: 'High-Speed Ground',
  [MODE_LIBRARY_GROUPS.CONVENTIONAL_GROUND]: 'Conventional Ground',
  [MODE_LIBRARY_GROUPS.LOCAL]: 'Local Mobility',
  [MODE_LIBRARY_GROUPS.MARITIME]: 'Maritime / Port',
  [MODE_LIBRARY_GROUPS.INDUSTRIAL]: 'Industrial / Resource',
};
