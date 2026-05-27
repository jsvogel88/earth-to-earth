import { describe, it, expect } from 'vitest';
import { normalizeRenderIntent } from '../transportation/render/renderIntent.js';
import { TRANSPORTATION_MODES, ROUTE_TYPES } from '../transportation/registries/index.js';

describe('render intent normalization', () => {
  it('E2E renders as arc with e2e_blue colorKey', () => {
    const intent = normalizeRenderIntent({ taxonomyMode: TRANSPORTATION_MODES.E2E_STARSHIP });
    expect(intent.geometryType).toBe('arc');
    expect(intent.renderAsArc).toBe(true);
    expect(intent.visual.colorKey).toBe('e2e_blue');
  });

  it('E2M renders as arc with e2m_orange colorKey', () => {
    const intent = normalizeRenderIntent({ taxonomyMode: TRANSPORTATION_MODES.E2M });
    expect(intent.geometryType).toBe('arc');
    expect(intent.visual.colorKey).toBe('e2m_orange');
  });

  it('Hyperloop spine renders as ground with hyperloop_cyan', () => {
    const intent = normalizeRenderIntent({ taxonomyMode: TRANSPORTATION_MODES.HYPERLOOP_SPINE });
    expect(intent.geometryType).toBe('ground');
    expect(intent.renderAsArc).toBe(false);
    expect(intent.visual.colorKey).toBe('hyperloop_cyan');
  });

  it('Planning edges are dashed', () => {
    const intent = normalizeRenderIntent({
      taxonomyMode: TRANSPORTATION_MODES.PLANNING,
      taxonomyRouteType: ROUTE_TYPES.PLANNING_EDGE,
    });
    expect(intent.visual.dashed).toBe(true);
  });
});

