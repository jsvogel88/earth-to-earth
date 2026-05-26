/**
 * Hyperloop Web V2 — node registry + continental trunk corridor definitions.
 * Coordinates: [longitude, latitude]
 */

export const TRUNK_CORRIDORS = [
  {
    id: 'US_EAST',
    name: 'US East Coast',
    continent: 'north_america',
    nodeSequence: ['TOR', 'NYC', 'PHL', 'DCA', 'CLT', 'ATL', 'ORL', 'MIA'],
    type: 'continental_trunk',
  },
  {
    id: 'US_CENTRAL',
    name: 'US Central Spine',
    continent: 'north_america',
    nodeSequence: ['CHI', 'STL', 'KCY', 'OKC', 'HOU'],
    type: 'continental_trunk',
  },
  {
    id: 'US_WEST',
    name: 'US West Coast',
    continent: 'north_america',
    nodeSequence: ['VAN', 'SEA', 'SFO', 'LAX', 'PHX', 'SAN'],
    type: 'continental_trunk',
  },
  {
    id: 'US_TRANSCON',
    name: 'US Transcontinental',
    continent: 'north_america',
    nodeSequence: ['NYC', 'CLV', 'CHI', 'DEN', 'SLC', 'LAX'],
    type: 'continental_trunk',
  },
  {
    id: 'MXAM',
    name: 'Mexico-Central America',
    continent: 'north_america',
    nodeSequence: ['HOU', 'MEX', 'GDL', 'PTY'],
    type: 'regional_trunk',
  },
  {
    id: 'SA_WEST',
    name: 'South America West',
    continent: 'south_america',
    nodeSequence: ['BOG', 'LIM', 'SCL', 'BUE'],
    type: 'continental_trunk',
  },
  {
    id: 'SA_EAST',
    name: 'South America East',
    continent: 'south_america',
    nodeSequence: ['SAO', 'RIO', 'BSB', 'BUE'],
    type: 'continental_trunk',
  },
  {
    id: 'EUR_SPINE',
    name: 'European Spine',
    continent: 'europe',
    nodeSequence: ['LON', 'PAR', 'BRU', 'FRA', 'VIE', 'BUD', 'BEL', 'BUC', 'IST'],
    type: 'continental_trunk',
  },
  {
    id: 'EUR_SOUTH',
    name: 'Southern Europe',
    continent: 'europe',
    nodeSequence: ['LIS', 'MAD', 'BCN', 'LYO', 'GEN', 'ROM', 'ATH'],
    type: 'continental_trunk',
  },
  {
    id: 'EUR_SCANDINAVIAN',
    name: 'Scandinavian Corridor',
    continent: 'europe',
    nodeSequence: ['LON', 'AMS', 'CPH', 'STO', 'OSL', 'HEL'],
    type: 'regional_trunk',
  },
  {
    id: 'EUR_EAST',
    name: 'Eastern Europe',
    continent: 'europe',
    nodeSequence: ['BER', 'WAR', 'KIE', 'MOS'],
    type: 'regional_trunk',
  },
  {
    id: 'ME_SPINE',
    name: 'Middle East Spine',
    continent: 'middle_east',
    nodeSequence: ['CAI', 'TLV', 'AMM', 'BGW', 'THR'],
    type: 'continental_trunk',
  },
  {
    id: 'ME_GULF',
    name: 'Gulf Corridor',
    continent: 'middle_east',
    nodeSequence: ['CAI', 'JED', 'RYD', 'KWI', 'DXB', 'MCT'],
    type: 'continental_trunk',
  },
  {
    id: 'AFR_NORTH',
    name: 'North Africa',
    continent: 'africa',
    nodeSequence: ['CAS', 'TUN', 'TRP', 'CAI'],
    type: 'regional_trunk',
  },
  {
    id: 'AFR_WEST',
    name: 'West Africa Corridor',
    continent: 'africa',
    nodeSequence: ['CAS', 'DAK', 'ABJ', 'ACC', 'LOS', 'KAN'],
    type: 'continental_trunk',
  },
  {
    id: 'AFR_EAST',
    name: 'East Africa Corridor',
    continent: 'africa',
    nodeSequence: ['CAI', 'KRT', 'ADD', 'NAI', 'DAR', 'LLG', 'JNB'],
    type: 'continental_trunk',
  },
  {
    id: 'AFR_TRANS',
    name: 'Trans-Africa',
    continent: 'africa',
    nodeSequence: ['LOS', 'KAN', 'ADD', 'NAI'],
    type: 'regional_trunk',
  },
  {
    id: 'EURASIA_SPINE',
    name: 'Eurasian Spine',
    continent: 'central_asia',
    nodeSequence: ['IST', 'THR', 'TAS', 'ALM', 'BJS'],
    type: 'continental_trunk',
  },
  {
    id: 'SILK_ROAD',
    name: 'Silk Road Corridor',
    continent: 'central_asia',
    nodeSequence: ['IST', 'THR', 'ASB', 'TAS', 'BJS'],
    type: 'continental_trunk',
  },
  {
    id: 'SIBERIAN',
    name: 'Siberian Spine',
    continent: 'east_asia',
    nodeSequence: ['MOS', 'EKB', 'OMS', 'NVS', 'KRS', 'IRK', 'ULA', 'VLA'],
    type: 'continental_trunk',
  },
  {
    id: 'SASIA_SPINE',
    name: 'South Asia Spine',
    continent: 'south_asia',
    nodeSequence: ['KAR', 'ISB', 'LAH', 'DEL', 'KTM', 'DHK'],
    type: 'continental_trunk',
  },
  {
    id: 'INDIA_SPINE',
    name: 'India Corridor',
    continent: 'south_asia',
    nodeSequence: ['DEL', 'MUM', 'BAN', 'HYD', 'MAA'],
    type: 'continental_trunk',
  },
  {
    id: 'CHINA_COAST',
    name: 'China Coastal Corridor',
    continent: 'east_asia',
    nodeSequence: ['BJS', 'TJN', 'QIN', 'SHG', 'NKG', 'GUA', 'HKG'],
    type: 'continental_trunk',
  },
  {
    id: 'CHINA_INNER',
    name: 'China Inland Spine',
    continent: 'east_asia',
    nodeSequence: ['BJS', 'TYU', 'XIY', 'CHG', 'KMG', 'HAN'],
    type: 'regional_trunk',
  },
  {
    id: 'SEA_SPINE',
    name: 'Southeast Asia Spine',
    continent: 'southeast_asia',
    nodeSequence: ['HKG', 'HAN', 'BKK', 'KUL', 'SIN', 'CGK'],
    type: 'continental_trunk',
  },
  {
    id: 'SEA_ISLANDS',
    name: 'Island Chain Corridor',
    continent: 'southeast_asia',
    nodeSequence: ['MNL', 'SIN', 'CGK', 'SBY'],
    type: 'regional_trunk',
  },
  {
    id: 'AUS_EAST',
    name: 'Australia East Coast',
    continent: 'oceania',
    nodeSequence: ['BNE', 'SYD', 'MEL', 'ADL', 'PER'],
    type: 'continental_trunk',
  },
];

