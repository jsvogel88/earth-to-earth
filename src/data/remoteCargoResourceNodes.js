/**
 * Phase 3 Extended Rural + Remote Cargo node seeds.
 * Coordinates merged from PHASE1_MANUAL_COORDS only — never invented.
 */

import { PHASE1_MANUAL_COORDS, normalizeCityKey } from './hyperloopPhase1Coordinates.js';
import { normalizeNodeId } from './hyperloopPhase1Cities.js';

export const REMOTE_NODE_TYPES = {
  RURAL_PICKUP_POINT: 'RURAL_PICKUP_POINT',
  SMALL_CITY_NODE: 'SMALL_CITY_NODE',
  REMOTE_CARGO_NODE: 'REMOTE_CARGO_NODE',
  CRITICAL_MINERALS_NODE: 'CRITICAL_MINERALS_NODE',
  RARE_EARTH_NODE: 'RARE_EARTH_NODE',
  MINING_RESOURCE_NODE: 'MINING_RESOURCE_NODE',
  AGRICULTURE_LOGISTICS_NODE: 'AGRICULTURE_LOGISTICS_NODE',
  ARCTIC_PORT_NODE: 'ARCTIC_PORT_NODE',
  RIVER_PORT_NODE: 'RIVER_PORT_NODE',
  DESERT_LOGISTICS_NODE: 'DESERT_LOGISTICS_NODE',
  OUTBACK_RESOURCE_NODE: 'OUTBACK_RESOURCE_NODE',
  ISLAND_ACCESS_NODE: 'ISLAND_ACCESS_NODE',
  RESORT_ACCESS_NODE: 'RESORT_ACCESS_NODE',
  REMOTE_SWITCH_NODE: 'REMOTE_SWITCH_NODE',
};

