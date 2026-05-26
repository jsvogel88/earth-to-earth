/**
 * Planetary Mobility OS — transport mode UI registry.
 * Drives mode identity, command bar, dock, legends, and contextual chrome.
 * Map/layer behavior remains in layerRegistry.js + transportOperatingSystem.js.
 */

import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { getTransportModeLayers } from '../layers/layerRegistry.js';

/** @typedef {'e2e'|'hyperloop'|'robotaxi'|'civilization'|'e2m'} ModeThemeId */

/**
 * @typedef {Object} TransportModeUIConfig
 * @property {string} registryId
 * @property {string} mode — TRANSPORT_MODES value
 * @property {string} displayName
 * @property {string} shortLabel
 * @property {string} icon
 * @property {string} tagline
 * @property {ModeThemeId} themeId
 * @property {{ accent: string, accentSoft: string, glow: string, gradient: string }} palette
 * @property {string[]} legendChips
 * @property {string[]} metricOverlayIds — future metric overlay keys
 * @property {string[]} dockSections — mission dock sections emphasized for this mode
 */

/** @type {Record<string, TransportModeUIConfig>} */
export const TRANSPORT_MODE_UI_REGISTRY = {
  [TRANSPORT_MODES.E2E_STARSHIP]: {
    registryId: 'mode_e2e_starship',
    mode: TRANSPORT_MODES.E2E_STARSHIP,
    displayName: 'E2E Starship',
    shortLabel: 'E2E',
    icon: '◆',
    tagline: 'Orbital intercontinental mobility — premium arcs & catchment',
    themeId: 'e2e',
    palette: {
      accent: '#d4af37',
      accentSoft: 'rgba(212, 175, 55, 0.22)',
      glow: 'rgba(212, 175, 55, 0.45)',
      gradient: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(100,200,255,0.08))',
    },
    legendChips: ['Gold hub', 'Starship arc', 'Catchment ring', 'Regional feeder'],
    metricOverlayIds: ['cargo_demand', 'airport_traffic'],
    dockSections: ['planner', 'destinations', 'routes'],
  },
  [TRANSPORT_MODES.HYPERLOOP_CORE]: {
    registryId: 'mode_hyperloop_core',
    mode: TRANSPORT_MODES.HYPERLOOP_CORE,
    displayName: 'Hyperloop',
    shortLabel: 'Loop',
    icon: '⬡',
    tagline: 'Dense regional corridors — planetary trunk infrastructure',
    themeId: 'hyperloop',
    palette: {
      accent: '#00dcff',
      accentSoft: 'rgba(0, 220, 255, 0.18)',
      glow: 'rgba(0, 220, 255, 0.4)',
      gradient: 'linear-gradient(135deg, rgba(0,220,255,0.12), rgba(80,120,255,0.06))',
    },
    legendChips: ['Trunk', 'Gateway', 'Through route', 'Corridor flow'],
    metricOverlayIds: ['gdp_density', 'logistics_density', 'manufacturing_hubs'],
    dockSections: ['layers', 'routes', 'simulations'],
  },
  [TRANSPORT_MODES.ROBOTAXI]: {
    registryId: 'mode_robotaxi',
    mode: TRANSPORT_MODES.ROBOTAXI,
    displayName: 'Robotaxi',
    shortLabel: 'Auto',
    icon: '◎',
    tagline: 'Urban swarm mobility — hub zones & last-mile circulation',
    themeId: 'robotaxi',
    palette: {
      accent: '#7dff9a',
      accentSoft: 'rgba(125, 255, 154, 0.18)',
      glow: 'rgba(125, 255, 154, 0.35)',
      gradient: 'linear-gradient(135deg, rgba(125,255,154,0.1), rgba(100,200,255,0.05))',
    },
    legendChips: ['Service zone', 'Pickup point', 'Hub dot'],
    metricOverlayIds: ['population_density', 'ai_clusters'],
    dockSections: ['layers', 'planner'],
  },
  [TRANSPORT_MODES.CIVILIZATION_GRID]: {
    registryId: 'mode_civilization_grid',
    mode: TRANSPORT_MODES.CIVILIZATION_GRID,
    displayName: 'Integrated Grid',
    shortLabel: 'Grid',
    icon: '▣',
    tagline: 'One connected global civilization grid — E2E, E2M, Hyperloop, Loop, and Auto',
    themeId: 'civilization',
    palette: {
      accent: '#c084fc',
      accentSoft: 'rgba(192, 132, 252, 0.2)',
      glow: 'rgba(192, 132, 252, 0.4)',
      gradient: 'linear-gradient(135deg, rgba(192,132,252,0.14), rgba(255,100,180,0.06))',
    },
    legendChips: ['GDP heat', 'Trade corridor', 'Planning overlay', 'Strategic node'],
    metricOverlayIds: ['gdp_density', 'financial_centers', 'sovereign_trade'],
    dockSections: ['layers', 'simulations', 'planner'],
  },
  [TRANSPORT_MODES.E2M_ORBITAL]: {
    registryId: 'mode_e2m_orbital',
    mode: TRANSPORT_MODES.E2M_ORBITAL,
    displayName: 'E2M Orbital',
    shortLabel: 'E2M',
    icon: '◉',
    tagline: 'Orbital logistics — refueling, launch, Mars-window staging',
    themeId: 'e2m',
    palette: {
      accent: '#ffb84d',
      accentSoft: 'rgba(255, 184, 77, 0.2)',
      glow: 'rgba(255, 184, 77, 0.38)',
      gradient: 'linear-gradient(135deg, rgba(255,184,77,0.12), rgba(100,200,255,0.06))',
    },
    legendChips: ['Launch zone', 'Orbital path', 'Refuel node'],
    metricOverlayIds: ['energy_infrastructure'],
    dockSections: ['layers', 'simulations'],
  },
};

