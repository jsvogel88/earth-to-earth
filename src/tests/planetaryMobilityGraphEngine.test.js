import { describe, it, expect } from 'vitest';
import {
  buildPlanetaryMobilityGraph,
  mergeGraphBackbone,
} from '../graph/planetaryMobilityGraphEngine.js';
import { normalizeGraphEdge, starbaseHubToOverlayNode } from '../graph/normalizeGraphMember.js';
import { GRAPH_MEMBERSHIP } from '../graph/graphMembership.js';
import { classifyRouteFamily, ROUTE_FAMILIES } from '../graph/classifyRouteFamily.js';
import { buildRouteDisplayPipeline } from '../graph/buildRouteDisplayPipeline.js';

describe('planetaryMobilityGraphEngine', () => {
  it('builds canonical backbone with normalized render intent', () => {
    const graph = buildPlanetaryMobilityGraph();
    expect(graph.backbone.nodes.length).toBeGreaterThan(0);
    expect(graph.backbone.edges.length).toBeGreaterThan(0);
    const e2e = graph.backbone.edges.find((e) => e.mode === 'e2e_starship' || e.taxonomyMode === 'e2e_starship');
    expect(e2e?.geometryType).toBe('arc');
    expect(e2e?.renderAsArc).toBe(true);
    expect(graph.diagnostics.geometryViolations.e2eGround).toBe(0);
    expect(graph.layers?.length).toBeGreaterThan(0);
    expect(graph.diagnostics.graphValidation).toBeDefined();
  });

  it('keeps starbase hubs as overlay members (not official)', () => {
    const graph = buildPlanetaryMobilityGraph({ includeStarbaseOverlays: true });
    expect(graph.overlays.length).toBeGreaterThan(0);
    const starbase = graph.overlays.find((n) => n.id?.includes('starbase-texas'));
    expect(starbase?.graphMembership).toBe(GRAPH_MEMBERSHIP.OVERLAY);
    expect(starbase?.cityStatus).toBe('planning_node');
    expect(starbase?.nodeTypes).toContain('strategic_node');
  });

  it('starbase overlay helper never assigns official membership', () => {
    const node = starbaseHubToOverlayNode({
      id: 'test-hub',
      name: 'Test Hub',
      coordinates: [-97.4, 25.9],
      status: 'ACTIVE',
      hubRoles: ['E2E', 'RE2E'],
      starbaseClass: 'PRIME',
    });
    expect(node.graphMembership).toBe(GRAPH_MEMBERSHIP.OVERLAY);
  });

  it('classifies multimodal connectors', () => {
    expect(
      classifyRouteFamily({ mode: 'port', routeType: 'port_connector' })
    ).toBe(ROUTE_FAMILIES.MULTIMODAL_GROUND);
    expect(classifyRouteFamily({ mode: 'energy', routeType: 'energy_corridor' })).toBe(
      ROUTE_FAMILIES.ENERGY_GRID
    );
  });

  it('mergeGraphBackbone preserves legacy E2M edges', () => {
    const canonical = {
      nodes: [{ id: 'a', name: 'A', latitude: 0, longitude: 0 }],
      edges: [{ id: 'e1', fromNodeId: 'a', toNodeId: 'b', mode: 'e2e' }],
    };
    const legacy = {
      nodes: [{ id: 'm1', name: 'Mine', latitude: 1, longitude: 1, e2m_enabled: true }],
      edges: [
        {
          id: 'e2m-1',
          fromNodeId: 'm1',
          toNodeId: 'a',
          mode: 'e2m',
          route_type: 'resource_corridor',
        },
      ],
    };
    const merged = mergeGraphBackbone(canonical, legacy);
    expect(merged.edges.some((e) => e.mode === 'e2m')).toBe(true);
  });

  it('normalizeGraphEdge assigns arc geometry for E2E', () => {
    const edge = normalizeGraphEdge({
      id: 'test-e2e',
      mode: 'e2e_starship',
      routeType: 'global_arc',
      fromNodeId: 'a',
      toNodeId: 'b',
      distanceKm: 5000,
    });
    expect(edge.geometryType).toBe('arc');
    expect(edge.visual?.colorKey).toBe('e2e_blue');
  });

  it('route display pipeline consumes normalized engine edges', () => {
    const pipeline = buildRouteDisplayPipeline({
      viewMode: 'CIVILIZATION_GRID',
      zoom: 4,
    });
    expect(pipeline.stats.totalEdgesConsidered).toBeGreaterThan(0);
    expect(pipeline.arcs.length + pipeline.trunkPaths.length).toBeGreaterThan(0);
  });
});