export const REMOTE_REGION_SEEDS = [
  {
    regionType: 'Greenland / Arctic North Atlantic',
    continent: 'North America',
    defaultNodeType: REMOTE_NODE_TYPES.ARCTIC_PORT_NODE,
    cities: [
      'Nuuk', 'Sisimiut', 'Ilulissat', 'Qaqortoq', 'Aasiaat', 'Maniitsoq', 'Tasiilaq',
      'Uummannaq', 'Narsaq', 'Paamiut', 'Nanortalik', 'Upernavik', 'Qaanaaq', 'Qeqertarsuaq',
      'Kangerlussuaq', 'Ittoqqortoormiit', 'Kulusuk', 'Narsarsuaq',
    ],
  },
  {
    regionType: 'Canadian North / Alaska / Arctic Access',
    continent: 'North America',
    defaultNodeType: REMOTE_NODE_TYPES.ARCTIC_PORT_NODE,
    cities: [
      'Whitehorse', 'Yellowknife', 'Iqaluit', 'Inuvik', 'Tuktoyaktuk', 'Dawson City',
      'Rankin Inlet', 'Cambridge Bay', 'Resolute', 'Pond Inlet', 'Churchill', 'Thompson',
      'Fort McMurray', 'Grande Prairie', 'Prince George', 'Fairbanks', 'Anchorage', 'Nome',
      'Utqiagvik', 'Bethel', 'Kotzebue', 'Juneau', 'Sitka', 'Ketchikan', 'Kodiak',
    ],
  },
  {
    regionType: 'Northern Russia / Siberia / Arctic',
    continent: 'Asia',
    defaultNodeType: REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE,
    cities: [
      'Murmansk', 'Arkhangelsk', 'Severodvinsk', 'Naryan-Mar', 'Vorkuta', 'Salekhard',
      'Labytnangi', 'Novy Urengoy', 'Noyabrsk', 'Norilsk', 'Dudinka', 'Igarka', 'Dikson',
      'Tiksi', 'Yakutsk', 'Mirny', 'Lensk', 'Aldan', 'Neryungri', 'Magadan', 'Anadyr',
      'Pevek', 'Petropavlovsk-Kamchatsky', 'Kirovsk', 'Apatity', 'Monchegorsk', 'Severomorsk',
      'Krasnoyarsk', 'Bratsk', 'Ust-Ilimsk', 'Irkutsk', 'Ulan-Ude', 'Chita',
    ],
  },
  {
    regionType: 'Amazon Basin / Deep Rainforest Access',
    continent: 'South America',
    defaultNodeType: REMOTE_NODE_TYPES.RIVER_PORT_NODE,
    cities: [
      'Manaus', 'Belém', 'Macapá', 'Santarém', 'Altamira', 'Itaituba', 'Parintins', 'Tefé',
      'Tabatinga', 'Coari', 'Manacapuru', 'Porto Velho', 'Rio Branco', 'Cruzeiro do Sul',
      'Boa Vista', 'Marabá', 'Imperatriz', 'Iquitos', 'Pucallpa', 'Tarapoto', 'Yurimaguas',
      'Puerto Maldonado', 'Leticia', 'Florencia', 'Mocoa', 'Villavicencio', 'Cobija',
      'Riberalta', 'Trinidad', 'Santa Cruz de la Sierra',
    ],
  },
  {
    regionType: 'Australian Outback / Remote Australia',
    continent: 'Oceania',
    defaultNodeType: REMOTE_NODE_TYPES.OUTBACK_RESOURCE_NODE,
    cities: [
      'Alice Springs', 'Yulara', 'Tennant Creek', 'Katherine', 'Darwin', 'Mount Isa',
      'Longreach', 'Charleville', 'Birdsville', 'Winton', 'Cloncurry', 'Emerald', 'Broken Hill',
      'Cobar', 'Lightning Ridge', 'Dubbo', 'Coober Pedy', 'Port Augusta', 'Whyalla',
      'Roxby Downs', 'Olympic Dam', 'Kalgoorlie', 'Esperance', 'Geraldton', 'Carnarvon',
      'Exmouth', 'Karratha', 'Port Hedland', 'Newman', 'Tom Price', 'Broome', 'Derby',
      'Kununurra', 'Halls Creek', 'Fitzroy Crossing', 'Mildura', 'Toowoomba', 'Townsville', 'Cairns',
    ],
  },
  {
    regionType: 'Sahara / Sahel / Remote Africa',
    continent: 'Africa',
    defaultNodeType: REMOTE_NODE_TYPES.DESERT_LOGISTICS_NODE,
    cities: [
      'Nouakchott', 'Nouadhibou', 'Atar', 'Zouérat', 'Timbuktu', 'Gao', 'Kidal', 'Agadez',
      'Niamey', 'Zinder', "N'Djamena", 'Faya-Largeau', 'Abéché', 'Sebha', 'Ghat', 'Ghadames',
      'Tamanrasset', 'Adrar', 'Ouargla', 'Ghardaïa', 'Dakhla', 'Laayoune', 'Ouarzazate',
      'Marrakesh', 'Bamako', 'Ouagadougou', 'Kano', 'Maiduguri', 'El Fasher', 'Khartoum', 'Port Sudan',
    ],
  },
  {
    regionType: 'Central Asia / Mongolia / Steppe Network',
    continent: 'Asia',
    defaultNodeType: REMOTE_NODE_TYPES.REMOTE_CARGO_NODE,
    cities: [
      'Ulaanbaatar', 'Darkhan', 'Erdenet', 'Choibalsan', 'Dalanzadgad', 'Ölgii', 'Khovd',
      'Astana', 'Almaty', 'Shymkent', 'Aktobe', 'Atyrau', 'Karaganda', 'Pavlodar', 'Semey',
      'Oskemen', 'Bishkek', 'Osh', 'Tashkent', 'Samarkand', 'Bukhara', 'Nukus', 'Dushanbe',
      'Khujand', 'Ashgabat', 'Mary', 'Türkmenabat', 'Kashgar', 'Ürümqi', 'Hotan', 'Aksu',
    ],
  },
  {
    regionType: 'Himalayan / High-Altitude Access',
    continent: 'Asia',
    defaultNodeType: REMOTE_NODE_TYPES.RURAL_PICKUP_POINT,
    cities: [
      'Kathmandu', 'Pokhara', 'Biratnagar', 'Lhasa', 'Shigatse', 'Gyantse', 'Leh', 'Srinagar',
      'Shimla', 'Dharamshala', 'Dehradun', 'Gangtok', 'Thimphu', 'Paro', 'Guwahati', 'Shillong',
      'Imphal', 'Aizawl', 'Agartala',
    ],
  },
  {
    regionType: 'Andes / Patagonia / Remote South America',
    continent: 'South America',
    defaultNodeType: REMOTE_NODE_TYPES.MINING_RESOURCE_NODE,
    cities: [
      'La Paz', 'El Alto', 'Cochabamba', 'Sucre', 'Potosí', 'Oruro', 'Uyuni', 'Arequipa',
      'Cusco', 'Puno', 'Juliaca', 'Tacna', 'Iquique', 'Antofagasta', 'Calama', 'Copiapó',
      'La Serena', 'Mendoza', 'San Juan', 'Neuquén', 'Bariloche', 'Comodoro Rivadavia',
      'Río Gallegos', 'Ushuaia', 'Punta Arenas', 'Puerto Montt', 'Temuco', 'Valdivia', 'Coyhaique',
    ],
  },
  {
    regionType: 'Remote Island / Pacific Access',
    continent: 'Oceania',
    defaultNodeType: REMOTE_NODE_TYPES.ISLAND_ACCESS_NODE,
    cities: [
      'Reykjavík', 'Akureyri', 'Tórshavn', 'Longyearbyen', 'Ponta Delgada', 'Funchal',
      'Las Palmas', 'Santa Cruz de Tenerife', 'Papeete', 'Nouméa', 'Suva', 'Nadi', 'Apia',
      'Pago Pago', 'Honiara', 'Port Vila', 'Port Moresby', 'Lae', 'Dili', 'Jayapura', 'Sorong',
      'Ambon', 'Kupang',
    ],
  },
];

