/**
 * Default E2M strategic mineral / industrial hub dataset.
 * Coordinates are best-effort; coordinate_confidence marks approximate entries.
 * No routes or graph logic — enrichment via buildMineralHubConnections.js.
 */

import { classifyMineralHub } from '../modes/classifyLocation.js';

export const MINERAL_TYPES = {
  RARE_EARTH: 'Rare Earth Elements',
  LITHIUM: 'Lithium',
  COPPER_COBALT: 'Copper / Cobalt',
  NICKEL: 'Nickel / Battery Metals',
  GRAPHITE: 'Graphite / Industrial Minerals',
  URANIUM: 'Uranium',
  STRATEGIC_INDUSTRIAL: 'Strategic Industrial Minerals',
  CRITICAL_BATTERY: 'Critical Battery Minerals',
};

/** @param {string} name @param {string} country */
export function mineralHubId(name, country) {
  const nameSlug = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const countrySlug = String(country)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `e2m:${nameSlug}:${countrySlug}`;
}

/**
 * @typedef {Object} MineralHubSeed
 * @property {string} name
 * @property {string} country
 * @property {string} region
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} mineral_type
 * @property {number} strategic_score
 * @property {number} remote_score
 * @property {string} production_status
 * @property {'approximate'|'verified'} coordinate_confidence
 * @property {string} [nearest_support_city]
 * @property {string} [nearest_port]
 * @property {string} [nearest_e2e_hub]
 * @property {string} [recommended_connection_type]
 */

