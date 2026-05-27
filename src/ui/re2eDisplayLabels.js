/**
 * User-facing labels for cargo / rare-earth corridors vs legacy internal `e2m` mode.
 * Internal graph mode remains `e2m` for compatibility.
 */

import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';

/** RE2E = Rare Earth-to-Earth (resource return / export corridors on Earth). */
export const RE2E_DISPLAY_NAME = 'RE2E';
export const RE2E_DISPLAY_LONG = 'RE2E — Rare Earth-to-Earth';

/** E2M = Earth-to-Moon/Mars transport (orbital cargo leg — not the same as RE2E). */
export const E2M_ORBITAL_DISPLAY_NAME = 'E2M';
export const E2M_ORBITAL_DISPLAY_LONG = 'E2M — Earth-to-Moon / Mars';

/**
 * @param {string} [internalMode] — graph mode id (e2m, e2m_orbital, cargo, …)
 * @param {{ short?: boolean }} [opts]
 */
export function getCargoCorridorDisplayLabel(internalMode, opts = {}) {
  const m = String(internalMode ?? '').toLowerCase();
  if (m === 'e2m' || m === 'e2m_orbital' || m === TRANSPORT_MODES.E2M_ORBITAL) {
    return opts.short ? RE2E_DISPLAY_NAME : RE2E_DISPLAY_LONG;
  }
  if (m === 'cargo' || m === 'logistics' || m === 're2e') {
    return opts.short ? RE2E_DISPLAY_NAME : RE2E_DISPLAY_LONG;
  }
  return opts.short ? 'Cargo' : 'Cargo corridors';
}

/**
 * @param {string} [internalMode]
 * @param {{ short?: boolean }} [opts]
 */
export function getOrbitalLegDisplayLabel(internalMode, opts = {}) {
  const m = String(internalMode ?? '').toLowerCase();
  if (m === 'e2m_orbital' || m === TRANSPORT_MODES.E2M_ORBITAL) {
    return opts.short ? E2M_ORBITAL_DISPLAY_NAME : E2M_ORBITAL_DISPLAY_LONG;
  }
  return opts.short ? E2M_ORBITAL_DISPLAY_NAME : E2M_ORBITAL_DISPLAY_LONG;
}

/**
 * Unified mode chip / legend label.
 * @param {string} mode — integrated graph mode (e2e, e2m, hyperloop, …)
 */
export function formatModeLabelForUI(mode) {
  const m = String(mode ?? '').toLowerCase();
  if (m === 'e2e' || m === 'e2e_starship') return 'E2E Starship';
  if (m === 'e2m') return RE2E_DISPLAY_NAME;
  if (m === 'hyperloop' || m === 'hyperloop_spine') return 'Hyperloop';
  if (m === 'loop' || m === 'regional_loop') return 'Loop';
  if (m === 'auto' || m === 'robotaxi') return 'Robotaxi';
  if (!m) return '—';
  return m.charAt(0).toUpperCase() + m.slice(1);
}
