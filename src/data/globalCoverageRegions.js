/**
 * Global remote / rare earth / strategic coverage regions and seed index.
 * Coordinates resolved via PHASE1_MANUAL_COORDS only — never invented.
 */

export const GLOBAL_COVERAGE_SOURCE = 'user_provided_global_remote_coverage_seed_list';

export const STRATEGIC_NODE_TYPES = {
  RARE_EARTH_HUB_CANDIDATE: 'RARE_EARTH_HUB_CANDIDATE',
  REMOTE_CARGO_NODE: 'REMOTE_CARGO_NODE',
  ARCTIC_LOGISTICS_NODE: 'ARCTIC_LOGISTICS_NODE',
  DESERT_LOGISTICS_NODE: 'DESERT_LOGISTICS_NODE',
  RAINFOREST_ACCESS_NODE: 'RAINFOREST_ACCESS_NODE',
  OUTBACK_RESOURCE_NODE: 'OUTBACK_RESOURCE_NODE',
  ISLAND_ACCESS_NODE: 'ISLAND_ACCESS_NODE',
  REMOTE_STRATEGIC_NODE: 'REMOTE_STRATEGIC_NODE',
};

/** @typedef {{ name: string, country: string, regionGroup: string, subRegion: string, nodeType: string, continent: string }} GlobalCoverageSeed */

