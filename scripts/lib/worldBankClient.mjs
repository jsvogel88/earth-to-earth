/**
 * World Bank Open Data API (no key required).
 * https://data.worldbank.org/
 */

const BASE = 'https://api.worldbank.org/v2';

export async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`World Bank ${res.status}: ${url}`);
  return res.json();
}

/** @returns {Map<string, { iso2: string, iso3: string, name: string, region: string, incomeLevel: string }>} */
export async function fetchWorldBankCountries() {
  const data = await fetchJson(`${BASE}/country?format=json&per_page=400`);
  const rows = data[1] ?? [];
  const map = new Map();
  for (const c of rows) {
    if (!c.id || c.id.length > 3) continue;
    map.set(c.id, {
      iso2: c.id,
      iso3: c.id,
      name: c.name,
      region: c.region?.value ?? '',
      incomeLevel: c.incomeLevel?.value ?? '',
    });
  }
  return map;
}

/**
 * Latest value per country for indicators.
 * @param {string[]} indicatorIds e.g. NY.GDP.MKTP.CD, SP.POP.TOTL
 * @returns {Promise<Map<string, Record<string, number|null>>>} iso2 -> { indicatorId: value }
 */
export async function fetchCountryIndicators(indicatorIds, { date = '2020:2024' } = {}) {
  const idParam = indicatorIds.join(';');
  const url = `${BASE}/country/all/indicator/${idParam}?format=json&date=${date}&per_page=20000`;
  const data = await fetchJson(url);
  const rows = data[1] ?? [];
  const byCountry = new Map();

  for (const row of rows) {
    const iso2 = row.country?.id ?? row.countryiso3code;
    if (!iso2 || iso2.length > 3) continue;
    const ind = row.indicator?.id;
    const val = row.value != null ? Number(row.value) : null;
    if (!byCountry.has(iso2)) byCountry.set(iso2, {});
    const bucket = byCountry.get(iso2);
    if (val != null && (bucket[ind] == null || row.date > (bucket._dates?.[ind] ?? ''))) {
      bucket[ind] = val;
      bucket._dates = bucket._dates ?? {};
      bucket._dates[ind] = row.date;
    }
  }

  for (const bucket of byCountry.values()) delete bucket._dates;
  return byCountry;
}

export const WB_INDICATORS = {
  gdpCurrentUsd: 'NY.GDP.MKTP.CD',
  population: 'SP.POP.TOTL',
  gdpPerCapita: 'NY.GDP.PCAP.CD',
  urbanPopulationPct: 'SP.URB.TOTL.IN.ZS',
};
