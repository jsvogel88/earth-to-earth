import { describe, it, expect } from 'vitest';
import { GLOBAL_CONNECTIVITY_CORRIDORS, getValidatedGlobalCorridors } from '../data/globalConnectivityCorridors.js';
import { validateCorridorRecord, isPlanningCorridorRecord } from '../data/corridorPlanningSchema.js';
import { buildGlobalConnectivityPaths } from '../layers/planningOverlayLayers.js';
import { buildPlanetaryHyperloopGraph } from '../graph/index.js';

describe('global connectivity corridors', () => {
  it('all manual corridors validate as planning-only', () => {
    GLOBAL_CONNECTIVITY_CORRIDORS.forEach((c) => {
      const result = validateCorridorRecord(c);
      expect(result.valid, result.errors.join('; ')).toBe(true);
      expect(isPlanningCorridorRecord(c)).toBe(true);
    });
  });

  it('builds path segments without graph edges', () => {
    const graph = buildPlanetaryHyperloopGraph({ activeE2EHubs: [] });
    const before = graph.edges.length;
    const paths = buildGlobalConnectivityPaths(graph.nodes, getValidatedGlobalCorridors());
    expect(graph.edges.length).toBe(before);
    paths.forEach((p) => {
      expect(p.previewOnly).toBe(true);
      expect(p.planningOverlay).toBe(true);
      expect(p.path.length).toBe(2);
    });
  });

  it('includes major macro corridors', () => {
    const ids = GLOBAL_CONNECTIVITY_CORRIDORS.map((c) => c.id);
    expect(ids).toContain('gcc-horn-africa-eurasia');
    expect(ids).toContain('gcc-australia-far-east');
    expect(ids).toContain('gcc-la-south-america');
  });
});
