/**
 * E2M / orbital refueling + Mars logistics nodes — industrial layer (no passenger mesh).
 */

import { networkCityId } from './worldCities.js';
import { normalizeCityKey } from './hyperloopPhase1Cities.js';

export const E2M_NODE_TYPES = {
  ORBITAL_REFUELING: 'ORBITAL_REFUELING_HUB',
  LAUNCH_ZONE: 'INDUSTRIAL_LAUNCH_ZONE',
  CARGO_PORT: 'SPACE_CARGO_PORT',
  MARS_STAGING: 'MARS_WINDOW_STAGING',
  ORBITAL_GATEWAY: 'ORBITAL_LOGISTICS_GATEWAY',
};

/** @type {Array<{ name: string, country: string, lat: number, lon: number, nodeType: string, corridor: string, marsWindow?: boolean }>} */
export const E2M_ORBITAL_SEEDS = [
  {
    name: 'Cape Canaveral',
    country: 'USA',
    lat: 28.3922,
    lon: -80.6077,
    nodeType: E2M_NODE_TYPES.LAUNCH_ZONE,
    corridor: 'Atlantic launch / LEO staging',
  },
  {
    name: 'Houston',
    country: 'USA',
    lat: 29.7604,
    lon: -95.3698,
    nodeType: E2M_NODE_TYPES.ORBITAL_GATEWAY,
    corridor: 'Gulf orbital logistics',
  },
  {
    name: 'Baikonur',
    country: 'Kazakhstan',
    lat: 45.9647,
    lon: 63.305,
    nodeType: E2M_NODE_TYPES.LAUNCH_ZONE,
    corridor: 'Central Asia launch corridor',
  },
  {
    name: 'Kourou',
    country: 'French Guiana',
    lat: 5.236,
    lon: -52.768,
    nodeType: E2M_NODE_TYPES.LAUNCH_ZONE,
    corridor: 'Equatorial heavy lift',
  },
  {
    name: 'Tanegashima',
    country: 'Japan',
    lat: 30.4,
    lon: 130.97,
    nodeType: E2M_NODE_TYPES.LAUNCH_ZONE,
    corridor: 'Pacific orbital insertion',
  },
  {
    name: 'Wenchang',
    country: 'China',
    lat: 19.614,
    lon: 110.951,
    nodeType: E2M_NODE_TYPES.CARGO_PORT,
    corridor: 'South China Sea cargo launch',
  },
  {
    name: 'Dubai',
    country: 'UAE',
    lat: 25.2048,
    lon: 55.2708,
    nodeType: E2M_NODE_TYPES.ORBITAL_REFUELING,
    corridor: 'Gulf orbital refueling',
  },
  {
    name: 'Perth',
    country: 'Australia',
    lat: -31.9505,
    lon: 115.8605,
    nodeType: E2M_NODE_TYPES.ORBITAL_GATEWAY,
    corridor: 'Indian Ocean tracking / staging',
  },
  {
    name: 'Nuuk',
    country: 'Greenland',
    lat: 64.1814,
    lon: -51.6941,
    nodeType: E2M_NODE_TYPES.ORBITAL_REFUELING,
    corridor: 'Polar orbital refueling',
  },
  {
    name: 'McMurdo Station',
    country: 'Antarctica',
    lat: -77.8419,
    lon: 166.6863,
    nodeType: E2M_NODE_TYPES.MARS_STAGING,
    corridor: 'Deep-space window staging (south)',
    marsWindow: true,
  },
  {
    name: 'San Pedro de Atacama',
    country: 'Chile',
    lat: -22.9083,
    lon: -68.1997,
    nodeType: E2M_NODE_TYPES.MARS_STAGING,
    corridor: 'Mars-window southern hemisphere',
    marsWindow: true,
  },
  {
    name: 'Vandenberg',
    country: 'USA',
    lat: 34.742,
    lon: -120.5724,
    nodeType: E2M_NODE_TYPES.LAUNCH_ZONE,
    corridor: 'Pacific west-coast launch',
  },
  {
    name: 'Sriharikota',
    country: 'India',
    lat: 13.72,
    lon: 80.23,
    nodeType: E2M_NODE_TYPES.LAUNCH_ZONE,
    corridor: 'Bay of Bengal equatorial launch',
  },
  {
    name: 'Mahé',
    country: 'Seychelles',
    lat: -4.6191,
    lon: 55.4513,
    nodeType: E2M_NODE_TYPES.ORBITAL_REFUELING,
    corridor: 'Indian Ocean equatorial refuel',
  },
  {
    name: 'Longyearbyen',
    country: 'Norway',
    lat: 78.2232,
    lon: 15.6267,
    nodeType: E2M_NODE_TYPES.ORBITAL_REFUELING,
    corridor: 'Arctic polar staging',
  },
  {
    name: 'Thule',
    country: 'Greenland',
    lat: 76.5312,
    lon: -68.7032,
    nodeType: E2M_NODE_TYPES.ORBITAL_GATEWAY,
    corridor: 'North Atlantic polar gateway',
  },
  {
    name: 'Easter Island',
    country: 'Chile',
    lat: -27.1127,
    lon: -109.3497,
    nodeType: E2M_NODE_TYPES.MARS_STAGING,
    corridor: 'South Pacific deep-space window',
    marsWindow: true,
  },
  {
    name: 'Alice Springs',
    country: 'Australia',
    lat: -23.698,
    lon: 133.8807,
    nodeType: E2M_NODE_TYPES.ORBITAL_GATEWAY,
    corridor: 'Outback tracking / desert staging',
  },
  {
    name: 'Las Palmas',
    country: 'Spain',
    lat: 28.1235,
    lon: -15.4363,
    nodeType: E2M_NODE_TYPES.CARGO_PORT,
    corridor: 'Atlantic island logistics chain',
  },
  {
    name: 'Papeete',
    country: 'French Polynesia',
    lat: -17.5516,
    lon: -149.5585,
    nodeType: E2M_NODE_TYPES.ORBITAL_REFUELING,
    corridor: 'Central Pacific orbital support',
  },
  {
    name: 'Falkland Islands',
    country: 'UK',
    lat: -51.7963,
    lon: -59.5236,
    nodeType: E2M_NODE_TYPES.MARS_STAGING,
    corridor: 'South Atlantic staging',
    marsWindow: true,
  },
];

