import { describe, it, expect } from 'vitest';
import {
  applyLayerViewPreset,
  LAYER_VIEW_PRESET_IDS,
} from '../ui/layerViewPresets.js';

describe('layerViewPresets', () => {
  it('passenger preset emphasizes E2E', () => {
    const applied = applyLayerViewPreset(LAYER_VIEW_PRESET_IDS.PASSENGER, {});
    expect(applied?.layerState.showIntegratedE2E).toBe(true);
    expect(applied?.layerState.showIntegratedE2M).toBe(false);
  });

  it('cargo preset enables mineral and starbase layers', () => {
    const applied = applyLayerViewPreset(LAYER_VIEW_PRESET_IDS.CARGO_INDUSTRIAL, {});
    expect(applied?.layerState.showIntegratedMineralHubs).toBe(true);
    expect(applied?.layerState.showStarbaseHubs).toBe(true);
  });

  it('full civilization preset matches integrated grid', () => {
    const applied = applyLayerViewPreset(LAYER_VIEW_PRESET_IDS.FULL_CIVILIZATION, {});
    expect(applied?.layerState.integratedViewFocus).toBe('integrated_grid');
  });
});
