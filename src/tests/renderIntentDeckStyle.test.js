import { describe, it, expect } from 'vitest';
import { normalizeRenderIntent } from '../transportation/render/renderIntent.js';
import {
  rgbaFromRenderIntent,
  geometryTypeFromRenderIntent,
  widthFromRenderIntent,
} from '../transportation/render/renderIntentDeckStyle.js';
import { TRANSPORTATION_MODES } from '../transportation/registries/index.js';

describe('renderIntent deck style bridge', () => {
  it('falls back to default color when visual tokens missing', () => {
    const rgba = rgbaFromRenderIntent({}, 200);
    expect(rgba[3]).toBe(200);
    expect(rgba[0]).toBeGreaterThan(0);
  });

  it('uses e2e_blue from normalized intent', () => {
    const intent = normalizeRenderIntent({ taxonomyMode: TRANSPORTATION_MODES.E2E_STARSHIP });
    const rgba = rgbaFromRenderIntent(intent, 255);
    expect(intent.visual.colorKey).toBe('e2e_blue');
    expect(rgba[0]).toBe(212);
  });

  it('geometryTypeFromRenderIntent respects arc flag', () => {
    expect(geometryTypeFromRenderIntent({ geometryType: 'arc' })).toBe('arc');
    expect(geometryTypeFromRenderIntent({ geometryType: 'ground' })).toBe('ground');
    expect(geometryTypeFromRenderIntent({})).toBe(null);
  });

  it('widthFromRenderIntent scales thickness token', () => {
    expect(widthFromRenderIntent({ visual: { thickness: 'thick' } }, 2)).toBeGreaterThan(2);
    expect(widthFromRenderIntent({ visual: { thickness: 'thin' } }, 2)).toBeLessThan(2);
  });
});