/** @type {MineralHubSeed[]} */
const MINERAL_HUB_SEEDS = [
  // —— Rare Earth / REE Hubs ——
  {
    name: 'Bayan Obo / Baotou',
    country: 'China',
    region: 'Inner Mongolia',
    latitude: 41.76,
    longitude: 109.95,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.98,
    remote_score: 0.35,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Mountain Pass',
    country: 'USA',
    region: 'California',
    latitude: 35.467,
    longitude: -115.697,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.92,
    remote_score: 0.45,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Mount Weld / Laverton',
    country: 'Australia',
    region: 'Western Australia',
    latitude: -28.85,
    longitude: 122.0,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.88,
    remote_score: 0.72,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Nolans / Alice Springs Corridor',
    country: 'Australia',
    region: 'Northern Territory',
    latitude: -22.5,
    longitude: 133.5,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.75,
    remote_score: 0.85,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Nechalacho / Thor Lake',
    country: 'Canada',
    region: 'Northwest Territories',
    latitude: 62.12,
    longitude: -112.58,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.82,
    remote_score: 0.9,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Kvanefjeld / Ilímaussaq',
    country: 'Greenland',
    region: 'Kujalleq',
    latitude: 60.95,
    longitude: -45.42,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.78,
    remote_score: 0.88,
    production_status: 'planned',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Araxá',
    country: 'Brazil',
    region: 'Minas Gerais',
    latitude: -19.593,
    longitude: -46.94,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.85,
    remote_score: 0.3,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Maoniuping',
    country: 'China',
    region: 'Sichuan',
    latitude: 28.0,
    longitude: 101.5,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.9,
    remote_score: 0.55,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Tomtor',
    country: 'Russia',
    region: 'Yakutia',
    latitude: 56.5,
    longitude: 130.5,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.8,
    remote_score: 0.92,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Steenkampskraal',
    country: 'South Africa',
    region: 'Western Cape',
    latitude: -32.45,
    longitude: 18.35,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.7,
    remote_score: 0.4,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },

  // —— Lithium Hubs ——
  {
    name: 'Salar de Atacama',
    country: 'Chile',
    region: 'Antofagasta',
    latitude: -23.5,
    longitude: -68.0,
    mineral_type: MINERAL_TYPES.LITHIUM,
    strategic_score: 0.95,
    remote_score: 0.6,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Salar de Uyuni',
    country: 'Bolivia',
    region: 'Potosí',
    latitude: -20.133,
    longitude: -67.489,
    mineral_type: MINERAL_TYPES.LITHIUM,
    strategic_score: 0.88,
    remote_score: 0.65,
    production_status: 'developing',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Jujuy / Salta / Catamarca',
    country: 'Argentina',
    region: 'Lithium Triangle',
    latitude: -24.185,
    longitude: -65.299,
    mineral_type: MINERAL_TYPES.LITHIUM,
    strategic_score: 0.9,
    remote_score: 0.5,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Greenbushes',
    country: 'Australia',
    region: 'Western Australia',
    latitude: -33.863,
    longitude: 116.064,
    mineral_type: MINERAL_TYPES.LITHIUM,
    strategic_score: 0.87,
    remote_score: 0.35,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Pilgangoora',
    country: 'Australia',
    region: 'Western Australia',
    latitude: -21.0,
    longitude: 118.9,
    mineral_type: MINERAL_TYPES.LITHIUM,
    strategic_score: 0.84,
    remote_score: 0.75,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Thacker Pass',
    country: 'USA',
    region: 'Nevada',
    latitude: 41.8,
    longitude: -118.0,
    mineral_type: MINERAL_TYPES.LITHIUM,
    strategic_score: 0.83,
    remote_score: 0.55,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'James Bay Lithium District',
    country: 'Canada',
    region: 'Quebec',
    latitude: 52.0,
    longitude: -77.0,
    mineral_type: MINERAL_TYPES.LITHIUM,
    strategic_score: 0.8,
    remote_score: 0.7,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },

  // —— Copper / Cobalt Hubs ——
  {
    name: 'Kolwezi / Copperbelt',
    country: 'DR Congo',
    region: 'Lualaba',
    latitude: -10.716,
    longitude: 25.466,
    mineral_type: MINERAL_TYPES.COPPER_COBALT,
    strategic_score: 0.96,
    remote_score: 0.45,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Katanga Copperbelt',
    country: 'DR Congo',
    region: 'Katanga / Zambia border',
    latitude: -11.67,
    longitude: 27.48,
    mineral_type: MINERAL_TYPES.COPPER_COBALT,
    strategic_score: 0.94,
    remote_score: 0.4,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Antofagasta / Atacama Copper Belt',
    country: 'Chile',
    region: 'Antofagasta',
    latitude: -23.65,
    longitude: -70.4,
    mineral_type: MINERAL_TYPES.COPPER_COBALT,
    strategic_score: 0.93,
    remote_score: 0.55,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Morenci / Arizona Copper Belt',
    country: 'USA',
    region: 'Arizona',
    latitude: 33.05,
    longitude: -109.33,
    mineral_type: MINERAL_TYPES.COPPER_COBALT,
    strategic_score: 0.86,
    remote_score: 0.35,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Escondida',
    country: 'Chile',
    region: 'Antofagasta',
    latitude: -24.267,
    longitude: -69.067,
    mineral_type: MINERAL_TYPES.COPPER_COBALT,
    strategic_score: 0.95,
    remote_score: 0.7,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Grasberg',
    country: 'Indonesia',
    region: 'Papua',
    latitude: -4.053,
    longitude: 137.116,
    mineral_type: MINERAL_TYPES.COPPER_COBALT,
    strategic_score: 0.94,
    remote_score: 0.85,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Oyu Tolgoi',
    country: 'Mongolia',
    region: 'Ömnögovi',
    latitude: 43.025,
    longitude: 106.85,
    mineral_type: MINERAL_TYPES.COPPER_COBALT,
    strategic_score: 0.91,
    remote_score: 0.8,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },

  // —— Nickel / Battery Metal Hubs ——
  {
    name: 'Sudbury Basin',
    country: 'Canada',
    region: 'Ontario',
    latitude: 46.492,
    longitude: -81.005,
    mineral_type: MINERAL_TYPES.NICKEL,
    strategic_score: 0.9,
    remote_score: 0.25,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Norilsk',
    country: 'Russia',
    region: 'Krasnoyarsk Krai',
    latitude: 69.349,
    longitude: 88.201,
    mineral_type: MINERAL_TYPES.NICKEL,
    strategic_score: 0.92,
    remote_score: 0.88,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Raglan / Nunavik',
    country: 'Canada',
    region: 'Quebec',
    latitude: 61.8,
    longitude: -73.75,
    mineral_type: MINERAL_TYPES.NICKEL,
    strategic_score: 0.82,
    remote_score: 0.85,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: "Voisey's Bay",
    country: 'Canada',
    region: 'Labrador',
    latitude: 56.33,
    longitude: -61.67,
    mineral_type: MINERAL_TYPES.NICKEL,
    strategic_score: 0.85,
    remote_score: 0.82,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Kambalda / Kalgoorlie',
    country: 'Australia',
    region: 'Western Australia',
    latitude: -31.19,
    longitude: 121.49,
    mineral_type: MINERAL_TYPES.NICKEL,
    strategic_score: 0.84,
    remote_score: 0.6,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Sulawesi Nickel Belt',
    country: 'Indonesia',
    region: 'Sulawesi',
    latitude: -2.5,
    longitude: 121.0,
    mineral_type: MINERAL_TYPES.NICKEL,
    strategic_score: 0.93,
    remote_score: 0.55,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },

  // —— Graphite / Industrial Mineral Hubs ——
  {
    name: 'Cabo Delgado Graphite Belt',
    country: 'Mozambique',
    region: 'Cabo Delgado',
    latitude: -12.35,
    longitude: 39.35,
    mineral_type: MINERAL_TYPES.GRAPHITE,
    strategic_score: 0.8,
    remote_score: 0.65,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Balama',
    country: 'Mozambique',
    region: 'Cabo Delgado',
    latitude: -13.283,
    longitude: 38.617,
    mineral_type: MINERAL_TYPES.GRAPHITE,
    strategic_score: 0.82,
    remote_score: 0.7,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Toliara',
    country: 'Madagascar',
    region: 'Atsimo-Andrefana',
    latitude: -23.35,
    longitude: 43.67,
    mineral_type: MINERAL_TYPES.GRAPHITE,
    strategic_score: 0.78,
    remote_score: 0.6,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Heilongjiang Graphite Region',
    country: 'China',
    region: 'Heilongjiang',
    latitude: 47.35,
    longitude: 123.95,
    mineral_type: MINERAL_TYPES.GRAPHITE,
    strategic_score: 0.85,
    remote_score: 0.3,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Rajasthan / Odisha / Jharkhand',
    country: 'India',
    region: 'Eastern India',
    latitude: 22.5,
    longitude: 85.3,
    mineral_type: MINERAL_TYPES.GRAPHITE,
    strategic_score: 0.76,
    remote_score: 0.35,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },

  // —— Strategic Remote / Industrial Zones ——
  {
    name: 'Pilbara',
    country: 'Australia',
    region: 'Western Australia',
    latitude: -21.5,
    longitude: 117.5,
    mineral_type: MINERAL_TYPES.STRATEGIC_INDUSTRIAL,
    strategic_score: 0.94,
    remote_score: 0.78,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Labrador Trough',
    country: 'Canada',
    region: 'Labrador / Quebec',
    latitude: 54.8,
    longitude: -66.9,
    mineral_type: MINERAL_TYPES.STRATEGIC_INDUSTRIAL,
    strategic_score: 0.88,
    remote_score: 0.75,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Kiruna / Northern Sweden',
    country: 'Sweden',
    region: 'Norrbotten',
    latitude: 67.855,
    longitude: 20.225,
    mineral_type: MINERAL_TYPES.STRATEGIC_INDUSTRIAL,
    strategic_score: 0.86,
    remote_score: 0.7,
    production_status: 'active',
    coordinate_confidence: 'verified',
  },
  {
    name: 'Arctic Greenland Resource Zone',
    country: 'Greenland',
    region: 'Arctic',
    latitude: 70.0,
    longitude: -45.0,
    mineral_type: MINERAL_TYPES.STRATEGIC_INDUSTRIAL,
    strategic_score: 0.75,
    remote_score: 0.95,
    production_status: 'planned',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Kazakhstan Critical Minerals Corridor',
    country: 'Kazakhstan',
    region: 'Central Kazakhstan',
    latitude: 47.0,
    longitude: 67.0,
    mineral_type: MINERAL_TYPES.CRITICAL_BATTERY,
    strategic_score: 0.87,
    remote_score: 0.55,
    production_status: 'active',
    coordinate_confidence: 'approximate',
  },
  {
    name: 'Central Asian Rare Metals Corridor',
    country: 'Kazakhstan',
    region: 'Central Asia',
    latitude: 42.0,
    longitude: 74.0,
    mineral_type: MINERAL_TYPES.RARE_EARTH,
    strategic_score: 0.8,
    remote_score: 0.6,
    production_status: 'developing',
    coordinate_confidence: 'approximate',
  },
];

/** @param {MineralHubSeed} seed */
function seedToHub(seed) {
  const hub = {
    mineral_hub_id: mineralHubId(seed.name, seed.country),
    ...seed,
    auto_enabled: true,
    loop_enabled: true,
    e2m_enabled: true,
    feeder_required: true,
    recommended_connection_type:
      seed.recommended_connection_type ??
      (seed.remote_score > 0.7 ? 'feeder_corridor' : 'regional_trunk'),
  };
  return classifyMineralHub(hub);
}

/** @type {ReturnType<typeof seedToHub>[]} */
export const DEFAULT_MINERAL_HUBS = MINERAL_HUB_SEEDS.map(seedToHub);

export function getDefaultMineralHubs() {
  return DEFAULT_MINERAL_HUBS;
}

export function getMineralHubById(mineralHubId) {
  return DEFAULT_MINERAL_HUBS.find((h) => h.mineral_hub_id === mineralHubId) ?? null;
}

export function listMineralHubsByType(mineralType) {
  return DEFAULT_MINERAL_HUBS.filter((h) => h.mineral_type === mineralType);
}