/** Per-city overrides for resource / logistics classification */
const CITY_NODE_OVERRIDES = {
  Norilsk: {
    nodeType: REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE,
    resourceTypes: ['nickel', 'copper', 'palladium', 'platinum_group_metals'],
    cargoPriority: true,
    passengerPriority: false,
    constructionDifficulty: 'HIGH',
  },
  Dudinka: {
    nodeType: REMOTE_NODE_TYPES.ARCTIC_PORT_NODE,
    cargoPriority: true,
    accessPurpose: ['arctic_logistics', 'remote_cargo'],
  },
  'Olympic Dam': {
    nodeType: REMOTE_NODE_TYPES.MINING_RESOURCE_NODE,
    resourceTypes: ['copper', 'uranium', 'gold'],
    cargoPriority: true,
  },
  'Roxby Downs': { nodeType: REMOTE_NODE_TYPES.MINING_RESOURCE_NODE, cargoPriority: true },
  Newman: { nodeType: REMOTE_NODE_TYPES.MINING_RESOURCE_NODE, resourceTypes: ['iron_ore'] },
  'Tom Price': { nodeType: REMOTE_NODE_TYPES.MINING_RESOURCE_NODE, resourceTypes: ['iron_ore'] },
  Kalgoorlie: { nodeType: REMOTE_NODE_TYPES.MINING_RESOURCE_NODE, resourceTypes: ['gold'] },
  'Port Hedland': { nodeType: REMOTE_NODE_TYPES.REMOTE_CARGO_NODE, cargoPriority: true },
  Karratha: { nodeType: REMOTE_NODE_TYPES.REMOTE_CARGO_NODE, cargoPriority: true },
  Manaus: { nodeType: REMOTE_NODE_TYPES.RIVER_PORT_NODE, cargoPriority: true },
  Iquitos: { nodeType: REMOTE_NODE_TYPES.RIVER_PORT_NODE },
  Uyuni: { nodeType: REMOTE_NODE_TYPES.RARE_EARTH_NODE, resourceTypes: ['lithium'] },
  Potosí: { nodeType: REMOTE_NODE_TYPES.MINING_RESOURCE_NODE },
  Zouérat: { nodeType: REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE, resourceTypes: ['iron_ore'] },
  Erdenet: { nodeType: REMOTE_NODE_TYPES.MINING_RESOURCE_NODE },
  Lhasa: { nodeType: REMOTE_NODE_TYPES.RURAL_PICKUP_POINT, constructionDifficulty: 'EXTREME', tunnelRequired: true },
  Leh: { nodeType: REMOTE_NODE_TYPES.RURAL_PICKUP_POINT, constructionDifficulty: 'EXTREME', tunnelRequired: true },
};

