/**
 * Collect normalized AutonomousHub inputs from existing PMOS datasets.
 */

import { listStarbaseHubs } from '../starbaseHubs.js';
import { getRobotaxiEligibilityReasons } from './autonomousEligibility.js';

/** Earth starbase seed IDs → country (until starbaseHubs.json includes country). */
const STARBASE_EARTH_COUNTRY = {
  'starbase-texas': 'United States',
  'cape-canaveral': 'United States',
  vandenberg: 'United States',
  'dubai-spaceport-concept': 'United Arab Emirates',
};

/**
 * @param {object} raw
 * @param {string} source
 */
export function normalizeAutonomousHubInput(raw, source) {
  const lat = raw?.lat ?? raw?.latitude;
  const lng = raw?.lng ?? raw?.longitude ?? raw?.lon;
  const coords = raw?.coordinates;
  const resolvedLat = lat ?? coords?.[1];
  const resolvedLng = lng ?? coords?.[0];

  const hub = {
    id: raw?.canonicalId ?? raw?.id ?? raw?.networkCityId ?? `hub:${raw?.name}`,
    name: raw?.name ?? 'Unknown hub',
    lat: resolvedLat,
    lng: resolvedLng,
    country: raw?.country ?? '',
    region: raw?.region ?? raw?.country ?? '',
    hubTypes: raw?.hubTypes ?? [],
    modes: raw?.modes ?? [],
    tier: raw?.tier ?? raw?.starbaseClass ?? 'regional',
    tags: raw?.tags ?? [],
    source,
    canonicalId: raw?.canonicalId ?? raw?.id,
    metadata: raw?.metadata ?? {},
    isE2EHub: raw?.isE2EHub,
    isStarbaseHub: raw?.isStarbaseHub,
    starbaseClass: raw?.starbaseClass,
    hubRoles: raw?.hubRoles,
    population: raw?.population,
    hyperloop_connected: raw?.hyperloop_connected,
    isSwitchNode: raw?.isSwitchNode,
    isIntermodalGateway: raw?.isIntermodalGateway,
    e2m_enabled: raw?.e2m_enabled,
    mineral_hub_id: raw?.mineral_hub_id,
    planet: raw?.planet,
  };

  hub.eligibilityReasons = getRobotaxiEligibilityReasons(hub);
  return hub;
}

/**
 * @param {{
 *   e2eHubs?: object[],
 *   trunkStations?: object[],
 *   integratedNodes?: object[],
 *   e2mNodes?: object[],
 *   starbaseHubs?: object[],
 * }} sources
 */
export function collectAutonomousHubs(sources = {}) {
  const hubs = [];
  const starbases = sources.starbaseHubs ?? listStarbaseHubs();

  for (const h of sources.e2eHubs ?? []) {
    hubs.push(normalizeAutonomousHubInput(h, 'e2e'));
  }

  for (const h of sources.trunkStations ?? []) {
    hubs.push(normalizeAutonomousHubInput(h, 'hyperloop_trunk'));
  }

  for (const h of starbases) {
    if (!h?.coordinates?.length) continue;
    if (h.planet && h.planet !== 'Earth' && h.planet !== 'EARTH') continue;
    const country =
      String(h.country ?? '').trim() || STARBASE_EARTH_COUNTRY[h.id] || '';
    if (country.length < 2) continue;
    hubs.push(
      normalizeAutonomousHubInput(
        {
          id: `starbase:${h.id}`,
          name: h.name,
          coordinates: h.coordinates,
          country,
          region: h.planet,
          isStarbaseHub: true,
          starbaseClass: h.starbaseClass,
          hubRoles: h.hubRoles,
          hubTypes: ['starbase_hub'],
          modes: ['e2e_starship', 'e2m', 'hyperloop'],
          tags: ['starbase', ...(h.tags ?? [])],
          planet: h.planet ?? 'Earth',
        },
        'starbase'
      )
    );
  }

  for (const n of sources.integratedNodes ?? []) {
    if (!n?.lat && n?.latitude == null) continue;
    hubs.push(normalizeAutonomousHubInput(n, 'integrated_graph'));
  }

  for (const n of sources.e2mNodes ?? []) {
    hubs.push(
      normalizeAutonomousHubInput(
        {
          ...n,
          hubTypes: ['e2m_hub', 'resource_node'],
          modes: ['e2m', ...(n.modes ?? [])],
        },
        'e2m'
      )
    );
  }

  return hubs;
}