export const GLOBAL_COVERAGE_SEEDS = [
  // North America / Arctic
  ...[
    ['Anchorage', 'USA', 'Alaska'], ['Fairbanks', 'USA', 'Alaska'], ['Nome', 'USA', 'Alaska'],
    ['Utqiagvik', 'USA', 'Alaska'], ['Bethel', 'USA', 'Alaska'], ['Kotzebue', 'USA', 'Alaska'],
    ['Kodiak', 'USA', 'Alaska'], ['Whitehorse', 'Canada', 'Yukon'], ['Yellowknife', 'Canada', 'NWT'],
    ['Iqaluit', 'Canada', 'Nunavut'], ['Inuvik', 'Canada', 'NWT'], ['Rankin Inlet', 'Canada', 'Nunavut'],
    ['Cambridge Bay', 'Canada', 'Nunavut'], ['Churchill', 'Canada', 'Manitoba'], ['Thompson', 'Canada', 'Manitoba'],
    ['Fort McMurray', 'Canada', 'Alberta'], ['Prince George', 'Canada', 'British Columbia'],
    ['Boise', 'USA', 'Idaho'], ['Billings', 'USA', 'Montana'], ['Bozeman', 'USA', 'Montana'],
    ['Missoula', 'USA', 'Montana'], ['Rapid City', 'USA', 'South Dakota'], ['Fargo', 'USA', 'North Dakota'],
    ['Sioux Falls', 'USA', 'South Dakota'], ['Cheyenne', 'USA', 'Wyoming'], ['Santa Fe', 'USA', 'New Mexico'],
    ['Flagstaff', 'USA', 'Arizona'], ['El Paso', 'USA', 'Texas'], ['Lubbock', 'USA', 'Texas'],
    ['Amarillo', 'USA', 'Texas'],
  ].map(([name, country, sub]) => ({
    name,
    country,
    regionGroup: 'North America / Arctic',
    subRegion: sub,
    nodeType: STRATEGIC_NODE_TYPES.ARCTIC_LOGISTICS_NODE,
    continent: 'North America',
  })),

  // Greenland / North Atlantic
  ...[
    ['Nuuk', 'Greenland'], ['Sisimiut', 'Greenland'], ['Ilulissat', 'Greenland'],
    ['Kangerlussuaq', 'Greenland'], ['Qaqortoq', 'Greenland'], ['Aasiaat', 'Greenland'],
    ['Tasiilaq', 'Greenland'], ['Narsarsuaq', 'Greenland'], ['Upernavik', 'Greenland'],
    ['Qaanaaq', 'Greenland'], ['Ittoqqortoormiit', 'Greenland'],
    ['Reykjavík', 'Iceland'], ['Akureyri', 'Iceland'], ['Tórshavn', 'Faroe Islands'],
    ['Longyearbyen', 'Svalbard'],
  ].map(([name, country]) => ({
    name,
    country,
    regionGroup: 'Greenland / North Atlantic',
    subRegion: country,
    nodeType: STRATEGIC_NODE_TYPES.ARCTIC_LOGISTICS_NODE,
    continent: 'North America',
  })),

  // South America / Amazon / Andes / Patagonia
  ...[
    ['Manaus', 'Brazil', 'Amazon'], ['Belém', 'Brazil', 'Amazon'], ['Macapá', 'Brazil', 'Amazon'],
    ['Santarém', 'Brazil', 'Amazon'], ['Altamira', 'Brazil', 'Amazon'], ['Itaituba', 'Brazil', 'Amazon'],
    ['Tefé', 'Brazil', 'Amazon'], ['Tabatinga', 'Brazil', 'Amazon'], ['Porto Velho', 'Brazil', 'Amazon'],
    ['Rio Branco', 'Brazil', 'Amazon'], ['Boa Vista', 'Brazil', 'Amazon'],
    ['Iquitos', 'Peru', 'Amazon'], ['Pucallpa', 'Peru', 'Amazon'], ['Puerto Maldonado', 'Peru', 'Amazon'],
    ['Leticia', 'Colombia', 'Amazon'], ['Florencia', 'Colombia', 'Amazon'], ['Cobija', 'Bolivia', 'Amazon'],
    ['Riberalta', 'Bolivia', 'Amazon'], ['Trinidad', 'Bolivia', 'Amazon'],
    ['La Paz', 'Bolivia', 'Andes'], ['El Alto', 'Bolivia', 'Andes'], ['Potosí', 'Bolivia', 'Andes'],
    ['Uyuni', 'Bolivia', 'Andes'], ['Oruro', 'Bolivia', 'Andes'],
    ['Arequipa', 'Peru', 'Andes'], ['Cusco', 'Peru', 'Andes'], ['Puno', 'Peru', 'Andes'],
    ['Iquique', 'Chile', 'Andes'], ['Antofagasta', 'Chile', 'Andes'], ['Calama', 'Chile', 'Andes'],
    ['Copiapó', 'Chile', 'Andes'],
    ['Mendoza', 'Argentina', 'Patagonia'], ['San Juan', 'Argentina', 'Patagonia'], ['Bariloche', 'Argentina', 'Patagonia'],
    ['Neuquén', 'Argentina', 'Patagonia'], ['Comodoro Rivadavia', 'Argentina', 'Patagonia'],
    ['Río Gallegos', 'Argentina', 'Patagonia'], ['Ushuaia', 'Argentina', 'Patagonia'],
    ['Punta Arenas', 'Chile', 'Patagonia'], ['Puerto Montt', 'Chile', 'Patagonia'], ['Coyhaique', 'Chile', 'Patagonia'],
  ].map(([name, country, sub]) => ({
    name,
    country,
    regionGroup: 'South America / Amazon / Andes',
    subRegion: sub,
    nodeType:
      sub === 'Amazon'
        ? STRATEGIC_NODE_TYPES.RAINFOREST_ACCESS_NODE
        : STRATEGIC_NODE_TYPES.REMOTE_CARGO_NODE,
    continent: 'South America',
  })),

  // Africa / Sahara / Sahel / Central / Resource
  ...[
    ['Nouakchott', 'Mauritania'], ['Nouadhibou', 'Mauritania'], ['Atar', 'Mauritania'], ['Zouérat', 'Mauritania'],
    ['Timbuktu', 'Mali'], ['Gao', 'Mali'], ['Kidal', 'Mali'], ['Agadez', 'Niger'], ['Niamey', 'Niger'],
    ['Zinder', 'Niger'], ["N'Djamena", 'Chad'], ['Faya-Largeau', 'Chad'], ['Abéché', 'Chad'],
    ['Sebha', 'Libya'], ['Ghat', 'Libya'], ['Tamanrasset', 'Algeria'], ['Ouargla', 'Algeria'],
    ['Dakhla', 'Western Sahara'], ['Laayoune', 'Western Sahara'],
    ['Lubumbashi', 'DR Congo'], ['Kolwezi', 'DR Congo'], ['Mbuji-Mayi', 'DR Congo'], ['Kisangani', 'DR Congo'],
    ['Kamina', 'DR Congo'], ['Ndola', 'Zambia'], ['Kitwe', 'Zambia'], ['Lusaka', 'Zambia'],
    ['Harare', 'Zimbabwe'], ['Bulawayo', 'Zimbabwe'], ['Windhoek', 'Namibia'], ['Walvis Bay', 'Namibia'],
    ['Gaborone', 'Botswana'], ['Francistown', 'Botswana'], ['Addis Ababa', 'Ethiopia'], ['Mekele', 'Ethiopia'],
    ['Dire Dawa', 'Ethiopia'], ['Juba', 'South Sudan'], ['Kampala', 'Uganda'], ['Kigali', 'Rwanda'],
    ['Mwanza', 'Tanzania'], ['Arusha', 'Tanzania'], ['Dar es Salaam', 'Tanzania'],
    ['Bamako', 'Mali'], ['Ouagadougou', 'Burkina Faso'], ['Conakry', 'Guinea'], ['Freetown', 'Sierra Leone'],
    ['Monrovia', 'Liberia'], ['Banjul', 'Gambia'], ['Bissau', 'Guinea-Bissau'], ['Dakar', 'Senegal'],
    ['Kumasi', 'Ghana'], ['Tamale', 'Ghana'], ['Abuja', 'Nigeria'], ['Kano', 'Nigeria'],
    ['Maiduguri', 'Nigeria'], ['Port Harcourt', 'Nigeria'], ['Douala', 'Cameroon'], ['Yaoundé', 'Cameroon'],
    ['Bangui', 'Central African Republic'], ['Brazzaville', 'Republic of the Congo'], ['Kinshasa', 'DR Congo'],
    ['Asmara', 'Eritrea'], ['Djibouti City', 'Djibouti'], ['Hargeisa', 'Somaliland'], ['Mogadishu', 'Somalia'],
    ['Nairobi', 'Kenya'], ['Mombasa', 'Kenya'], ['Kisumu', 'Kenya'], ['Eldoret', 'Kenya'],
    ['Dodoma', 'Tanzania'], ['Zanzibar', 'Tanzania'], ['Lilongwe', 'Malawi'], ['Blantyre', 'Malawi'],
    ['Beira', 'Mozambique'], ['Maputo', 'Mozambique'], ['Antananarivo', 'Madagascar'],
  ].map(([name, country]) => ({
    name,
    country,
    regionGroup: 'Africa / Sahara / Sahel / Central',
    subRegion: country,
    nodeType: STRATEGIC_NODE_TYPES.DESERT_LOGISTICS_NODE,
    continent: 'Africa',
  })),

  // Russia / Siberia / Central Asia
  ...[
    ['Murmansk', 'Russia'], ['Arkhangelsk', 'Russia'], ['Severodvinsk', 'Russia'], ['Naryan-Mar', 'Russia'],
    ['Vorkuta', 'Russia'], ['Salekhard', 'Russia'], ['Novy Urengoy', 'Russia'], ['Noyabrsk', 'Russia'],
    ['Norilsk', 'Russia'], ['Dudinka', 'Russia'], ['Igarka', 'Russia'], ['Tiksi', 'Russia'],
    ['Yakutsk', 'Russia'], ['Mirny', 'Russia'], ['Lensk', 'Russia'], ['Neryungri', 'Russia'],
    ['Magadan', 'Russia'], ['Anadyr', 'Russia'], ['Pevek', 'Russia'], ['Petropavlovsk-Kamchatsky', 'Russia'],
    ['Irkutsk', 'Russia'], ['Ulan-Ude', 'Russia'], ['Chita', 'Russia'], ['Krasnoyarsk', 'Russia'],
    ['Bratsk', 'Russia'], ['Khabarovsk', 'Russia'], ['Vladivostok', 'Russia'],
    ['Ulaanbaatar', 'Mongolia'], ['Darkhan', 'Mongolia'], ['Erdenet', 'Mongolia'], ['Dalanzadgad', 'Mongolia'],
    ['Khovd', 'Mongolia'], ['Astana', 'Kazakhstan'], ['Almaty', 'Kazakhstan'], ['Karaganda', 'Kazakhstan'],
    ['Atyrau', 'Kazakhstan'], ['Aktobe', 'Kazakhstan'], ['Oskemen', 'Kazakhstan'],
    ['Bishkek', 'Kyrgyzstan'], ['Osh', 'Kyrgyzstan'], ['Tashkent', 'Uzbekistan'], ['Samarkand', 'Uzbekistan'],
    ['Bukhara', 'Uzbekistan'], ['Nukus', 'Uzbekistan'], ['Dushanbe', 'Tajikistan'], ['Khujand', 'Tajikistan'],
    ['Ashgabat', 'Turkmenistan'], ['Mary', 'Turkmenistan'], ['Türkmenabat', 'Turkmenistan'],
  ].map(([name, country]) => ({
    name,
    country,
    regionGroup: 'Russia / Siberia / Central Asia',
    subRegion: country,
    nodeType:
      country === 'Russia' || country === 'Mongolia'
        ? STRATEGIC_NODE_TYPES.ARCTIC_LOGISTICS_NODE
        : STRATEGIC_NODE_TYPES.REMOTE_CARGO_NODE,
    continent: 'Asia',
  })),

  // Himalayas / remote interior Asia
  ...[
    ['Kathmandu', 'Nepal'], ['Pokhara', 'Nepal'], ['Biratnagar', 'Nepal'],
    ['Lhasa', 'Tibet'], ['Shigatse', 'Tibet'], ['Leh', 'India'], ['Srinagar', 'India'],
    ['Shimla', 'India'], ['Dharamshala', 'India'], ['Dehradun', 'India'], ['Gangtok', 'India'],
    ['Thimphu', 'Bhutan'], ['Paro', 'Bhutan'], ['Guwahati', 'India'], ['Shillong', 'India'],
    ['Imphal', 'India'], ['Aizawl', 'India'], ['Ürümqi', 'China'], ['Kashgar', 'China'],
    ['Hotan', 'China'], ['Aksu', 'China'], ['Dunhuang', 'China'], ['Lanzhou', 'China'],
    ['Xining', 'China'], ['Yinchuan', 'China'], ['Hohhot', 'China'],
  ].map(([name, country]) => ({
    name,
    country,
    regionGroup: 'Himalayas / Remote Interior Asia',
    subRegion: country,
    nodeType: STRATEGIC_NODE_TYPES.REMOTE_STRATEGIC_NODE,
    continent: 'Asia',
  })),

  // Southeast Asia
  ...[
    ['Chiang Mai', 'Thailand'], ['Vientiane', 'Laos'], ['Luang Prabang', 'Laos'],
    ['Mandalay', 'Myanmar'], ['Yangon', 'Myanmar'], ['Phnom Penh', 'Cambodia'], ['Siem Reap', 'Cambodia'],
    ['Ho Chi Minh City', 'Vietnam'], ['Da Nang', 'Vietnam'], ['Hanoi', 'Vietnam'],
    ['Medan', 'Indonesia'], ['Padang', 'Indonesia'], ['Palembang', 'Indonesia'], ['Pekanbaru', 'Indonesia'],
    ['Pontianak', 'Indonesia'], ['Balikpapan', 'Indonesia'], ['Samarinda', 'Indonesia'],
    ['Makassar', 'Indonesia'], ['Manado', 'Indonesia'],
    ['Davao', 'Philippines'], ['Cebu', 'Philippines'], ['Cagayan de Oro', 'Philippines'], ['Zamboanga', 'Philippines'],
  ].map(([name, country]) => ({
    name,
    country,
    regionGroup: 'Southeast Asia / Remote Interior',
    subRegion: country,
    nodeType: STRATEGIC_NODE_TYPES.RAINFOREST_ACCESS_NODE,
    continent: 'Southeast Asia',
  })),

  // Australia / Outback
  ...[
    ['Alice Springs', 'Australia'], ['Yulara', 'Australia'], ['Tennant Creek', 'Australia'],
    ['Katherine', 'Australia'], ['Darwin', 'Australia'], ['Mount Isa', 'Australia'], ['Longreach', 'Australia'],
    ['Charleville', 'Australia'], ['Birdsville', 'Australia'], ['Winton', 'Australia'], ['Cloncurry', 'Australia'],
    ['Emerald', 'Australia'], ['Broken Hill', 'Australia'], ['Cobar', 'Australia'], ['Lightning Ridge', 'Australia'],
    ['Dubbo', 'Australia'], ['Coober Pedy', 'Australia'], ['Port Augusta', 'Australia'], ['Whyalla', 'Australia'],
    ['Roxby Downs', 'Australia'], ['Olympic Dam', 'Australia'], ['Kalgoorlie', 'Australia'], ['Esperance', 'Australia'],
    ['Geraldton', 'Australia'], ['Carnarvon', 'Australia'], ['Exmouth', 'Australia'], ['Karratha', 'Australia'],
    ['Port Hedland', 'Australia'], ['Newman', 'Australia'], ['Tom Price', 'Australia'], ['Broome', 'Australia'],
    ['Derby', 'Australia'], ['Kununurra', 'Australia'], ['Halls Creek', 'Australia'], ['Fitzroy Crossing', 'Australia'],
    ['Cairns', 'Australia'], ['Townsville', 'Australia'], ['Mackay', 'Australia'], ['Rockhampton', 'Australia'],
    ['Toowoomba', 'Australia'],
  ].map(([name, country]) => ({
    name,
    country,
    regionGroup: 'Australia / Outback',
    subRegion: 'Australia',
    nodeType: STRATEGIC_NODE_TYPES.OUTBACK_RESOURCE_NODE,
    continent: 'Oceania',
  })),

  // Pacific / Islands
  ...[
    ['Papeete', 'French Polynesia'], ['Nouméa', 'New Caledonia'], ['Suva', 'Fiji'], ['Nadi', 'Fiji'],
    ['Apia', 'Samoa'], ['Pago Pago', 'American Samoa'], ['Honiara', 'Solomon Islands'], ['Port Vila', 'Vanuatu'],
    ['Port Moresby', 'Papua New Guinea'], ['Lae', 'Papua New Guinea'], ['Jayapura', 'Indonesia'],
    ['Sorong', 'Indonesia'], ['Ambon', 'Indonesia'], ['Kupang', 'Indonesia'], ['Dili', 'Timor-Leste'],
    ['Tarawa', 'Kiribati'], ['Majuro', 'Marshall Islands'], ['Palikir', 'Micronesia'], ['Koror', 'Palau'],
    ['Nukuʻalofa', 'Tonga'], ['Avarua', 'Cook Islands'],
  ].map(([name, country]) => ({
    name,
    country,
    regionGroup: 'Pacific Islands / Strategic Access',
    subRegion: country,
    nodeType: STRATEGIC_NODE_TYPES.ISLAND_ACCESS_NODE,
    continent: 'Oceania',
  })),
];

export const REGION_GROUPS = [
  'North America / Arctic',
  'Greenland / North Atlantic',
  'South America / Amazon / Andes',
  'Africa / Sahara / Sahel / Central',
  'Russia / Siberia / Central Asia',
  'Himalayas / Remote Interior Asia',
  'Southeast Asia / Remote Interior',
  'Australia / Outback',
  'Pacific Islands / Strategic Access',
];
