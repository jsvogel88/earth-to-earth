import { describe, it, expect } from 'vitest';
import {
  getModeColor,
  getRouteVisualStyle,
  resolveEdgeGeometryType,
} from '../transportation/render/visualSemantics.js';
import { TRANSPORTATION_MODES } from '../transportation/registries/index.js';
import { normalizeRenderIntent } from '../transportation/render/renderIntent.js';

describe('visualSemantics', () => {
  it('returns blue for E2E and orange for E2M', () => {
    expect(getModeColor(TRANSPORTATION_MODES.E2E_STARSHIP)).toEqual([212, 175, 55]);
    expect(getModeColor(TRANSPORTATION_MODES.E2M)).toEqual([255, 107, 53]);
  });

  it('assigns arc geometry for E2E and long-range E2M', () => {
    expect(resolveEdgeGeometryType({ mode: 'e2e_starship' })).toBe('arc');
    expect(
      resolveEdgeGeometryType({ mode: 'e2m', routeType: 'resource_corridor', distanceKm: 4000 })
    ).toBe('arc');
  });

  it('assigns ground geometry for local E2M connectors', () => {
    expect(
      resolveEdgeGeometryType({
        mode: 'e2m',
        routeType: 'local_port_connector',
        distanceKm: 40,
      })
    ).toBe('ground');
  });

  it('normalizeRenderIntent respects local E2M ground routes', () => {
    const intent = normalizeRenderIntent({
      mode: 'e2m',
      routeType: 'terminal_ground_connector',
      distanceKm: 25,
    });
    expect(intent.geometryType).toBe('ground');
    expect(intent.renderAsArc).toBe(false);
  });

  it('getRouteVisualStyle includes rgba from colorKey', () => {
    const style = getRouteVisualStyle({ mode: 'e2e_starship', routeType: 'global_arc' });
    expect(style.rgba[3]).toBeGreaterThan(0);
    expect(style.visual.colorKey).toBe('e2e_blue');
  });
});
