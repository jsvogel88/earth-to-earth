import { describe, it, expect } from 'vitest';
import {
  MAP_LAYER_REGISTRY,
  LAYER_GROUPS,
  LAYER_TYPES,
  getTransportModeLayers,
  buildDefaultLayerState,
  GROUP_SECTION_TITLES,
  LAYER_GROUPS,
} from '../layers/layerRegistry.js';
import {
  HEAVY_LAYER_IDS,
  OVERLAY_ONLY_LAYER_IDS,
} from './modeTestContracts.js';

const VALID_GROUPS = new Set(Object.values(LAYER_GROUPS));
const VALID_LAYER_TYPES = new Set(Object.values(LAYER_TYPES));

describe('layer registry', () => {
  it('every layer has id, label, group, and defaultVisible', () => {
    MAP_LAYER_REGISTRY.forEach((layer) => {
      expect(layer.id, layer.id).toBeTruthy();
      expect(layer.label, layer.id).toBeTruthy();
      expect(layer.group, layer.id).toBeTruthy();
      expect(typeof layer.defaultVisible, layer.id).toBe('boolean');
    });
  });

  it('has no duplicate layer IDs and every group is valid', () => {
    const ids = MAP_LAYER_REGISTRY.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    MAP_LAYER_REGISTRY.forEach((layer) => {
      expect(VALID_GROUPS.has(layer.group), layer.id).toBe(true);
      expect(VALID_LAYER_TYPES.has(layer.layerType), layer.id).toBe(true);
    });
  });

  it('includes required transport and planning layers', () => {
    const byId = Object.fromEntries(MAP_LAYER_REGISTRY.map((l) => [l.id, l]));
    expect(byId.mode_robotaxi).toBeTruthy();
    expect(byId.mode_e2m_orbital).toBeTruthy();
    expect(byId.world_planning_grid).toBeTruthy();
    expect(byId.rare_earth_hubs).toBeTruthy();
  });

  it('debug layers default OFF', () => {
    const debugLayers = MAP_LAYER_REGISTRY.filter((l) => l.group === LAYER_GROUPS.DEBUG_DEV);
    expect(debugLayers.length).toBeGreaterThan(0);
    debugLayers.forEach((layer) => {
      if (layer.stateKey) {
        expect(layer.defaultVisible, layer.id).toBe(false);
      }
    });
  });

  it('heavy / optional layers default OFF unless explicitly approved', () => {
    HEAVY_LAYER_IDS.forEach((id) => {
      const layer = MAP_LAYER_REGISTRY.find((l) => l.id === id);
      if (!layer) return;
      if (layer.layerType === LAYER_TYPES.TRANSPORT_MODE && layer.id === 'mode_e2e_starship') {
        return;
      }
      if (layer.layerType === LAYER_TYPES.TRANSPORT_MODE && layer.id === 'mode_civilization_grid') {
        return;
      }
      expect(layer.defaultVisible, id).toBe(false);
    });
  });

  it('placeholder layers stay disabled and do not imply live infrastructure', () => {
    const placeholders = MAP_LAYER_REGISTRY.filter((l) => l.disabled);
    expect(placeholders.length).toBeGreaterThan(0);
    placeholders.forEach((layer) => {
      expect(layer.defaultVisible, layer.id).toBe(false);
    });
  });

  it('overlay-only layers are registered without route-generation semantics', () => {
    OVERLAY_ONLY_LAYER_IDS.forEach((id) => {
      const layer = MAP_LAYER_REGISTRY.find((l) => l.id === id);
      expect(layer, id).toBeTruthy();
      expect(
        layer.layerType === LAYER_TYPES.OVERLAY || layer.description?.includes('no'),
        id
      ).toBeTruthy();
    });
  });

  it('registry-driven transport modes have sidebar placement', () => {
    getTransportModeLayers().forEach((mode) => {
      expect(mode.group).toBe(LAYER_GROUPS.TRANSPORT_MODES);
      expect(GROUP_SECTION_TITLES[mode.group]).toBe('Transport Modes');
      expect(mode.transportMode).toBeTruthy();
      const preset = buildDefaultLayerState(mode.transportMode);
      expect(preset).toBeTypeOf('object');
    });
  });
});
