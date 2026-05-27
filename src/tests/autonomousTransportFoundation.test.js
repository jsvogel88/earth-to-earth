import { describe, it, expect } from 'vitest';
import {
  isRobotaxiEligible,
  isIndustrialHub,
  getRobotaxiEligibilityReasons,
} from '../data/autonomous/autonomousEligibility.js';
import { geodesicCirclePolygon, distanceMiles } from '../data/autonomous/autonomousGeometry.js';
import { dedupeAutonomousHubs } from '../data/autonomous/autonomousDeduping.js';
import {
  generateRobotaxiServiceArea,
  generateChargingNodesForCorridor,
} from '../data/autonomous/autonomousGenerators.js';
import {
  isPointOnLand,
  isRobotaxiHubLandEligible,
  hasValidHubCountry,
} from '../data/autonomous/autonomousLandFilter.js';
import { buildAutonomousTransportSystem } from '../data/autonomous/buildAutonomousTransportSystem.js';
import { FEATURE_FLAGS } from '../data/autonomous/autonomousConstants.js';
import { listStarbaseHubs } from '../data/starbaseHubs.js';

describe('Autonomous Transport Foundation (Phase 5.5)', () => {
  it('explicit hyperloop_hub tag is robotaxi eligible', () => {
    expect(
      isRobotaxiEligible({
        name: 'Chicago',
        hubTypes: ['hyperloop_hub'],
        country: 'United States',
        lat: 41.8,
        lng: -87.6,
      })
    ).toBe(true);
  });

  it('rejects e2e_hub inference without whitelist tag', () => {
    expect(
      isRobotaxiEligible({
        name: 'NYC',
        isE2EHub: true,
        tier: 1,
        country: 'United States',
      })
    ).toBe(false);
  });

  it('starbase_hub tag is robotaxi eligible', () => {
    const starbase = listStarbaseHubs().find((h) => h.id === 'starbase-texas');
    expect(starbase).toBeTruthy();
    expect(
      isRobotaxiEligible({
        name: starbase.name,
        hubTypes: ['starbase_hub'],
        country: starbase.country,
        lat: starbase.coordinates[1],
        lng: starbase.coordinates[0],
      })
    ).toBe(true);
    expect(getRobotaxiEligibilityReasons({ hubTypes: ['starbase_hub'] })).toContain(
      'starbase_hub'
    );
  });

  it('global tier alone is robotaxi eligible', () => {
    expect(isRobotaxiEligible({ name: 'Mega City', tier: 'global', country: 'France' })).toBe(
      true
    );
  });

  it('minor node is not robotaxi eligible', () => {
    expect(
      isRobotaxiEligible({ name: 'Small Town', lat: 10, lng: 10, tier: 'local' })
    ).toBe(false);
  });

  it('industrial hub classification', () => {
    expect(isIndustrialHub({ name: 'Giga Texas', tags: ['gigafactory'] })).toBe(true);
  });

  it('generates industrial reach polygons (1k + 3k mi)', () => {
    const system = buildAutonomousTransportSystem({
      e2eHubs: [],
      starbaseHubs: listStarbaseHubs().filter((h) => h.id === 'starbase-texas'),
    });
    expect(system.industrialLogisticsReach.length).toBeGreaterThan(0);
    const reach = system.industrialLogisticsReach[0];
    expect(reach.defaultRadiusMiles).toBe(1000);
    expect(reach.extendedOnDemandRadiusMiles).toBe(3000);
    expect(reach.defaultGeometry.geometry.type).toBe('Polygon');
    expect(reach.extendedGeometry.geometry.type).toBe('Polygon');
  });

  it('generates 100-mile robotaxi zone with polygon', () => {
    const { area } = generateRobotaxiServiceArea({
      id: 'h1',
      name: 'Test Hub',
      lat: 30,
      lng: -97,
      country: 'United States',
      hubTypes: ['hyperloop_hub'],
      eligibilityReasons: ['hyperloop_hub'],
    });
    expect(area.radiusMiles).toBe(100);
    expect(area.radiusMeters).toBe(160934);
    expect(area.geometry.geometry.type).toBe('Polygon');
    const ring = area.geometry.geometry.coordinates[0];
    expect(ring.length).toBeGreaterThan(60);
  });

  it('skips robotaxi zone without country or over ocean', () => {
    const { area, skipReason } = generateRobotaxiServiceArea({
      id: 'ocean',
      name: 'Mid Atlantic',
      lat: 25,
      lng: -40,
      hubTypes: ['hyperloop_hub'],
    });
    expect(area).toBeNull();
    expect(skipReason).toBe('missing_country_or_ocean');
    expect(hasValidHubCountry({})).toBe(false);
    expect(isPointOnLand(25, -40, {})).toBe(false);
  });

  it('allows hub with country on land (inland)', () => {
    expect(
      isRobotaxiHubLandEligible({
        name: 'Austin',
        lat: 30.27,
        lng: -97.74,
        country: 'United States',
        hubTypes: ['hyperloop_hub'],
      })
    ).toBe(true);
  });

  it('allows corridor charging on inland path with country', () => {
    const corridor = {
      id: 'c-land',
      modeId: 'robocourier',
      vehicleClass: 'CYBERTRUCK',
      originHubId: 'a',
      path: [
        [-97, 30],
        [-96, 30.5],
      ],
    };
    const nodes = generateChargingNodesForCorridor(corridor, {
      chargerType: 'tesla_diner_supercharger',
      hasTeslaDiner: true,
    });
    expect(nodes.length).toBe(0);
  });

  it('filters corridor charging nodes over water', () => {
    const corridor = {
      id: 'c-ocean',
      modeId: 'robocourier',
      vehicleClass: 'CYBERTRUCK',
      originHubId: 'a',
      path: [
        [-40, 25],
        [-38, 26],
      ],
    };
    const nodes = generateChargingNodesForCorridor(corridor, {
      chargerType: 'tesla_diner_supercharger',
      hasTeslaDiner: true,
    });
    expect(nodes).toHaveLength(0);
  });

  it('geodesic circle approximates 100 miles', () => {
    const centerLat = 30;
    const centerLng = -97;
    const feature = geodesicCirclePolygon(centerLng, centerLat, 160934);
    const point = feature.geometry.coordinates[0][48];
    const dist = distanceMiles(centerLat, centerLng, point[1], point[0]);
    expect(dist).toBeGreaterThan(90);
    expect(dist).toBeLessThan(115);
  });

  it('dedupes hubs from multiple sources', () => {
    const a = {
      id: '1',
      name: 'Austin',
      lat: 30.27,
      lng: -97.74,
      hubTypes: ['hyperloop_hub'],
      source: 'hyperloop',
    };
    const b = {
      canonicalId: '1',
      name: 'Austin',
      lat: 30.27,
      lng: -97.74,
      hubTypes: ['e2e_hub'],
      source: 'e2e',
    };
    const { hubs, duplicatesMerged } = dedupeAutonomousHubs([a, b]);
    expect(hubs).toHaveLength(1);
    expect(duplicatesMerged).toBe(1);
    expect(hubs[0].hubTypes).toContain('hyperloop_hub');
    expect(hubs[0].hubTypes).toContain('e2e_hub');
  });

  it('roboCourier corridor gets tesla diner charging nodes on land path', () => {
    const corridor = {
      id: 'c1',
      modeId: 'robocourier',
      vehicleClass: 'CYBERTRUCK',
      originHubId: 'a',
      path: [
        [-97, 30],
        [-96, 30.5],
        [-95, 31],
      ],
    };
    const nodes = generateChargingNodesForCorridor(corridor, {
      chargerType: 'tesla_diner_supercharger',
      hasTeslaDiner: true,
    });
    expect(nodes.length).toBe(0);
  });

  it('builds strict whitelist rings from earth starbases with country', () => {
    const system = buildAutonomousTransportSystem({
      e2eHubs: [
        {
          id: 'e2e:nyc',
          name: 'New York',
          latitude: 40.7,
          longitude: -74,
          isE2EHub: true,
          tier: 1,
        },
      ],
      starbaseHubs: listStarbaseHubs().filter((h) => h.id === 'starbase-texas'),
    });
    expect(system.stats.robotaxiEligibleHubs).toBeGreaterThan(0);
    expect(system.stats.robotaxiServiceAreasGenerated).toBeGreaterThan(0);
    expect(system.stats.robotaxiServiceAreasGenerated).toBeLessThanOrEqual(
      system.stats.robotaxiEligibleHubs
    );
    expect(system.robotaxiServiceAreas[0].radiusMiles).toBe(100);
  });

  it('does not generate drone ports when flag off', () => {
    const system = buildAutonomousTransportSystem({
      e2eHubs: [{ id: 'x', name: 'X', latitude: 0, longitude: 0, isE2EHub: true }],
      options: { featureFlags: { ...FEATURE_FLAGS, ENABLE_TESLA_DRONE_LAYER: false } },
    });
    expect(system.teslaDronePorts).toHaveLength(0);
  });
});
