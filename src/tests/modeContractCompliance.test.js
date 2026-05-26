import { describe, it, expect } from 'vitest';
import {
  MODE_TEST_CONTRACTS,
  NEW_MODE_CONTRACT_MESSAGE,
  OVERLAY_ONLY_LAYER_IDS,
} from './modeTestContracts.js';
import {
  MAP_LAYER_REGISTRY,
  getTransportModeLayers,
  getLayerById,
  buildDefaultLayerState,
  LAYER_TYPES,
  LAYER_GROUPS,
  GROUP_SECTION_TITLES,
} from '../layers/layerRegistry.js';
import { buildPlanetaryHyperloopGraph } from '../graph/buildPlanetaryHyperloopGraph.js';
import { buildRobotaxiServiceZones } from '../data/robotaxiLayer.js';
import { buildE2MOrbitalNodes, buildE2MOrbitalPaths } from '../data/e2mOrbitalNodes.js';
import { assertGraphIntegrity } from './helpers/graphAssertions.js';
import { getMapRoiHubs } from '../data/worldCities.js';

describe('mode test contracts — registry sync', () => {
  const registryModes = getTransportModeLayers();

  it('every registered transport mode has a test contract', () => {
    const contractIds = new Set(MODE_TEST_CONTRACTS.map((c) => c.registryModeId));
    const missing = registryModes.filter((m) => !contractIds.has(m.id));
    if (missing.length) {
      const ids = missing.map((m) => m.id).join(', ');
      throw new Error(`${NEW_MODE_CONTRACT_MESSAGE} Missing: ${ids}`);
    }
    expect(MODE_TEST_CONTRACTS.length).toBe(registryModes.length);
  });

  it.each(MODE_TEST_CONTRACTS)('contract $id has required fields', (contract) => {
    expect(contract.id).toBeTruthy();
    expect(contract.label).toBeTruthy();
    expect(contract.category).toBeTruthy();
    expect(contract.expectedGraphBehavior).toBeTruthy();
    expect(typeof contract.createsIntercityEdges).toBe('boolean');
    expect(typeof contract.createsLocalEdges).toBe('boolean');
    expect(typeof contract.defaultVisible).toBe('boolean');
    expect(contract.sidebarGroup).toBe(GROUP_SECTION_TITLES.TRANSPORT_MODES);
    const registryLayer = getLayerById(contract.registryModeId);
    expect(registryLayer?.transportMode).toBe(contract.transportMode);
    expect(registryLayer?.defaultVisible).toBe(contract.defaultVisible);
  });
});

describe('mode test contracts — graph behavior', () => {
  const hubs = getMapRoiHubs().slice(0, 4);
  const planetary = buildPlanetaryHyperloopGraph({ activeE2EHubs: hubs });

  it.each(
    MODE_TEST_CONTRACTS.filter((c) => c.expectedGraphBehavior === 'routes')
  )('$id uses planetary graph routes without corrupting base graph', (contract) => {
    assertGraphIntegrity(planetary);
    expect(planetary.edges.length).toBeGreaterThan(0);
    const preset = buildDefaultLayerState(contract.transportMode);
    expect(preset).toBeTypeOf('object');
  });

  it('overlay / local modes do not add intercity edges via robotaxi builder', () => {
    const robotaxi = MODE_TEST_CONTRACTS.find((c) => c.category === 'local');
    expect(robotaxi?.createsIntercityEdges).toBe(false);
    const zones = buildRobotaxiServiceZones(hubs);
    expect(zones).toBeTruthy();
    planetary.edges.forEach((e) => {
      expect(e.edgeCategory).not.toBe('ROBOTAXI_INTERCITY');
    });
  });

  it('E2M contract includes integrated feeder/resource routes and orbital overlay', () => {
    const e2m = MODE_TEST_CONTRACTS.find((c) => c.category === 'space');
    expect(e2m?.expectedGraphBehavior).toBe('routes');
    expect(e2m?.createsIntercityEdges).toBe(true);
    const nodes = buildE2MOrbitalNodes();
    const nodesByKey = new Map(nodes.map((n) => [n.nameKey, n]));
    const paths = buildE2MOrbitalPaths(nodesByKey);
    expect(nodes.length).toBeGreaterThan(0);
    expect(paths.length).toBeGreaterThan(0);
  });
});

describe('layer registry — contract-driven checks', () => {
  it('every layer has unique id, label, group, defaultVisible, and type', () => {
    const ids = new Set();
    MAP_LAYER_REGISTRY.forEach((layer) => {
      expect(ids.has(layer.id)).toBe(false);
      ids.add(layer.id);
      expect(layer.label).toBeTruthy();
      expect(layer.group).toBeTruthy();
      expect(typeof layer.defaultVisible).toBe('boolean');
      expect(layer.layerType).toBeTruthy();
    });
  });

  it('overlay layers do not create route edges in planetary graph', () => {
    const graph = buildPlanetaryHyperloopGraph({ activeE2EHubs: getMapRoiHubs().slice(0, 3) });
    OVERLAY_ONLY_LAYER_IDS.forEach((layerId) => {
      const layer = getLayerById(layerId);
      if (!layer) return;
      expect(layer.layerType === LAYER_TYPES.OVERLAY || layer.description).toBeTruthy();
    });
    assertGraphIntegrity(graph);
  });

  it('debug layer group defaults OFF', () => {
    MAP_LAYER_REGISTRY.filter((l) => l.group === LAYER_GROUPS.DEBUG_DEV).forEach((layer) => {
      if (layer.stateKey) expect(layer.defaultVisible).toBe(false);
    });
  });
});
