/**
 * Merges canonical zoom-tier visibility into integrated layer filter state.
 */

import { getLayerVisibility } from './canonicalTransportAdapter.js';
import { mergeIntegratedFilterDefaults } from '../ui/integratedGridFilters.js';

const CANONICAL_TO_FILTER = {
  e2e_starship: 'showIntegratedE2E',
  hyperloop: 'showIntegratedHyperloop',
  e2m: 'showIntegratedE2M',
  regional_loop: 'showIntegratedLoop',
  robotaxi: 'showIntegratedAuto',
};

/**
 * @param {object} activeFilters
 * @param {number} zoom
 * @returns {object}
 */
export function mergeCanonicalLayerVisibility(activeFilters, zoom) {
  const merged = mergeIntegratedFilterDefaults(activeFilters);
  try {
    const vis = getLayerVisibility(zoom);
    for (const [modeId, cfg] of Object.entries(vis)) {
      const filterKey = CANONICAL_TO_FILTER[modeId];
      if (!filterKey) continue;
      if (activeFilters[filterKey] === false) continue;
      if (cfg && cfg.show === false && merged[filterKey] !== false) {
        merged[filterKey] = false;
      }
    }
  } catch (error) {
    console.warn('Canonical layer visibility merge skipped', error);
  }
  return merged;
}