export function getTransportModeUI(mode) {
  const normalized = mode || TRANSPORT_MODES.E2E_STARSHIP;
  return (
    TRANSPORT_MODE_UI_REGISTRY[normalized] ??
    TRANSPORT_MODE_UI_REGISTRY[TRANSPORT_MODES.E2E_STARSHIP]
  );
}

/** Ordered mode list aligned with layer registry transport_mode entries */
export function getTransportModeUIList() {
  const registryModes = getTransportModeLayers();
  return registryModes
    .map((layer) => getTransportModeUI(layer.transportMode))
    .filter(Boolean);
}

export function getModeThemeClass(themeId) {
  return `pmos-theme-${themeId || 'e2e'}`;
}

/** Future metric overlays — configuration only */
export const METRIC_OVERLAY_REGISTRY = [
  { id: 'gdp_density', label: 'GDP density', icon: '₿', defaultVisible: false },
  { id: 'population_density', label: 'Population', icon: '◫', defaultVisible: false },
  { id: 'cargo_demand', label: 'Cargo demand', icon: '▤', defaultVisible: false },
  { id: 'financial_centers', label: 'Financial hubs', icon: '◇', defaultVisible: false },
  { id: 'ai_clusters', label: 'AI clusters', icon: '◈', defaultVisible: false },
  { id: 'manufacturing_hubs', label: 'Manufacturing', icon: '⚙', defaultVisible: false },
  { id: 'logistics_density', label: 'Logistics', icon: '↯', defaultVisible: false },
  { id: 'airport_traffic', label: 'Air traffic', icon: '✈', defaultVisible: false },
  { id: 'sovereign_trade', label: 'Trade corridors', icon: '⇄', defaultVisible: false },
  { id: 'energy_infrastructure', label: 'Energy grid', icon: '⚡', defaultVisible: false },
];

export const MISSION_DOCK_SECTIONS = [
  { id: 'layers', label: 'Layers', icon: '◫' },
  { id: 'planner', label: 'Planner', icon: '◎' },
  { id: 'routes', label: 'Routes', icon: '↝' },
  { id: 'destinations', label: 'Destinations', icon: '⊕' },
  { id: 'simulations', label: 'Simulate', icon: '◷' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];
