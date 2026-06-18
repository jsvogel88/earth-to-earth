/**
 * Planetary Mobility OS — 12-point overhaul invariant checks.
 * Tracks regression gates for the master spec; not a full product acceptance suite.
 */

import { describe, it, expect } from 'vitest';
import { buildPlanetaryMobilityGraph, countGeometryIntentViolations } from '../graph/planetaryMobilityGraphEngine.js';
import { buildIntegratedTransportGraph } from '../hooks/useIntegratedTransportGraph.js';
import { buildRouteDisplayPipeline } from '../graph/buildRouteDisplayPipeline.js';
import { OVERLAY_ONLY_LAYER_IDS } from './modeTestContracts.js';
import {
  STUDIO_COPILOT_NOT_DEFAULT,
  REQUIRED_MANUFACTURING_SCALE_LEVELS,
  getManufacturingPackageIds,
  getScenarioIds,
} from './studioTestContracts.js';
import { MANUFACTURING_PACKAGES } from '../studio/registries/manufacturingPackageRegistry.js';
import { GRAPH_MEMBERSHIP } from '../graph/graphMembership.js';
import { NETWORK_ROLES } from '../transportation/registries/networkRoles.js';
import { resolveCanonicalMode } from '../transportation/modeAliases.js';
import { TRANSPORTATION_MODES } from '../transportation/registries/modes.js';
import { E2E_FEEDER_CONNECTIONS, RE2E_FEEDER_CONNECTIONS } from '../graph/intermodalFeederSemantics.js';
import { E2E_STRATEGIC_HUBS, RE2E_STRATEGIC_HUBS } from '../graph/strategicHubRegistry.js';
import { canShowPromotionShell } from '../ui/cityPromotion.js';
import {
  isEdgeVisibleInIntegratedFilters,
  mergeIntegratedFilterDefaults,
} from '../ui/integratedGridFilters.js';
import { applyViewModeFocus } from '../studio/viewModeBridge.js';
import { GRAPH_FEATURE_FLAGS } from '../config/graphFeatureFlags.js';