const CITY_ALIASES = {
  'n’djamena': "n'djamena",
  'são paulo': 'sao paulo',
  reykjavík: 'reykjavik',
  ürümqi: 'urumqi',
  ölgii: 'olgii',
};

function resolveKey(name) {
  const key = normalizeCityKey(name);
  return CITY_ALIASES[key] || key;
}

function lookupCoords(name) {
  const key = resolveKey(name);
  return PHASE1_MANUAL_COORDS[key] || null;
}

function inferAccessPurpose(nodeType, overrides) {
  if (overrides.accessPurpose) return overrides.accessPurpose;
  if (nodeType === REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE) {
    return ['critical_minerals', 'remote_cargo'];
  }
  if (nodeType === REMOTE_NODE_TYPES.RARE_EARTH_NODE) {
    return ['rare_earths', 'remote_cargo'];
  }
  if (nodeType === REMOTE_NODE_TYPES.ARCTIC_PORT_NODE) {
    return ['arctic_logistics', 'remote_cargo'];
  }
  if (nodeType === REMOTE_NODE_TYPES.RIVER_PORT_NODE) {
    return ['remote_cargo', 'agriculture'];
  }
  if (overrides.cargoPriority) return ['remote_cargo'];
  return ['rural_access', 'remote_passenger'];
}

/**
 * Build Phase 3 remote/rural node index from seeds + known coordinates only.
 */
export function buildRemoteCargoResourceNodes() {
  const nodes = [];
  const seen = new Set();

  REMOTE_REGION_SEEDS.forEach((region) => {
    region.cities.forEach((cityName) => {
      const key = `${resolveKey(cityName)}|${region.continent}`;
      if (seen.has(key)) return;
      seen.add(key);

      const coords = lookupCoords(cityName);
      const overrides = CITY_NODE_OVERRIDES[cityName] || {};
      const nodeType = overrides.nodeType || region.defaultNodeType;
      const hasCoords =
        coords &&
        typeof coords.lat === 'number' &&
        typeof coords.lon === 'number' &&
        Number.isFinite(coords.lat) &&
        Number.isFinite(coords.lon);

      const cargoPriority =
        overrides.cargoPriority ??
        [
          REMOTE_NODE_TYPES.CRITICAL_MINERALS_NODE,
          REMOTE_NODE_TYPES.RARE_EARTH_NODE,
          REMOTE_NODE_TYPES.MINING_RESOURCE_NODE,
          REMOTE_NODE_TYPES.REMOTE_CARGO_NODE,
          REMOTE_NODE_TYPES.ARCTIC_PORT_NODE,
          REMOTE_NODE_TYPES.RIVER_PORT_NODE,
          REMOTE_NODE_TYPES.OUTBACK_RESOURCE_NODE,
          REMOTE_NODE_TYPES.DESERT_LOGISTICS_NODE,
        ].includes(nodeType);

      nodes.push({
        id: normalizeNodeId(cityName, coords?.country || 'unknown'),
        name: cityName,
        country: coords?.country || '',
        continent: coords?.continent || region.continent,
        regionType: region.regionType,
        nodeType,
        lat: hasCoords ? coords.lat : null,
        lon: hasCoords ? coords.lon : null,
        needsCoordinates: !hasCoords,
        population: null,
        phase: 3,
        parentE2EHub: null,
        nearestHyperloopNode: null,
        nearestSwitchNode: null,
        nearestPort: overrides.nearestPort || null,
        cargoPriority,
        passengerPriority: overrides.passengerPriority ?? !cargoPriority,
        resourceTypes: overrides.resourceTypes || [],
        accessPurpose: inferAccessPurpose(nodeType, overrides),
        ruralAccessRadiusMiles: 75,
        cargoAccessRadiusMiles: cargoPriority ? 300 : 150,
        visibleMinZoom: cargoPriority ? 6.5 : 7,
        allowsSplitOff: true,
        isRemoteNode: true,
        constructionDifficulty: overrides.constructionDifficulty || 'MEDIUM',
        tunnelRequired: overrides.tunnelRequired || false,
        renderable: hasCoords,
      });
    });
  });

  return nodes;
}
