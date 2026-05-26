import { describe, it, expect } from 'vitest';
import {
  NODE_CATEGORIES,
  isActiveE2EHubCity,
  applyClassificationToNode,
  listCityIdsByCategory,
} from '../data/nodeClassification.js';
import { CURATED_NETWORK_CITIES } from '../data/worldCities.js';
import { createCustomDestinationFromCity } from '../data/userCustomDestinations.js';
import { CONNECTION_MODES } from '../data/customDestinationConstants.js';
import { buildPlanetaryHyperloopGraph } from '../graph/buildPlanetaryHyperloopGraph.js';
import { buildRobotaxiServiceZones } from '../data/robotaxiLayer.js';
import { getMapRoiHubs } from '../data/worldCities.js';

describe('node classification', () => {
  it('E2E hubs are classified separately from rare-earth / cargo overlays', () => {
    const e2eIds = listCityIdsByCategory(NODE_CATEGORIES.ACTIVE_E2E_HUB);
    const rareIds = listCityIdsByCategory(NODE_CATEGORIES.RARE_EARTH_HUB);
    expect(e2eIds.length).toBeGreaterThan(0);
    expect(rareIds.length).toBeGreaterThan(0);
    const overlap = e2eIds.filter((id) => rareIds.includes(id));
    expect(overlap).toEqual([]);
  });

  it('curated network cities are active E2E hubs', () => {
    CURATED_NETWORK_CITIES.slice(0, 5).forEach((city) => {
      expect(isActiveE2EHubCity(city.id)).toBe(true);
    });
  });

  it('applyClassificationToNode flags E2E vs planning futures', () => {
    const e2eNode = applyClassificationToNode({
      id: CURATED_NETWORK_CITIES[0].id,
      networkCityId: CURATED_NETWORK_CITIES[0].id,
      name: CURATED_NETWORK_CITIES[0].name,
      country: CURATED_NETWORK_CITIES[0].country,
    });
    expect(e2eNode.isActiveE2EHub).toBe(true);
    expect(e2eNode.nodeCategory).toBe(NODE_CATEGORIES.ACTIVE_E2E_HUB);

    const futureNode = applyClassificationToNode({
      id: 'net:planning-only|xx',
      name: 'Planning Only',
      country: 'XX',
      futureOnly: true,
      planningOverlay: true,
    });
    expect(futureNode.isActiveE2EHub).not.toBe(true);
  });

  it('robotaxi zones are local mobility geometry, not intercity graph nodes', () => {
    const hubs = getMapRoiHubs().slice(0, 3);
    const zones = buildRobotaxiServiceZones({ activeE2EHubs: hubs });
    expect(zones.length).toBeGreaterThan(0);
    const graph = buildPlanetaryHyperloopGraph({ activeE2EHubs: hubs });
    graph.edges.forEach((edge) => {
      const isRobotaxiEdge =
        edge.edgeType?.includes('ROBOTAXI') || edge.edgeCategory?.includes('ROBOTAXI');
      expect(isRobotaxiEdge).toBe(false);
    });
  });

  it('custom destinations are planning-only and not auto-promoted to graph hubs', () => {
    const custom = createCustomDestinationFromCity({
      name: 'Testville',
      country: 'ZZ',
      latitude: 10,
      longitude: 20,
      population: 1000,
    });
    expect(custom.userAdded).toBe(true);
    expect(custom.connectionMode).toBe(CONNECTION_MODES.NONE);
    const graph = buildPlanetaryHyperloopGraph({
      activeE2EHubs: getMapRoiHubs().slice(0, 2),
    });
    const customGraphNode = graph.nodes.find((n) => n.id === custom.id);
    expect(customGraphNode).toBeUndefined();
  });
});
