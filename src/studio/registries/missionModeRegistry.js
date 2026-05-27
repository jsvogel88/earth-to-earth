/** Mission mode presets (UI state; full map wiring later). */

export const MISSION_MODES = [
  { id: 'current_default', label: 'Current Default Network' },
  { id: 'earth_passenger', label: 'Earth Passenger Network' },
  { id: 'earth_cargo', label: 'Earth Cargo Network' },
  { id: 'moon_logistics', label: 'Moon Logistics Network' },
  { id: 'mars_civilization', label: 'Mars Civilization Network' },
  { id: 're2e_network', label: 'Rare Earth / RE2E Network' },
  { id: 'petabond_export', label: 'PetaBond Export Package' },
  { id: 'custom', label: 'Custom Scenario' },
];

export const DEFAULT_MISSION_MODE = 'current_default';
