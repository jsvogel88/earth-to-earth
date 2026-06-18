/**
 * Strategic E2E passenger + RE2E industrial hub seeds for validation and enrichment.
 * Keys use normalizeCityKey-compatible names (world city index).
 */

import { NODE_TYPES } from '../transportation/registries/nodeTypes.js';
import { CITY_STATUS } from '../transportation/registries/cityStatus.js';
import { TRANSPORTATION_MODES } from '../transportation/registries/modes.js';

/** Premium E2E passenger hubs (spec §3). */
export const E2E_STRATEGIC_HUBS = Object.freeze([
  {
    worldCityKey: 'new york',
    label: 'New York',
    modes: [
      TRANSPORTATION_MODES.E2E_STARSHIP,
      TRANSPORTATION_MODES.HYPERLOOP_SPINE,
      TRANSPORTATION_MODES.REGIONAL_LOOP,
      TRANSPORTATION_MODES.ROBOTAXI,
      TRANSPORTATION_MODES.RAIL,
      TRANSPORTATION_MODES.AIR,
      TRANSPORTATION_MODES.PORT,
    ],
    nodeTypes: [
      NODE_TYPES.GLOBAL_HUB,
      NODE_TYPES.TRANSFER_HUB,
      NODE_TYPES.E2E_HUB,
      NODE_TYPES.E2E_LAUNCH_HUB,
      NODE_TYPES.E2E_LANDING_HUB,
      NODE_TYPES.HYPERLOOP_SPINE_HUB,
      NODE_TYPES.AIRPORT_NODE,
      NODE_TYPES.RAIL_TERMINAL,
      NODE_TYPES.ROBOTAXI_ZONE,
    ],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'london',
    label: 'London',
    modes: [
      TRANSPORTATION_MODES.E2E_STARSHIP,
      TRANSPORTATION_MODES.HYPERLOOP_SPINE,
      TRANSPORTATION_MODES.ROBOTAXI,
      TRANSPORTATION_MODES.RAIL,
      TRANSPORTATION_MODES.AIR,
    ],
    nodeTypes: [
      NODE_TYPES.GLOBAL_HUB,
      NODE_TYPES.E2E_HUB,
      NODE_TYPES.E2E_LAUNCH_HUB,
      NODE_TYPES.HYPERLOOP_SPINE_HUB,
      NODE_TYPES.AIRPORT_NODE,
      NODE_TYPES.RAIL_TERMINAL,
      NODE_TYPES.ROBOTAXI_ZONE,
    ],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'dubai',
    label: 'Dubai',
    modes: [
      TRANSPORTATION_MODES.E2E_STARSHIP,
      TRANSPORTATION_MODES.HYPERLOOP_SPINE,
      TRANSPORTATION_MODES.ROBOTAXI,
      TRANSPORTATION_MODES.AIR,
      TRANSPORTATION_MODES.PORT,
    ],
    nodeTypes: [
      NODE_TYPES.GLOBAL_HUB,
      NODE_TYPES.TRANSFER_HUB,
      NODE_TYPES.E2E_HUB,
      NODE_TYPES.HYPERLOOP_SPINE_HUB,
      NODE_TYPES.AIRPORT_NODE,
      NODE_TYPES.ROBOTAXI_ZONE,
    ],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'singapore',
    label: 'Singapore',
    modes: [
      TRANSPORTATION_MODES.E2E_STARSHIP,
      TRANSPORTATION_MODES.HYPERLOOP_SPINE,
      TRANSPORTATION_MODES.ROBOTAXI,
      TRANSPORTATION_MODES.PORT,
      TRANSPORTATION_MODES.AIR,
    ],
    nodeTypes: [
      NODE_TYPES.GLOBAL_HUB,
      NODE_TYPES.E2E_HUB,
      NODE_TYPES.PORT_NODE,
      NODE_TYPES.AIRPORT_NODE,
      NODE_TYPES.ROBOTAXI_ZONE,
    ],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'tokyo',
    label: 'Tokyo',
    modes: [TRANSPORTATION_MODES.E2E_STARSHIP, TRANSPORTATION_MODES.HYPERLOOP_SPINE, TRANSPORTATION_MODES.RAIL, TRANSPORTATION_MODES.AIR],
    nodeTypes: [NODE_TYPES.GLOBAL_HUB, NODE_TYPES.E2E_HUB, NODE_TYPES.HYPERLOOP_SPINE_HUB, NODE_TYPES.RAIL_TERMINAL, NODE_TYPES.AIRPORT_NODE],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'shanghai',
    label: 'Shanghai',
    modes: [TRANSPORTATION_MODES.E2E_STARSHIP, TRANSPORTATION_MODES.HYPERLOOP_SPINE, TRANSPORTATION_MODES.PORT, TRANSPORTATION_MODES.AIR],
    nodeTypes: [NODE_TYPES.GLOBAL_HUB, NODE_TYPES.E2E_HUB, NODE_TYPES.PORT_NODE, NODE_TYPES.HYPERLOOP_SPINE_HUB],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'hong kong',
    label: 'Hong Kong',
    modes: [TRANSPORTATION_MODES.E2E_STARSHIP, TRANSPORTATION_MODES.HYPERLOOP_SPINE, TRANSPORTATION_MODES.PORT, TRANSPORTATION_MODES.AIR],
    nodeTypes: [NODE_TYPES.GLOBAL_HUB, NODE_TYPES.E2E_HUB, NODE_TYPES.PORT_NODE, NODE_TYPES.AIRPORT_NODE],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'los angeles',
    label: 'Los Angeles',
    modes: [TRANSPORTATION_MODES.E2E_STARSHIP, TRANSPORTATION_MODES.HYPERLOOP_SPINE, TRANSPORTATION_MODES.ROBOTAXI, TRANSPORTATION_MODES.AIR, TRANSPORTATION_MODES.PORT],
    nodeTypes: [NODE_TYPES.GLOBAL_HUB, NODE_TYPES.E2E_HUB, NODE_TYPES.AIRPORT_NODE, NODE_TYPES.ROBOTAXI_ZONE],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'sao paulo',
    label: 'São Paulo',
    modes: [TRANSPORTATION_MODES.E2E_STARSHIP, TRANSPORTATION_MODES.HYPERLOOP_SPINE, TRANSPORTATION_MODES.AIR],
    nodeTypes: [NODE_TYPES.GLOBAL_HUB, NODE_TYPES.E2E_HUB, NODE_TYPES.AIRPORT_NODE],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    worldCityKey: 'mumbai',
    label: 'Mumbai',
    modes: [TRANSPORTATION_MODES.E2E_STARSHIP, TRANSPORTATION_MODES.HYPERLOOP_SPINE, TRANSPORTATION_MODES.PORT, TRANSPORTATION_MODES.AIR],
    nodeTypes: [NODE_TYPES.GLOBAL_HUB, NODE_TYPES.E2E_HUB, NODE_TYPES.PORT_NODE, NODE_TYPES.AIRPORT_NODE],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
]);

/** RE2E / industrial resource hubs (spec §4). */
export const RE2E_STRATEGIC_HUBS = Object.freeze([
  {
    id: 're2e-pilbara',
    label: 'Pilbara',
    modes: [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.LOGISTICS, TRANSPORTATION_MODES.RAIL, TRANSPORTATION_MODES.PORT, TRANSPORTATION_MODES.ENERGY],
    nodeTypes: [NODE_TYPES.E2M_HUB, NODE_TYPES.RESOURCE_NODE, NODE_TYPES.MINERAL_NODE, NODE_TYPES.PORT_NODE, NODE_TYPES.RAIL_TERMINAL, NODE_TYPES.STRATEGIC_NODE],
    cityStatus: CITY_STATUS.OFFICIAL,
  },
  {
    id: 're2e-congo-copper',
    label: 'Congo Copper Belt',
    modes: [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.RAIL],
    nodeTypes: [NODE_TYPES.E2M_HUB, NODE_TYPES.MINERAL_NODE, NODE_TYPES.RESOURCE_NODE, NODE_TYPES.REMOTE_HUB],
    cityStatus: CITY_STATUS.PLANNING,
  },
  {
    id: 're2e-norilsk',
    label: 'Norilsk',
    modes: [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.ENERGY],
    nodeTypes: [NODE_TYPES.E2M_HUB, NODE_TYPES.MINERAL_NODE, NODE_TYPES.ENERGY_NODE, NODE_TYPES.REMOTE_HUB],
    cityStatus: CITY_STATUS.PLANNING,
  },
  {
    id: 're2e-mongolia-rare-earth',
    label: 'Mongolia Rare Earth Belt',
    modes: [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.RAIL],
    nodeTypes: [NODE_TYPES.E2M_HUB, NODE_TYPES.MINERAL_NODE, NODE_TYPES.RESOURCE_NODE],
    cityStatus: CITY_STATUS.PLANNING,
  },
  {
    id: 're2e-saudi-industrial',
    label: 'Saudi Industrial Corridor',
    modes: [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.PORT, TRANSPORTATION_MODES.ENERGY],
    nodeTypes: [NODE_TYPES.E2M_HUB, NODE_TYPES.INDUSTRIAL_NODE, NODE_TYPES.PORT_NODE, NODE_TYPES.ENERGY_NODE],
    cityStatus: CITY_STATUS.PLANNING,
  },
  {
    id: 're2e-texas-energy',
    label: 'Texas Energy Corridor',
    modes: [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.ENERGY, TRANSPORTATION_MODES.RAIL],
    nodeTypes: [NODE_TYPES.E2M_HUB, NODE_TYPES.ENERGY_NODE, NODE_TYPES.INDUSTRIAL_NODE, NODE_TYPES.RAIL_TERMINAL],
    cityStatus: CITY_STATUS.PLANNING,
  },
  {
    id: 're2e-chile-lithium',
    label: 'Chile Lithium Corridor',
    modes: [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.PORT],
    nodeTypes: [NODE_TYPES.E2M_HUB, NODE_TYPES.MINERAL_NODE, NODE_TYPES.PORT_NODE],
    cityStatus: CITY_STATUS.PLANNING,
  },
  {
    id: 're2e-indonesia-nickel',
    label: 'Indonesia Nickel Belt',
    modes: [TRANSPORTATION_MODES.RE2E, TRANSPORTATION_MODES.CARGO, TRANSPORTATION_MODES.PORT],
    nodeTypes: [NODE_TYPES.E2M_HUB, NODE_TYPES.MINERAL_NODE, NODE_TYPES.PORT_NODE],
    cityStatus: CITY_STATUS.PLANNING,
  },
]);

export function getE2eStrategicHubByKey(worldCityKey) {
  const key = String(worldCityKey ?? '').toLowerCase().trim();
  return E2E_STRATEGIC_HUBS.find((h) => h.worldCityKey === key) ?? null;
}

export function getRe2eStrategicHubById(id) {
  return RE2E_STRATEGIC_HUBS.find((h) => h.id === id) ?? null;
}

/**
 * Match strategic metadata onto canonical transport nodes by city key/name.
 * This is enrichment-only (never creates edges).
 * @param {{ id?: string, name?: string }} node
 * @returns {{ family: 'e2e' | 're2e', profile: object } | null}
 */
export function findStrategicHubForNode(node) {
  const nameKey = String(node?.name ?? '').toLowerCase().trim();
  const e2e = E2E_STRATEGIC_HUBS.find(
    (h) => h.worldCityKey === nameKey || h.label.toLowerCase() === nameKey
  );
  if (e2e) return { family: 'e2e', profile: e2e };

  const re2e = RE2E_STRATEGIC_HUBS.find(
    (h) =>
      h.label.toLowerCase() === nameKey ||
      String(node?.id ?? '').toLowerCase().includes(h.label.toLowerCase().split(' ')[0])
  );
  if (re2e) return { family: 're2e', profile: re2e };

  return null;
}