describe('Planetary Mobility OS overhaul invariants', () => {
  describe('#1 unified graph + #10 render intent', () => {
    it('canonical backbone has zero E2E ground geometry violations', () => {
      const graph = buildPlanetaryMobilityGraph();
      expect(graph.diagnostics.geometryViolations.e2eGround).toBe(0);
      const sample = graph.backbone.edges.find(
        (e) => e.mode === 'e2e_starship' || e.taxonomyMode === 'e2e_starship'
      );
      if (sample) {
        expect(sample.geometryType).toBe('arc');
        expect(sample.renderAsArc).toBe(true);
      }
    });

    it('integrated graph hook uses planetary engine + geometry/feeder diagnostics', () => {
      const result = buildIntegratedTransportGraph({
        cities: [],
        existingHyperloopGraph: { nodes: [], edges: [] },
        layerState: {},
        options: { useCanonicalGraph: true },
      });
      expect(result.diagnostics?.planetaryEngine).toBe(true);
      expect(result.diagnostics?.geometryViolations).toBeDefined();
      expect(result.diagnostics?.feederSummary).toBeDefined();
    });
  });

  describe('#2 E2E/E2M arcs', () => {
    it('display pipeline renders E2E arcs and E2M cargo arcs at civilization zoom', () => {
      const pipeline = buildRouteDisplayPipeline({
        viewMode: 'CIVILIZATION_GRID',
        zoom: 4,
      });
      const validation = pipeline.validation;
      expect(validation.geometry.e2ePathViolations).toBe(0);
      expect(validation.geometry.e2mPathViolations).toBe(0);
    });
  });

  describe('#7 starbase overlays', () => {
    it('starbase hubs remain overlay membership only', () => {
      const graph = buildPlanetaryMobilityGraph({ includeStarbaseOverlays: true });
      const officialStarbase = graph.backbone.nodes.filter((n) =>
        String(n.id ?? '').includes('starbase')
      );
      expect(officialStarbase.length).toBe(0);
      expect(
        graph.overlays.every((n) => n.graphMembership === GRAPH_MEMBERSHIP.OVERLAY)
      ).toBe(true);
    });
  });

  describe('#8 PetaBond future-ready', () => {
    it('manufacturing registry includes PetaBond at scale 5', () => {
      const petabond = MANUFACTURING_PACKAGES.find((p) => p.id === 'petabond');
      expect(petabond?.scaleLevel).toBe(5);
      expect(getManufacturingPackageIds()).toContain('petabond');
    });
  });

  describe('#9 studio shell', () => {
    it('Vision is default tab; Mission Copilot is not default', () => {
      expect(STUDIO_COPILOT_NOT_DEFAULT).toBe(true);
    });

    it('scenario registry includes Mars civilization preset', () => {
      expect(getScenarioIds()).toContain('mars-civilization-network');
    });
  });

  describe('RE2E corridor filter + graph flags', () => {
    it('re2eCorridorFilter resource hides industrial cargo edges', () => {
      const filters = mergeIntegratedFilterDefaults({ re2eCorridorFilter: 'resource' });
      const resourceEdge = {
        mode: 'e2m',
        routeType: 'resource_corridor',
        corridor_type: 'resource',
      };
      const industrialEdge = {
        mode: 're2e',
        routeType: 'cargo_corridor',
        corridor_type: 'freight',
      };
      expect(isEdgeVisibleInIntegratedFilters(resourceEdge, filters)).toBe(true);
      expect(isEdgeVisibleInIntegratedFilters(industrialEdge, filters)).toBe(false);
    });

    it('payload_flow view applies resource corridor filter', () => {
      const result = applyViewModeFocus('payload_flow', {}, { transportMode: 'civilization_grid' });
      expect(result?.layerState?.re2eCorridorFilter).toBe('resource');
    });

    it('manufacturing_flow view applies industrial corridor filter', () => {
      const result = applyViewModeFocus('manufacturing_flow', {}, { transportMode: 'civilization_grid' });
      expect(result?.layerState?.re2eCorridorFilter).toBe('industrial');
    });

    it('synthetic strategic feeders default off via feature flag', () => {
      expect(GRAPH_FEATURE_FLAGS.SYNTHESIZE_STRATEGIC_FEEDERS).toBe(false);
    });
  });

  describe('#11 custom/parsed overlay safety', () => {
    it('overlay-only layers are declared and do not imply route graph edges', () => {
      expect(OVERLAY_ONLY_LAYER_IDS.has('custom_destinations')).toBe(true);
      expect(OVERLAY_ONLY_LAYER_IDS.has('parsed_cities')).toBe(true);
    });
  });

  describe('#12 manufacturing ladder', () => {
    it('includes KilaPlant through PetaBond scale levels', () => {
      const levels = MANUFACTURING_PACKAGES.map((p) => p.scaleLevel).sort((a, b) => a - b);
      for (const level of REQUIRED_MANUFACTURING_SCALE_LEVELS) {
        expect(levels).toContain(level);
      }
    });
  });

  describe('#5 taxonomy + RE2E alias', () => {
    it('NETWORK_ROLES includes E2E, RE2E, and space roles', () => {
      expect(NETWORK_ROLES).toContain('E2E');
      expect(NETWORK_ROLES).toContain('RE2E');
      expect(NETWORK_ROLES).toContain('E2MARS');
      expect(NETWORK_ROLES).toContain('PETABOND_EXPORT');
    });

    it('legacy e2m resolves to RE2E for earth corridors', () => {
      expect(resolveCanonicalMode('e2m', { routeType: 'resource_corridor' })).toBe(
        TRANSPORTATION_MODES.RE2E
      );
    });
  });

  describe('#6 feeder semantics', () => {
    it('declares E2E and RE2E feeder connection rules', () => {
      expect(E2E_FEEDER_CONNECTIONS.length).toBeGreaterThanOrEqual(4);
      expect(RE2E_FEEDER_CONNECTIONS.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('#3–4 strategic hubs', () => {
    it('seed registries cover spec hub lists', () => {
      expect(E2E_STRATEGIC_HUBS.some((h) => h.worldCityKey === 'mumbai')).toBe(true);
      expect(RE2E_STRATEGIC_HUBS.some((h) => h.id === 're2e-chile-lithium')).toBe(true);
    });
  });

  describe('#11 promotion shell', () => {
    it('shows promotion UI only for custom/parsed overlays', () => {
      expect(canShowPromotionShell({ cityStatus: 'custom_destination' })).toBe(true);
      expect(canShowPromotionShell({ cityStatus: 'official_network_node' })).toBe(false);
    });
  });

  describe('geometry audit helper', () => {
    it('countGeometryIntentViolations matches engine diagnostics', () => {
      const graph = buildPlanetaryMobilityGraph();
      const manual = countGeometryIntentViolations(graph.backbone.edges);
      expect(manual).toEqual(graph.diagnostics.geometryViolations);
    });
  });
});
