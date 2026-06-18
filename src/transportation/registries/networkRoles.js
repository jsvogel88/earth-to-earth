/**
 * Starbase / civilization hub network roles (Planetary Mobility OS).
 * Re-exported from starbase seed data — single import path for UI and graph code.
 */

export { NETWORK_ROLES } from '../../data/starbaseHubs.js';

/** Roles that imply long-range arc rendering when routes are wired. */
export const ARC_NETWORK_ROLES = Object.freeze([
  'E2E',
  'RE2E',
  'E2O',
  'E2F',
  'E2A',
  'E2L',
  'E2MARS',
]);

/** Future / deployment roles (toggle-first, not full simulation yet). */
export const FUTURE_NETWORK_ROLES = Object.freeze([
  'PETABOND_EXPORT',
  'MARS_HYPERLOOP',
]);