/** [lon, lat], tier, continent, flags */
const NODE_DEFS = {
  NYC: ['New York', [-74.006, 40.7128], 0, 'north_america', { isE2EHub: true }],
  LAX: ['Los Angeles', [-118.2437, 34.0522], 0, 'north_america', { isE2EHub: true }],
  LON: ['London', [-0.1278, 51.5074], 0, 'europe', { isE2EHub: true }],
  DXB: ['Dubai', [55.2708, 25.2048], 0, 'middle_east', { isE2EHub: true }],
  TKO: ['Tokyo', [139.6503, 35.6762], 0, 'east_asia', { isE2EHub: true }],
  SYD: ['Sydney', [151.2093, -33.8688], 0, 'oceania', { isE2EHub: true }],
  SIN: ['Singapore', [103.8198, 1.3521], 0, 'southeast_asia', { isE2EHub: true }],
  BJS: ['Beijing', [116.4074, 39.9042], 0, 'east_asia', { isE2EHub: true }],
  DEL: ['Delhi', [77.209, 28.6139], 0, 'south_asia', { isE2EHub: true }],
  JNB: ['Johannesburg', [28.0473, -26.2041], 0, 'africa', { isE2EHub: true }],
  SAO: ['São Paulo', [-46.6333, -23.5505], 0, 'south_america', { isE2EHub: true }],
  MEX: ['Mexico City', [-99.1332, 19.4326], 0, 'north_america', { isE2EHub: true }],
  ANC: ['Anchorage', [-149.9003, 61.2181], 0, 'north_america', { isE2EHub: true }],
  PAR: ['Paris', [2.3522, 48.8566], 0, 'europe', { isE2EHub: true }],
  FRA: ['Frankfurt', [8.6821, 50.1109], 0, 'europe', { isE2EHub: true }],
  IST: ['Istanbul', [28.9784, 41.0082], 0, 'middle_east', { isE2EHub: true }],
  CAI: ['Cairo', [31.2357, 30.0444], 0, 'africa', { isE2EHub: true }],
  SFO: ['San Francisco', [-122.4194, 37.7749], 0, 'north_america', { isE2EHub: true }],
  CHI: ['Chicago', [-87.6298, 41.8781], 0, 'north_america', { isE2EHub: true }],
  MOS: ['Moscow', [37.6173, 55.7558], 0, 'europe', { isE2EHub: true }],

  MIA: ['Miami', [-80.1918, 25.7617], 1, 'north_america', {}],
  ATL: ['Atlanta', [-84.388, 33.749], 1, 'north_america', {}],
  DEN: ['Denver', [-104.9903, 39.7392], 1, 'north_america', {}],
  HOU: ['Houston', [-95.3698, 29.7604], 1, 'north_america', {}],
  PHX: ['Phoenix', [-112.074, 33.4484], 1, 'north_america', {}],
  SEA: ['Seattle', [-122.3321, 47.6062], 1, 'north_america', {}],
  TOR: ['Toronto', [-79.3832, 43.6532], 1, 'north_america', {}],
  MTL: ['Montreal', [-73.5673, 45.5017], 1, 'north_america', {}],
  VAN: ['Vancouver', [-123.1207, 49.2827], 1, 'north_america', {}],
  DFW: ['Dallas', [-96.797, 32.7767], 1, 'north_america', {}],

  AMS: ['Amsterdam', [4.9041, 52.3676], 1, 'europe', {}],
  BER: ['Berlin', [13.405, 52.52], 1, 'europe', {}],
  MAD: ['Madrid', [-3.7038, 40.4168], 1, 'europe', {}],
  BCN: ['Barcelona', [2.1734, 41.3851], 1, 'europe', {}],
  ROM: ['Rome', [12.4964, 41.9028], 1, 'europe', {}],
  VIE: ['Vienna', [16.3738, 48.2082], 1, 'europe', {}],
  WAR: ['Warsaw', [21.0122, 52.2297], 1, 'europe', {}],
  STO: ['Stockholm', [18.0686, 59.3293], 1, 'europe', {}],
  CPH: ['Copenhagen', [12.5683, 55.6761], 1, 'europe', {}],
  OSL: ['Oslo', [10.7522, 59.9139], 1, 'europe', {}],
  HEL: ['Helsinki', [24.9384, 60.1699], 1, 'europe', {}],
  ZUR: ['Zurich', [8.5417, 47.3769], 1, 'europe', {}],
  LIS: ['Lisbon', [-9.1393, 38.7223], 1, 'europe', {}],

  RYD: ['Riyadh', [46.6753, 24.7136], 1, 'middle_east', {}],
  JED: ['Jeddah', [39.1925, 21.4858], 1, 'middle_east', {}],
  KWI: ['Kuwait City', [47.9774, 29.3759], 1, 'middle_east', {}],
  TLV: ['Tel Aviv', [34.7818, 32.0853], 1, 'middle_east', {}],
  BGW: ['Baghdad', [44.3661, 33.3152], 1, 'middle_east', {}],
  THR: ['Tehran', [51.389, 35.6892], 1, 'middle_east', {}],

  LOS: ['Lagos', [3.3792, 6.5244], 1, 'africa', {}],
  NAI: ['Nairobi', [36.8219, -1.2921], 1, 'africa', {}],
  ACC: ['Accra', [-0.187, 5.6037], 1, 'africa', {}],
  DAR: ['Dar es Salaam', [39.2083, -6.7924], 1, 'africa', {}],
  KRT: ['Khartoum', [32.5599, 15.5007], 1, 'africa', {}],
  CAS: ['Casablanca', [-7.5898, 33.5731], 1, 'africa', {}],

  MUM: ['Mumbai', [72.8777, 19.076], 1, 'south_asia', {}],
  BAN: ['Bangalore', [77.5946, 12.9716], 1, 'south_asia', {}],
  KAR: ['Karachi', [67.0011, 24.8607], 1, 'south_asia', {}],
  DHK: ['Dhaka', [90.4125, 23.8103], 1, 'south_asia', {}],

  SHG: ['Shanghai', [121.4737, 31.2304], 1, 'east_asia', {}],
  HKG: ['Hong Kong', [114.1694, 22.3193], 1, 'east_asia', {}],
  SEO: ['Seoul', [126.978, 37.5665], 1, 'east_asia', {}],
  TPE: ['Taipei', [121.5654, 25.033], 1, 'east_asia', {}],
  GUA: ['Guangzhou', [113.2644, 23.1291], 1, 'east_asia', {}],

  BKK: ['Bangkok', [100.5018, 13.7563], 1, 'southeast_asia', {}],
  HAN: ['Hanoi', [105.8342, 21.0285], 1, 'southeast_asia', {}],
  KUL: ['Kuala Lumpur', [101.6869, 3.139], 1, 'southeast_asia', {}],
  CGK: ['Jakarta', [106.8456, -6.2088], 1, 'southeast_asia', {}],
  MNL: ['Manila', [120.9842, 14.5995], 1, 'southeast_asia', {}],

  TAS: ['Tashkent', [69.2401, 41.2995], 1, 'central_asia', {}],
  ALM: ['Almaty', [76.8512, 43.222], 1, 'central_asia', {}],
  ASB: ['Ashgabat', [58.3833, 37.9601], 1, 'central_asia', {}],

  BOG: ['Bogotá', [-74.0721, 4.711], 1, 'south_america', {}],
  LIM: ['Lima', [-77.0428, -12.0464], 1, 'south_america', {}],
  SCL: ['Santiago', [-70.6693, -33.4489], 1, 'south_america', {}],
  BUE: ['Buenos Aires', [-58.3816, -34.6037], 1, 'south_america', {}],
  RIO: ['Rio de Janeiro', [-43.1729, -22.9068], 1, 'south_america', {}],

  MEL: ['Melbourne', [144.9631, -37.8136], 1, 'oceania', {}],
  BNE: ['Brisbane', [153.0251, -27.4698], 1, 'oceania', {}],
  AKL: ['Auckland', [174.7633, -36.8485], 1, 'oceania', {}],
  PER: ['Perth', [115.8605, -31.9505], 1, 'oceania', {}],

  PHL: ['Philadelphia', [-75.1652, 39.9526], 2, 'north_america', { isSwitchNode: true }],
  DCA: ['Washington DC', [-77.0369, 38.9072], 2, 'north_america', { isSwitchNode: true }],
  CLT: ['Charlotte', [-80.8431, 35.2271], 2, 'north_america', { isSwitchNode: true }],
  CLV: ['Cleveland', [-81.6944, 41.4993], 2, 'north_america', { isSwitchNode: true }],
  SLC: ['Salt Lake City', [-111.891, 40.7608], 2, 'north_america', { isSwitchNode: true }],
  KCY: ['Kansas City', [-94.5786, 39.0997], 2, 'north_america', { isSwitchNode: true }],
  ORL: ['Orlando', [-81.3792, 28.5383], 2, 'north_america', { isSwitchNode: true }],
  STL: ['St. Louis', [-90.1994, 38.627], 2, 'north_america', { isSwitchNode: true }],
  OKC: ['Oklahoma City', [-97.5164, 35.4676], 2, 'north_america', { isSwitchNode: true }],

  BRU: ['Brussels', [4.3517, 50.8503], 2, 'europe', { isSwitchNode: true }],
  BUD: ['Budapest', [19.0402, 47.4979], 2, 'europe', { isSwitchNode: true }],
  BEL: ['Belgrade', [20.4489, 44.7866], 2, 'europe', { isSwitchNode: true }],
  BUC: ['Bucharest', [26.1025, 44.4268], 2, 'europe', { isSwitchNode: true }],
  LYO: ['Lyon', [4.8357, 45.764], 2, 'europe', { isSwitchNode: true }],
  MUN: ['Munich', [11.582, 48.1351], 2, 'europe', { isSwitchNode: true }],
  KIE: ['Kyiv', [30.5234, 50.4501], 2, 'europe', { isSwitchNode: true }],

  AMM: ['Amman', [35.9106, 31.9539], 2, 'middle_east', { isSwitchNode: true }],
  ADD: ['Addis Ababa', [38.7578, 9.032], 2, 'africa', { isSwitchNode: true }],
  KAN: ['Kano', [8.5167, 12.0022], 2, 'africa', { isSwitchNode: true }],

  CHG: ['Chongqing', [106.5516, 29.563], 2, 'east_asia', { isSwitchNode: true }],
  KMG: ['Kunming', [102.8329, 24.8801], 2, 'east_asia', { isSwitchNode: true }],
  LAH: ['Lahore', [74.3587, 31.5204], 2, 'south_asia', { isSwitchNode: true }],
  ISB: ['Islamabad', [73.0479, 33.6844], 2, 'south_asia', { isSwitchNode: true }],

  SAN: ['San Diego', [-117.1611, 32.7157], 3, 'north_america', {}],
  GDL: ['Guadalajara', [-103.3496, 20.6597], 3, 'north_america', {}],
  PTY: ['Panama City', [-79.5199, 8.9824], 3, 'north_america', {}],
  BSB: ['Brasília', [-47.8825, -15.7942], 3, 'south_america', {}],
  GEN: ['Genoa', [8.9463, 44.4056], 3, 'europe', {}],
  ATH: ['Athens', [23.7275, 37.9838], 3, 'europe', {}],
  PAL: ['Palermo', [13.3615, 38.1157], 3, 'europe', {}],
  TUN: ['Tunis', [10.1815, 36.8065], 3, 'africa', {}],
  TRP: ['Tripoli', [13.1913, 32.8872], 3, 'africa', {}],
  DAK: ['Dakar', [-17.4677, 14.7167], 3, 'africa', {}],
  ABJ: ['Abidjan', [-4.0083, 5.36], 3, 'africa', {}],
  LLG: ['Lilongwe', [33.7873, -13.9626], 3, 'africa', {}],
  MCT: ['Muscat', [58.4059, 23.588], 3, 'middle_east', {}],
  HYD: ['Hyderabad', [78.4867, 17.385], 3, 'south_asia', {}],
  MAA: ['Chennai', [80.2707, 13.0827], 3, 'south_asia', {}],
  KTM: ['Kathmandu', [85.324, 27.7172], 3, 'south_asia', {}],
  CMB: ['Colombo', [79.8612, 6.9271], 3, 'south_asia', {}],
  TJN: ['Tianjin', [117.3616, 39.3434], 3, 'east_asia', {}],
  QIN: ['Qingdao', [120.3826, 36.0671], 3, 'east_asia', {}],
  NKG: ['Nanjing', [118.7969, 32.0603], 3, 'east_asia', {}],
  TYU: ['Taiyuan', [112.5489, 37.8706], 3, 'east_asia', {}],
  XIY: ["Xi'an", [108.9398, 34.3416], 3, 'east_asia', {}],
  HAN: ['Wuhan', [114.3055, 30.5928], 3, 'east_asia', {}],
  SBY: ['Surabaya', [112.7521, -7.2575], 3, 'southeast_asia', {}],
  ADL: ['Adelaide', [138.6007, -34.9285], 3, 'oceania', {}],
  EKB: ['Yekaterinburg', [60.5975, 56.8389], 3, 'east_asia', {}],
  OMS: ['Omsk', [73.3686, 54.9885], 3, 'east_asia', {}],
  NVS: ['Novosibirsk', [82.9346, 55.0084], 3, 'east_asia', {}],
  KRS: ['Krasnoyarsk', [92.8932, 56.0153], 3, 'east_asia', {}],
  IRK: ['Irkutsk', [104.2805, 52.2869], 3, 'east_asia', {}],
  ULA: ['Ulaanbaatar', [106.9057, 47.8864], 3, 'east_asia', {}],
  VLA: ['Vladivostok', [131.8869, 43.1155], 3, 'east_asia', {}],
  CHU: ['Chukotka Gateway', [-172.4833, 64.7333], 3, 'east_asia', {}],
};

export function buildHyperloopNodes() {
  return Object.entries(NODE_DEFS).map(([id, [name, coordinates, tier, continent, flags]]) => ({
    id,
    name,
    coordinates,
    lon: coordinates[0],
    lat: coordinates[1],
    tier,
    continent,
    isE2EHub: flags.isE2EHub ?? tier === 0,
    isSwitchNode: flags.isSwitchNode ?? tier === 2,
    trunkCorridors: [],
    region: continent,
  }));
}

export function getNodeMap() {
  const nodes = buildHyperloopNodes();
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));
  TRUNK_CORRIDORS.forEach((corridor) => {
    corridor.nodeSequence.forEach((nodeId) => {
      if (map[nodeId] && !map[nodeId].trunkCorridors.includes(corridor.id)) {
        map[nodeId].trunkCorridors.push(corridor.id);
      }
    });
  });
  return map;
}

export function getTrunkNodeIds() {
  const ids = new Set();
  TRUNK_CORRIDORS.forEach((c) => c.nodeSequence.forEach((id) => ids.add(id)));
  return ids;
}
