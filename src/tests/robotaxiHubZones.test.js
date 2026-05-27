import { describe, it, expect } from 'vitest';
import { buildRobotaxiServiceZones } from '../data/robotaxiLayer.js';
import { buildE2MOrbitalNodes } from '../data/e2mOrbitalNodes.js';
import {
  isHubMobilityOverlayActive,
  getRobotaxiServiceZoneDeckStyle,
  isRobotaxiServiceRingLayerVisible,
  getRobotaxiServiceZoneRenderTier,
} from '../layers/robotaxiVisibility.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { INTEGRATED_VIEW_FOCUS } from '../ui/integratedGridFilters.js';

describe('robotaxi hub zones', () => {
  it('generates zones around E2E and E2M hubs', () => {
    const e2mNodes = buildE2MOrbitalNodes();
    const zones = buildRobotaxiServiceZones({
      activeE2EHubs: [
        {
          name: 'New York',
          lat: 40.71,
          lng: -74.01,
          lon: -74.01,
          population: 8_000_000,
          country: 'United States',
          hubTypes: ['hyperloop_hub'],
        },
      ],
      trunkStations: [
        {
          name: 'Chicago',
          lat: 41.88,
          lon: -87.63,
          tier: 'global',
          country: 'United States',
          hubTypes: ['hyperloop_hub'],
        },
      ],
      e2mNodes,
    });
    expect(zones.length).toBeGreaterThan(2);
    expect(zones.some((z) => z.parentHubName === 'New York')).toBe(true);
    expect(zones.some((z) => z.industrialConnector)).toBe(true);
  });

  it('robotaxi service rings are zoom-gated and stroke-only', () => {
    expect(getRobotaxiServiceZoneRenderTier(2)).toBe('hidden');
    expect(isRobotaxiServiceRingLayerVisible(2)).toBe(false);
    const low = getRobotaxiServiceZoneDeckStyle(4.5);
    expect(low.visible).toBe(true);
    expect(low.filled).toBe(false);
    expect(low.fillColor[3]).toBe(0);
    expect(low.lineColor[3]).toBe(Math.round(255 * 0.25));
    const high = getRobotaxiServiceZoneDeckStyle(7);
    expect(high.filled).toBe(false);
    expect(high.fillColor).toEqual([0, 0, 0, 0]);
    expect(high.lineColor).toEqual([100, 200, 255, 120]);
    expect(high.lineWidthMinPixels).toBe(1.5);
  });

  it('hub mobility overlay when Auto focus or Civilization Grid with layer enabled', () => {
    expect(
      isHubMobilityOverlayActive(
        { showRobotaxiLayer: true, integratedViewFocus: INTEGRATED_VIEW_FOCUS.AUTO },
        TRANSPORT_MODES.CIVILIZATION_GRID
      )
    ).toBe(true);
    expect(
      isHubMobilityOverlayActive(
        { showRobotaxiLayer: true, integratedViewFocus: INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID },
        TRANSPORT_MODES.CIVILIZATION_GRID
      )
    ).toBe(true);
    expect(
      isHubMobilityOverlayActive(
        { showRobotaxiLayer: false, integratedViewFocus: INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID },
        TRANSPORT_MODES.CIVILIZATION_GRID
      )
    ).toBe(false);
    expect(
      isHubMobilityOverlayActive(
        { showRobotaxiLayer: true, integratedViewFocus: INTEGRATED_VIEW_FOCUS.E2E },
        TRANSPORT_MODES.E2E_STARSHIP
      )
    ).toBe(false);
  });

  it('zones are planning-only geometry', () => {
    const zones = buildRobotaxiServiceZones({
      activeE2EHubs: [{ name: 'London', lat: 51.5, lon: -0.12, population: 9_000_000 }],
    });
    zones.forEach((z) => {
      expect(z.zoneFeature?.properties?.type).toBe('robotaxi_zone');
      expect(z.requiresValidation).toBe(true);
    });
  });
});