export const E2M_ORBITAL_CORRIDORS = [
  {
    id: 'e2m-atlantic-staging',
    nodes: ['Cape Canaveral', 'Houston', 'Kourou'],
    corridor: 'Atlantic orbital chain',
  },
  {
    id: 'e2m-pacific-staging',
    nodes: ['Tanegashima', 'Wenchang', 'Perth'],
    corridor: 'Pacific cargo chain',
  },
  {
    id: 'e2m-polar-refuel',
    nodes: ['Nuuk', 'Baikonur', 'Dubai'],
    corridor: 'Polar / Eurasian refueling',
  },
  {
    id: 'e2m-equatorial-chain',
    nodes: ['Kourou', 'Mahé', 'Wenchang'],
    corridor: 'Equatorial heavy-lift chain',
  },
  {
    id: 'e2m-pacific-island',
    nodes: ['Tanegashima', 'Papeete', 'Easter Island'],
    corridor: 'Pacific island logistics',
  },
  {
    id: 'e2m-arctic-polar',
    nodes: ['Thule', 'Longyearbyen', 'Nuuk'],
    corridor: 'Arctic polar refuel ring',
  },
  {
    id: 'e2m-americas-launch',
    nodes: ['Vandenberg', 'Cape Canaveral', 'Kourou'],
    corridor: 'Americas launch arc',
  },
];

export function buildE2MOrbitalNodes() {
  return E2M_ORBITAL_SEEDS.map((seed) => ({
    id: networkCityId(seed.name, seed.country),
    name: seed.name,
    country: seed.country,
    lat: seed.lat,
    lon: seed.lon,
    nodeType: seed.nodeType,
    e2mLayer: true,
    marsWindow: Boolean(seed.marsWindow),
    corridor: seed.corridor,
    renderable: true,
    infrastructureRole: 'E2M_NODE',
    cargoPriority: true,
    passengerPriority: false,
    visibleMinZoom: 2,
    allowsSplitOff: false,
    isSwitchNode: false,
    nameKey: normalizeCityKey(seed.name),
  }));
}

export function buildE2MOrbitalPaths(nodesByKey) {
  const paths = [];
  E2M_ORBITAL_CORRIDORS.forEach((def) => {
    for (let i = 0; i < def.nodes.length - 1; i += 1) {
      const a = nodesByKey.get(normalizeCityKey(def.nodes[i]));
      const b = nodesByKey.get(normalizeCityKey(def.nodes[i + 1]));
      if (!a || !b) continue;
      paths.push({
        id: `e2m-${def.id}-${i}`,
        path: [
          [a.lon, a.lat],
          [b.lon, b.lat],
        ],
        routeClass: 'E2M_ORBITAL_CORRIDOR',
        edgeCategory: 'E2M_ORBITAL',
        edgeType: 'E2M_LOGISTICS_LINE',
        corridor: def.corridor,
        renderable: true,
        infrastructureOnly: true,
        cargoPriority: true,
        e2mLayer: true,
      });
    }
  });
  return paths;
}
