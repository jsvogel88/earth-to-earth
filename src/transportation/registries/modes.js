/**
 * Canonical taxonomy: transportation modes.
 * Keep values stable; use adapters for legacy aliases.
 */
export const TRANSPORTATION_MODES = {
  E2E_STARSHIP: 'e2e_starship',
  E2E_FEEDER: 'e2e_feeder',
  E2M: 'e2m',
  CARGO: 'cargo',
  LOGISTICS: 'logistics',

  HYPERLOOP_SPINE: 'hyperloop_spine',
  REGIONAL_LOOP: 'regional_loop',
  FEEDER_ROUTE: 'feeder_route',

  ROBOTAXI: 'robotaxi',
  AUTONOMOUS_AUTO: 'autonomous_auto',

  PORT: 'port',
  AIR: 'air',
  RAIL: 'rail',
  ROAD: 'road',
  ENERGY: 'energy',

  GRID: 'grid',
  PLANNING: 'planning',
  CUSTOM: 'custom',
  PARSED: 'parsed',
  DEBUG: 'debug',
};

export const TRANSPORTATION_MODE_IDS = new Set(Object.values(TRANSPORTATION_MODES));

export function isTransportationMode(value) {
  return TRANSPORTATION_MODE_IDS.has(value);
}

