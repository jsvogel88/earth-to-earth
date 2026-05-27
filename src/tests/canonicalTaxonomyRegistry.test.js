import { describe, it, expect } from 'vitest';
import {
  TRANSPORTATION_MODES,
  NODE_TYPES,
  ROUTE_TYPES,
  CITY_STATUS,
  isTransportationMode,
  isNodeType,
  isRouteType,
  isCityStatus,
} from '../transportation/registries/index.js';

describe('canonical taxonomy registries', () => {
  it('registries contain expected core values', () => {
    expect(TRANSPORTATION_MODES.E2E_STARSHIP).toBe('e2e_starship');
    expect(TRANSPORTATION_MODES.E2M).toBe('e2m');
    expect(TRANSPORTATION_MODES.HYPERLOOP_SPINE).toBe('hyperloop_spine');
    expect(NODE_TYPES.E2E_HUB).toBe('e2e_hub');
    expect(ROUTE_TYPES.GLOBAL_ARC).toBe('global_arc');
    expect(CITY_STATUS.OFFICIAL).toBe('official_network_node');
  });

  it('type guards accept canonical IDs', () => {
    expect(isTransportationMode('e2e_starship')).toBe(true);
    expect(isNodeType('port_node')).toBe(true);
    expect(isRouteType('resource_corridor')).toBe(true);
    expect(isCityStatus('parsed_city')).toBe(true);
  });

  it('type guards reject unknown strings', () => {
    expect(isTransportationMode('E2E Starship')).toBe(false);
    expect(isNodeType('airport')).toBe(false);
    expect(isRouteType('continental_trunk')).toBe(false);
    expect(isCityStatus('official')).toBe(false);
  });
});

