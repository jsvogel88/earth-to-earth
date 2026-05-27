import { describe, it, expect } from 'vitest';
import {
  applyStarbaseVisionPreview,
  isStarbaseVisionPreviewActive,
} from '../layers/starbaseLayerPresets.js';

describe('starbase vision preview preset', () => {
  it('activates all starbase layer flags together', () => {
    const next = applyStarbaseVisionPreview({}, true);
    expect(isStarbaseVisionPreviewActive(next)).toBe(true);
    expect(next.showStarbaseHubs).toBe(true);
    expect(next.showStarbaseConnectivity).toBe(true);
  });

  it('deactivates without affecting unrelated flags', () => {
    const next = applyStarbaseVisionPreview({ showRobotaxiLayer: true }, false);
    expect(isStarbaseVisionPreviewActive(next)).toBe(false);
    expect(next.showRobotaxiLayer).toBe(true);
  });
});
