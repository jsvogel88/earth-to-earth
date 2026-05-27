/**
 * Planetary logistics realms — Earth map + off-world roster metadata.
 */

import { STARBASE_PLANETS, listStarbaseHubs } from '../../data/starbaseHubs.js';

export const STUDIO_PLANETS = {
  EARTH: 'earth',
  MOON: 'moon',
  MARS: 'mars',
};

export const PLANET_OPTIONS = [
  {
    id: STUDIO_PLANETS.EARTH,
    label: 'Earth',
    description: 'Integrated Civilization Grid — E2E, RE2E, Hyperloop, Starbase (Earth nodes).',
    starbasePlanet: STARBASE_PLANETS.EARTH,
  },
  {
    id: STUDIO_PLANETS.MOON,
    label: 'Moon',
    description: 'Lunar staging and E2M corridors — off-world hubs in registry (2D map shows Earth export).',
    starbasePlanet: STARBASE_PLANETS.MOON,
  },
  {
    id: STUDIO_PLANETS.MARS,
    label: 'Mars',
    description: 'Mars civilization logistics — settlement and industrial nodes (registry preview).',
    starbasePlanet: STARBASE_PLANETS.MARS,
  },
];

export function getPlanetOptionById(id) {
  return PLANET_OPTIONS.find((p) => p.id === id) ?? null;
}

/**
 * @param {string} planetId — studio planet id
 */
export function listOffWorldHubsForPlanet(planetId) {
  const option = getPlanetOptionById(planetId);
  if (!option || planetId === STUDIO_PLANETS.EARTH) return [];
  return listStarbaseHubs().filter((h) => h.planet === option.starbasePlanet);
}

export function countHubsByStudioPlanet() {
  const counts = { earth: 0, moon: 0, mars: 0 };
  for (const hub of listStarbaseHubs()) {
    if (hub.earthRenderable) counts.earth += 1;
    if (hub.lunar) counts.moon += 1;
    if (hub.mars) counts.mars += 1;
  }
  return counts;
}
