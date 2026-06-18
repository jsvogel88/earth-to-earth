import { describe, it, expect } from 'vitest';
import {
  isFeederRouteType,
  isFeederEdge,
  summarizeFeederEdges,
  FEEDER_LAYER_IDS,
} from '../graph/feederRouteSemantics.js';
import { classifyRouteFamily, ROUTE_FAMILIES } from '../graph/classifyRouteFamily.js';
import { ROUTE_TYPES } from '../transportation/registries/routeTypes.js';
import { MAP_LAYER_REGISTRY } from '../layers/layerRegistry.js';

describe('feederRouteSemantics', () => {
  it('recognizes canonical feeder route types', () => {
    expect(isFeederRouteType(ROUTE_TYPES.FEEDER_ROUTE)).toBe(true);
    expect(isFeederRouteType('regional_feeder')).toBe(true);
    expect(isFeederRouteType(ROUTE_TYPES.CONTINENTAL_SPINE)).toBe(false);
  });

  it('classifies hyperloop feeders into FEEDER_BRANCH family', () => {
    expect(
      classifyRouteFamily({ mode: 'hyperloop', routeType: ROUTE_TYPES.FEEDER_ROUTE })
    ).toBe(ROUTE_FAMILIES.FEEDER_BRANCH);
    expect(isFeederEdge({ mode: 'hyperloop', routeType: 'feeder' })).toBe(true);
  });

  it('summarizes feeder-like edges in a graph slice', () => {
    const summary = summarizeFeederEdges([
      { routeType: ROUTE_TYPES.FEEDER_ROUTE },
      { routeType: ROUTE_TYPES.REGIONAL_LOOP },
      { routeType: ROUTE_TYPES.LOCAL_CONNECTOR },
    ]);
    expect(summary.feederBranch).toBe(1);
    expect(summary.regionalLoop).toBe(1);
    expect(summary.multimodalFeeder).toBe(1);
    expect(summary.totalFeederLike).toBe(3);
  });

  it('feeder layer ids exist in layer registry', () => {
    const registryIds = new Set(MAP_LAYER_REGISTRY.map((l) => l.id));
    for (const id of FEEDER_LAYER_IDS) {
      if (id.startsWith('e2e-')) continue;
      expect(registryIds.has(id), `missing layer ${id}`).toBe(true);
    }
  });
});
