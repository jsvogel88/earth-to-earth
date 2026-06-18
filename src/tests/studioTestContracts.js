/**
 * Planetary Logistics Studio UI contracts — structural surfaces that must exist in Phase 1+.
 * Complements modeTestContracts.js (map layer registry), not a replacement.
 */

import { STUDIO_TAB_LIST, DEFAULT_STUDIO_TAB, STUDIO_TABS } from '../studio/registries/studioTabs.js';
import { MANUFACTURING_PACKAGES } from '../studio/registries/manufacturingPackageRegistry.js';
import { SCENARIOS } from '../studio/registries/scenarioRegistry.js';

export const STUDIO_SURFACE_CONTRACTS = [
  { id: 'top_mission_bar', testId: 'studio-top-mission-bar', requiresScreenshot: false },
  { id: 'logistics_sidebar', testId: 'logistics-studio-sidebar', requiresScreenshot: false },
  { id: 'vision_panel', testId: 'studio-vision-panel', requiresScreenshot: true },
  { id: 'intelligent_legend', testId: 'intelligent-legend-shell', requiresScreenshot: true },
  { id: 'bottom_intelligence_bar', testId: 'bottom-intelligence-bar', requiresScreenshot: false },
];

/** Manufacturing ladder scale levels 1–5 must be present. */
export const REQUIRED_MANUFACTURING_SCALE_LEVELS = [1, 2, 3, 4, 5];

export const STUDIO_DEFAULT_TAB = DEFAULT_STUDIO_TAB;

export const STUDIO_TAB_IDS = STUDIO_TAB_LIST.map((t) => t.id);

export function getManufacturingPackageIds() {
  return MANUFACTURING_PACKAGES.map((p) => p.id);
}

export function getScenarioIds() {
  return SCENARIOS.map((s) => s.id);
}

export const STUDIO_COPILOT_NOT_DEFAULT =
  STUDIO_TABS.COPILOT !== DEFAULT_STUDIO_TAB && STUDIO_TABS.VISION === DEFAULT_STUDIO_TAB;
