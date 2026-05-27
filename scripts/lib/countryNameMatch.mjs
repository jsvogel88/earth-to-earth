/**
 * Map world-cities.csv country strings → ISO-3166 alpha-2
 */

const ALIASES = {
  'united states': 'US',
  'united states of america': 'US',
  'united kingdom': 'GB',
  'russia': 'RU',
  'russian federation': 'RU',
  'south korea': 'KR',
  'korea, republic of': 'KR',
  'north korea': 'KP',
  "korea, democratic people's republic of": 'KP',
  'vietnam': 'VN',
  'viet nam': 'VN',
  'iran': 'IR',
  'iran, islamic republic of': 'IR',
  'syria': 'SY',
  'syrian arab republic': 'SY',
  'tanzania': 'TZ',
  'tanzania, united republic of': 'TZ',
  'venezuela': 'VE',
  'venezuela, bolivarian republic of': 'VE',
  'bolivia': 'BO',
  'bolivia, plurinational state of': 'BO',
  'moldova': 'MD',
  'moldova, republic of': 'MD',
  'laos': 'LA',
 "lao people's democratic republic": 'LA',
  'brunei': 'BN',
  'brunei darussalam': 'BN',
  'czechia': 'CZ',
  'czech republic': 'CZ',
  'eswatini': 'SZ',
  swaziland: 'SZ',
  'north macedonia': 'MK',
  macedonia: 'MK',
  'côte d\'ivoire': 'CI',
  "cote d'ivoire": 'CI',
  'ivory coast': 'CI',
  'hong kong': 'HK',
  macao: 'MO',
  macau: 'MO',
  palestine: 'PS',
  taiwan: 'TW',
  'taiwan, province of china': 'TW',
};

export function normalizeCountryLabel(country) {
  return String(country || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** @param {Array<{ iso2: string, name: string }>} countryInfoRows */
export function buildCountryIndex(countryInfoRows) {
  const byName = new Map();
  for (const row of countryInfoRows) {
    if (!row.iso2 || row.iso2.startsWith('#')) continue;
    const key = normalizeCountryLabel(row.name);
    byName.set(key, row.iso2);
    byName.set(normalizeCountryLabel(row.iso2), row.iso2);
  }
  for (const [alias, iso2] of Object.entries(ALIASES)) {
    byName.set(alias, iso2);
  }
  return byName;
}

export function resolveIso2(countryLabel, countryIndex) {
  const key = normalizeCountryLabel(countryLabel);
  if (countryIndex.has(key)) return countryIndex.get(key);
  for (const [name, iso2] of countryIndex) {
    if (key.includes(name) || name.includes(key)) return iso2;
  }
  return ALIASES[key] ?? null;
}
