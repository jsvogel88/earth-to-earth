/**
 * Verified coordinates for global coverage seeds missing from GeoNames auto-match,
 * plus corrections where cities15000 name collisions picked the wrong place.
 * Keys are normalizeCityKey(name). Not used for world-cities.csv bulk render.
 */

/** @type {Record<string, { lat: number, lon: number, country: string, continent: string }>} */
export const GLOBAL_COVERAGE_MANUAL_COORDS = {
  // GeoNames collision fixes
  'santa fe': { lat: 35.687, lon: -105.9378, country: 'USA', continent: 'North America' },
  'la paz': { lat: -16.5, lon: -68.15, country: 'Bolivia', continent: 'South America' },
  blantyre: { lat: -15.786, lon: 35.0058, country: 'Malawi', continent: 'Africa' },
  chita: { lat: 52.033, lon: 113.5, country: 'Russia', continent: 'Asia' },
  exmouth: { lat: -21.933, lon: 114.128, country: 'Australia', continent: 'Oceania' },
  derby: { lat: -17.303, lon: 123.628, country: 'Australia', continent: 'Oceania' },

  // North America / Arctic
  utqiagvik: { lat: 71.2906, lon: -156.7886, country: 'USA', continent: 'North America' },
  bethel: { lat: 60.7922, lon: -161.7558, country: 'USA', continent: 'North America' },
  kotzebue: { lat: 66.8983, lon: -162.5964, country: 'USA', continent: 'North America' },
  kodiak: { lat: 57.79, lon: -152.4072, country: 'USA', continent: 'North America' },
  iqaluit: { lat: 63.7467, lon: -68.517, country: 'Canada', continent: 'North America' },
  inuvik: { lat: 68.3607, lon: -133.723, country: 'Canada', continent: 'North America' },
  'rankin inlet': { lat: 62.809, lon: -92.085, country: 'Canada', continent: 'North America' },
  'cambridge bay': { lat: 69.117, lon: -105.059, country: 'Canada', continent: 'North America' },
  churchill: { lat: 58.768, lon: -94.165, country: 'Canada', continent: 'North America' },
  thompson: { lat: 55.743, lon: -97.855, country: 'Canada', continent: 'North America' },

  // Greenland
  sisimiut: { lat: 66.939, lon: -53.673, country: 'Greenland', continent: 'North America' },
  ilulissat: { lat: 69.22, lon: -51.1, country: 'Greenland', continent: 'North America' },
  kangerlussuaq: { lat: 67.008, lon: -50.689, country: 'Greenland', continent: 'North America' },
  qaqortoq: { lat: 60.719, lon: -46.035, country: 'Greenland', continent: 'North America' },
  aasiaat: { lat: 68.71, lon: -52.869, country: 'Greenland', continent: 'North America' },
  tasiilaq: { lat: 65.614, lon: -37.636, country: 'Greenland', continent: 'North America' },
  narsarsuaq: { lat: 61.16, lon: -45.426, country: 'Greenland', continent: 'North America' },
  upernavik: { lat: 72.786, lon: -56.154, country: 'Greenland', continent: 'North America' },
  qaanaaq: { lat: 77.467, lon: -69.228, country: 'Greenland', continent: 'North America' },
  ittoqqortoormiit: { lat: 70.485, lon: -21.966, country: 'Greenland', continent: 'North America' },

  // South America
  'el alto': { lat: -16.504, lon: -68.163, country: 'Bolivia', continent: 'South America' },
  uyuni: { lat: -20.46, lon: -66.825, country: 'Bolivia', continent: 'South America' },
  bariloche: { lat: -41.133, lon: -71.308, country: 'Argentina', continent: 'South America' },

  // Africa
  sebha: { lat: 27.037, lon: 14.428, country: 'Libya', continent: 'Africa' },
  ghat: { lat: 24.965, lon: 10.172, country: 'Libya', continent: 'Africa' },
  tamanrasset: { lat: 22.785, lon: 5.522, country: 'Algeria', continent: 'Africa' },
  mekele: { lat: 13.496, lon: 39.475, country: 'Ethiopia', continent: 'Africa' },
  'djibouti city': { lat: 11.588, lon: 43.145, country: 'Djibouti', continent: 'Africa' },
  hargeisa: { lat: 9.56, lon: 44.065, country: 'Somaliland', continent: 'Africa' },

  // Russia / Central Asia
  arkhangelsk: { lat: 64.539, lon: 40.515, country: 'Russia', continent: 'Asia' },
  'naryan-mar': { lat: 67.638, lon: 53.006, country: 'Russia', continent: 'Asia' },
  'novy urengoy': { lat: 66.083, lon: 76.633, country: 'Russia', continent: 'Asia' },
  igarka: { lat: 67.437, lon: 86.581, country: 'Russia', continent: 'Asia' },
  tiksi: { lat: 71.687, lon: 128.869, country: 'Russia', continent: 'Asia' },
  pevek: { lat: 69.703, lon: 170.299, country: 'Russia', continent: 'Asia' },
  ulaanbaatar: { lat: 47.886, lon: 106.905, country: 'Mongolia', continent: 'Asia' },
  darkhan: { lat: 49.487, lon: 105.922, country: 'Mongolia', continent: 'Asia' },
  dalanzadgad: { lat: 43.57, lon: 104.425, country: 'Mongolia', continent: 'Asia' },
  karaganda: { lat: 49.804, lon: 73.109, country: 'Kazakhstan', continent: 'Asia' },
  oskemen: { lat: 49.948, lon: 82.628, country: 'Kazakhstan', continent: 'Asia' },

  // Himalayas / China
  shigatse: { lat: 29.267, lon: 88.881, country: 'Tibet', continent: 'Asia' },
  dharamshala: { lat: 32.219, lon: 76.323, country: 'India', continent: 'Asia' },
  paro: { lat: 27.43, lon: 89.413, country: 'Bhutan', continent: 'Asia' },
  hotan: { lat: 37.114, lon: 79.922, country: 'China', continent: 'Asia' },

  // Southeast Asia / Pacific
  cebu: { lat: 10.315, lon: 123.885, country: 'Philippines', continent: 'Southeast Asia' },

  // Australia outback
  yulara: { lat: -25.24, lon: 130.983, country: 'Australia', continent: 'Oceania' },
  'tennant creek': { lat: -19.647, lon: 134.191, country: 'Australia', continent: 'Oceania' },
  katherine: { lat: -14.465, lon: 132.263, country: 'Australia', continent: 'Oceania' },
  longreach: { lat: -23.442, lon: 144.249, country: 'Australia', continent: 'Oceania' },
  charleville: { lat: -26.404, lon: 146.238, country: 'Australia', continent: 'Oceania' },
  birdsville: { lat: -25.898, lon: 139.352, country: 'Australia', continent: 'Oceania' },
  winton: { lat: -22.391, lon: 143.041, country: 'Australia', continent: 'Oceania' },
  cloncurry: { lat: -20.705, lon: 140.505, country: 'Australia', continent: 'Oceania' },
  emerald: { lat: -23.527, lon: 148.157, country: 'Australia', continent: 'Oceania' },
  cobar: { lat: -31.496, lon: 145.84, country: 'Australia', continent: 'Oceania' },
  'lightning ridge': { lat: -29.427, lon: 147.978, country: 'Australia', continent: 'Oceania' },
  'coober pedy': { lat: -29.013, lon: 134.754, country: 'Australia', continent: 'Oceania' },
  'port augusta': { lat: -32.492, lon: 137.766, country: 'Australia', continent: 'Oceania' },
  whyalla: { lat: -33.034, lon: 137.561, country: 'Australia', continent: 'Oceania' },
  'roxby downs': { lat: -30.485, lon: 136.877, country: 'Australia', continent: 'Oceania' },
  'olympic dam': { lat: -30.44, lon: 136.872, country: 'Australia', continent: 'Oceania' },
  esperance: { lat: -33.861, lon: 121.891, country: 'Australia', continent: 'Oceania' },
  carnarvon: { lat: -24.867, lon: 113.657, country: 'Australia', continent: 'Oceania' },
  karratha: { lat: -20.736, lon: 116.846, country: 'Australia', continent: 'Oceania' },
  newman: { lat: -23.357, lon: 119.733, country: 'Australia', continent: 'Oceania' },
  'tom price': { lat: -22.694, lon: 117.795, country: 'Australia', continent: 'Oceania' },
  broome: { lat: -17.961, lon: 122.236, country: 'Australia', continent: 'Oceania' },
  kununurra: { lat: -15.773, lon: 128.738, country: 'Australia', continent: 'Oceania' },
  'halls creek': { lat: -18.227, lon: 127.663, country: 'Australia', continent: 'Oceania' },
  'fitzroy crossing': { lat: -18.194, lon: 125.571, country: 'Australia', continent: 'Oceania' },
  'port vila': { lat: -17.733, lon: 168.327, country: 'Vanuatu', continent: 'Oceania' },
  koror: { lat: 7.341, lon: 134.478, country: 'Palau', continent: 'Oceania' },
  nukualofa: { lat: -21.139, lon: -175.201, country: 'Tonga', continent: 'Oceania' },
  'nukuʻalofa': { lat: -21.139, lon: -175.201, country: 'Tonga', continent: 'Oceania' },

  // Planetary continental spines
  dakar: { lat: 14.7167, lon: -17.4674, country: 'Senegal', continent: 'Africa' },
  warsaw: { lat: 52.2297, lon: 21.0122, country: 'Poland', continent: 'Europe' },
  kyiv: { lat: 50.4501, lon: 30.5234, country: 'Ukraine', continent: 'Europe' },
  kiev: { lat: 50.4501, lon: 30.5234, country: 'Ukraine', continent: 'Europe' },
  moscow: { lat: 55.7558, lon: 37.6173, country: 'Russia', continent: 'Europe' },
  kazan: { lat: 55.7963, lon: 49.1088, country: 'Russia', continent: 'Asia' },
  yekaterinburg: { lat: 56.8389, lon: 60.6057, country: 'Russia', continent: 'Asia' },
  novosibirsk: { lat: 55.0084, lon: 82.9357, country: 'Russia', continent: 'Asia' },
  krasnoyarsk: { lat: 56.0153, lon: 92.8932, country: 'Russia', continent: 'Asia' },
  irkutsk: { lat: 52.2869, lon: 104.305, country: 'Russia', continent: 'Asia' },
  ushuaia: { lat: -54.8019, lon: -68.303, country: 'Argentina', continent: 'South America' },
  'punta arenas': { lat: -53.1638, lon: -70.9171, country: 'Chile', continent: 'South America' },
  manaus: { lat: -3.119, lon: -60.0217, country: 'Brazil', continent: 'South America' },
  kinshasa: { lat: -4.4419, lon: 15.2663, country: 'DR Congo', continent: 'Africa' },
  bangalore: { lat: 12.9716, lon: 77.5946, country: 'India', continent: 'South Asia' },
  'kuala lumpur': { lat: 3.139, lon: 101.6869, country: 'Malaysia', continent: 'Southeast Asia' },
  perth: { lat: -31.9505, lon: 115.8605, country: 'Australia', continent: 'Oceania' },
  kalgoorlie: { lat: -30.7489, lon: 121.4658, country: 'Australia', continent: 'Oceania' },
  'alice springs': { lat: -23.698, lon: 133.8807, country: 'Australia', continent: 'Oceania' },
  urumqi: { lat: 43.8256, lon: 87.6168, country: 'China', continent: 'Asia' },
  almaty: { lat: 43.222, lon: 76.8512, country: 'Kazakhstan', continent: 'Asia' },
  tashkent: { lat: 41.2995, lon: 69.2401, country: 'Uzbekistan', continent: 'Asia' },
  ankara: { lat: 39.9334, lon: 32.8597, country: 'Turkey', continent: 'Europe' },
  nuuk: { lat: 64.1835, lon: -51.7216, country: 'Greenland', continent: 'North America' },
  reykjavik: { lat: 64.1466, lon: -21.9426, country: 'Iceland', continent: 'Europe' },
  'reykjavík': { lat: 64.1466, lon: -21.9426, country: 'Iceland', continent: 'Europe' },
  'addis ababa': { lat: 9.032, lon: 38.7578, country: 'Ethiopia', continent: 'Africa' },
};
