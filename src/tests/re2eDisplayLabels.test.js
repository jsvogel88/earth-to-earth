import { describe, it, expect } from 'vitest';
import {
  formatModeLabelForUI,
  getCargoCorridorDisplayLabel,
  RE2E_DISPLAY_NAME,
} from '../ui/re2eDisplayLabels.js';

describe('RE2E display label helper', () => {
  it('maps internal e2m mode to RE2E for user-facing cargo label', () => {
    expect(getCargoCorridorDisplayLabel('e2m', { short: true })).toBe(RE2E_DISPLAY_NAME);
    expect(formatModeLabelForUI('e2m')).toBe(RE2E_DISPLAY_NAME);
  });

  it('keeps E2E and Hyperloop labels distinct', () => {
    expect(formatModeLabelForUI('e2e')).toContain('E2E');
    expect(formatModeLabelForUI('hyperloop')).toBe('Hyperloop');
  });
});
