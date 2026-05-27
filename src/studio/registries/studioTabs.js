/** Sidebar tabs for Planetary Logistics Studio (Phase 1). */

export const STUDIO_TABS = {
  VISION: 'vision',
  MODES: 'modes',
  HUBS: 'hubs',
  PAYLOADS: 'payloads',
  MANUFACTURING: 'manufacturing',
  LAYERS: 'layers',
  SCENARIOS: 'scenarios',
  COPILOT: 'copilot',
  VERSIONS: 'versions',
  PLANET: 'planet',
  TIMELINE: 'timeline',
};

export const DEFAULT_STUDIO_TAB = STUDIO_TABS.VISION;

export const STUDIO_TAB_LIST = [
  { id: STUDIO_TABS.VISION, label: 'Vision', icon: '◎' },
  { id: STUDIO_TABS.MODES, label: 'Modes', icon: '⇄' },
  { id: STUDIO_TABS.HUBS, label: 'Hubs', icon: '◉' },
  { id: STUDIO_TABS.PAYLOADS, label: 'Payloads', icon: '▣' },
  { id: STUDIO_TABS.MANUFACTURING, label: 'Mfg', icon: '⚙' },
  { id: STUDIO_TABS.LAYERS, label: 'Layers', icon: '☰' },
  { id: STUDIO_TABS.SCENARIOS, label: 'Scenarios', icon: '◫' },
  { id: STUDIO_TABS.COPILOT, label: 'Copilot', icon: '✦' },
  { id: STUDIO_TABS.VERSIONS, label: 'Versions', icon: '⧉' },
  { id: STUDIO_TABS.PLANET, label: 'Planet', icon: '🌐' },
  { id: STUDIO_TABS.TIMELINE, label: 'Timeline', icon: '⏱' },
];
