import { describe, it, expect } from 'vitest';
import { MODE_REGISTRY, MODE_IDS } from '../modes/modeRegistry.js';
import {
  classifyCity,
  classifyMineralHub,
  classifyLocation,
  getEnabledModes,
  isTransferHub,
  E2E_POPULATION_THRESHOLD,
} from '../modes/classifyLocation.js';
import { DEFAULT_MINERAL_HUBS } from '../data/mineralHubs.js';
import {
  findNearestNode,
  enrichMineralHub,
  enrichMineralHubs,
} from '../data/buildMineralHubConnections.js';
import { CURATED_NETWORK_CITIES } from '../data/worldCities.js';

describe('mode registry (Phase 1)', () => {
  it('includes auto, loop, e2e, e2m, hyperloop', () => {
    expect(MODE_IDS).toEqual(
      expect.arrayContaining(['auto', 'loop', 'e2e', 'e2m', 'hyperloop'])
    );
    expect(MODE_IDS.length).toBe(5);
  });

  it('each mode has required metadata fields', () => {
    for (const modeId of MODE_IDS) {
      const mode = MODE_REGISTRY[modeId];
      expect(mode.mode_id).toBe(modeId);
      expect(mode.label).toBeTruthy();
      expect(mode.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(typeof mode.defaultVisibility).toBe('boolean');
      expect(Array.isArray(mode.nodeTypes)).toBe(true);
      expect(Array.isArray(mode.routeTypes)).toBe(true);
      expect(mode.zoomVisibility).toMatchObject({
        min: expect.any(Number),
        max: expect.any(Number),
      });
      expect(['overlayOnly', 'routes', 'nodesOnly', 'none']).toContain(mode.graphBehavior);
    }
  });

  it('auto and loop are default for cities', () => {
    expect(MODE_REGISTRY.auto.defaultForCities).toBe(true);
    expect(MODE_REGISTRY.loop.defaultForCities).toBe(true);
  });
});

describe('classifyCity (Phase 1)', () => {
  it('all curated network cities have auto_enabled and loop_enabled', () => {
    CURATED_NETWORK_CITIES.forEach((city) => {
      const classified = classifyCity(city);
      expect(classified.auto_enabled).toBe(true);
      expect(classified.loop_enabled).toBe(true);
      expect(classified.enabledModes).toContain('auto');
      expect(classified.enabledModes).toContain('loop');
    });
  });

  it('city with population >= 1M becomes e2e_eligible', () => {
    const classified = classifyCity({
      name: 'New York',
      country: 'USA',
      population: E2E_POPULATION_THRESHOLD,
    });
    expect(classified.e2e_eligible).toBe(true);
    expect(classified.enabledModes).toContain('e2e');
    expect(classified.isE2EHub).toBe(true);
    expect(classified.nodeType).toBe('e2e_hub');
  });

  it('city with metro_population >= 1M becomes e2e_eligible', () => {
    const classified = classifyCity({
      name: 'Test Metro',
      country: 'XX',
      population: 500_000,
      metro_population: E2E_POPULATION_THRESHOLD,
    });
    expect(classified.e2e_eligible).toBe(true);
    expect(classified.enabledModes).toContain('e2e');
  });

  it('city below 1M is not e2e_eligible unless manually overridden', () => {
    const below = classifyCity({
      name: 'Frankfurt',
      country: 'Germany',
      population: 753_000,
    });
    expect(below.e2e_eligible).toBe(false);
    expect(below.enabledModes).not.toContain('e2e');

    const overridden = classifyCity({
      name: 'Frankfurt',
      country: 'Germany',
      population: 753_000,
      manual_override: { e2e_eligible: true },
    });
    expect(overridden.e2e_eligible).toBe(true);
    expect(overridden.enabledModes).toContain('e2e');
  });

  it('preserves existing city fields', () => {
    const city = {
      id: 'net:test:xx',
      name: 'Testville',
      country: 'XX',
      lat: 10,
      lon: 20,
      population: 2_000_000,
      region: 'Test Region',
    };
    const classified = classifyCity(city);
    expect(classified.id).toBe('net:test:xx');
    expect(classified.name).toBe('Testville');
    expect(classified.lat).toBe(10);
    expect(classified.region).toBe('Test Region');
  });

  it('isTransferHub returns true when 3+ modes enabled', () => {
    const hub = classifyCity({
      name: 'Mega City',
      country: 'XX',
      population: 2_000_000,
      hyperloop_connected: true,
    });
    expect(hub.enabledModes.length).toBeGreaterThanOrEqual(3);
    expect(isTransferHub(hub)).toBe(true);
  });
});

describe('classifyMineralHub (Phase 1)', () => {
  it('all default mineral hubs have e2m, auto, and loop enabled', () => {
    DEFAULT_MINERAL_HUBS.forEach((hub) => {
      expect(hub.e2m_enabled).toBe(true);
      expect(hub.auto_enabled).toBe(true);
      expect(hub.loop_enabled).toBe(true);
      expect(hub.feeder_required).toBe(true);
      expect(hub.enabledModes).toEqual(['auto', 'loop', 'e2m']);
    });
  });

  it('all default mineral hubs have latitude and longitude', () => {
    DEFAULT_MINERAL_HUBS.forEach((hub) => {
      expect(typeof hub.latitude).toBe('number');
      expect(typeof hub.longitude).toBe('number');
      expect(Number.isFinite(hub.latitude)).toBe(true);
      expect(Number.isFinite(hub.longitude)).toBe(true);
    });
  });

  it('classifyLocation dispatches to mineral hub classifier', () => {
    const hub = DEFAULT_MINERAL_HUBS[0];
    const classified = classifyLocation(hub);
    expect(classified.e2m_enabled).toBe(true);
    expect(classified.nodeType).toBe('mineral_hub');
  });

  it('getEnabledModes returns e2m modes for mineral hubs', () => {
    const modes = getEnabledModes(DEFAULT_MINERAL_HUBS[0]);
    expect(modes).toEqual(['auto', 'loop', 'e2m']);
  });
});

describe('buildMineralHubConnections (Phase 1)', () => {
  const cities = CURATED_NETWORK_CITIES.map((c) => ({
    ...classifyCity(c),
    city_id: c.id,
    latitude: c.lat,
    longitude: c.lon,
  }));

  const e2eHubs = cities.filter((c) => c.e2e_eligible);

  it('findNearestNode returns closest candidate', () => {
    const hub = DEFAULT_MINERAL_HUBS.find((h) => h.name === 'Mountain Pass');
    const result = findNearestNode(hub, cities);
    expect(result).not.toBeNull();
    expect(result.distance_km).toBeGreaterThan(0);
    expect(result.node.city_id).toBeTruthy();
  });

  it('enrichMineralHub assigns nearest fields when missing', () => {
    const hub = { ...DEFAULT_MINERAL_HUBS[0] };
    delete hub.nearest_support_city;
    delete hub.nearest_port;
    delete hub.nearest_e2e_hub;

    const enriched = enrichMineralHub(hub, { cities, e2eHubs });
    expect(enriched.nearest_support_city).toBeTruthy();
    expect(enriched.nearest_e2e_hub).toBeTruthy();
  });

  it('enrichMineralHub preserves manually entered nearest fields', () => {
    const hub = {
      ...DEFAULT_MINERAL_HUBS[0],
      nearest_support_city: 'net:manual:xx',
      nearest_port: 'net:manual-port:xx',
      nearest_e2e_hub: 'net:manual-e2e:xx',
    };
    const enriched = enrichMineralHub(hub, { cities, e2eHubs });
    expect(enriched.nearest_support_city).toBe('net:manual:xx');
    expect(enriched.nearest_port).toBe('net:manual-port:xx');
    expect(enriched.nearest_e2e_hub).toBe('net:manual-e2e:xx');
  });

  it('enrichMineralHubs processes all hubs', () => {
    const enriched = enrichMineralHubs(DEFAULT_MINERAL_HUBS.slice(0, 3), {
      cities,
      e2eHubs,
    });
    expect(enriched.length).toBe(3);
    enriched.forEach((hub) => {
      expect(hub.nearest_support_city).toBeTruthy();
    });
  });
});

describe('mineral hub dataset (Phase 1)', () => {
  it('contains starter hubs across all requested categories', () => {
    expect(DEFAULT_MINERAL_HUBS.length).toBeGreaterThanOrEqual(40);

    const types = new Set(DEFAULT_MINERAL_HUBS.map((h) => h.mineral_type));
    expect(types.has('Rare Earth Elements')).toBe(true);
    expect(types.has('Lithium')).toBe(true);
    expect(types.has('Copper / Cobalt')).toBe(true);
    expect(types.has('Nickel / Battery Metals')).toBe(true);
    expect(types.has('Graphite / Industrial Minerals')).toBe(true);
    expect(types.has('Strategic Industrial Minerals')).toBe(true);
  });

  it('each hub has mineral_hub_id and coordinate_confidence', () => {
    DEFAULT_MINERAL_HUBS.forEach((hub) => {
      expect(hub.mineral_hub_id).toMatch(/^e2m:/);
      expect(['approximate', 'verified']).toContain(hub.coordinate_confidence);
    });
  });
});

describe('classifyMineralHub function (Phase 1)', () => {
  it('classifies raw mineral hub seeds', () => {
    const classified = classifyMineralHub({
      mineral_hub_id: 'e2m:test:xx',
      name: 'Test Mine',
      latitude: 0,
      longitude: 0,
    });
    expect(classified.e2m_enabled).toBe(true);
    expect(classified.auto_enabled).toBe(true);
    expect(classified.loop_enabled).toBe(true);
    expect(classified.feeder_required).toBe(true);
  });
});
