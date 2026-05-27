#!/usr/bin/env node
/**
 * Pull economic + geographic data for world-cities.csv
 *
 * Sources:
 * - GeoNames cities15000 (lat/lon, population by geonameid)
 * - GeoNames countryInfo (country name → ISO2)
 * - World Bank Open Data (GDP, country population, GDP per capita)
 *
 * Outputs:
 * - src/data/economics/country-economics.json
 * - src/data/economics/city-economics-by-geonameid.json
 * - src/data/economics/enrichment-meta.json
 *
 * Run: npm run enrich:economic
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  fetchCountryIndicators,
  fetchWorldBankCountries,
  WB_INDICATORS,
} from './lib/worldBankClient.mjs';
import {
  ensureCities15000,
  ensureCountryInfo,
  parseCountryInfo,
  parseGeonameCitiesTsv,
} from './lib/geonamesDump.mjs';
import { buildCountryIndex, resolveIso2 } from './lib/countryNameMatch.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CACHE = path.join(ROOT, 'scripts', 'cache', 'geonames');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'economics');
const CSV_PATH = path.join(ROOT, 'src', 'data', 'world-cities.csv');

function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) {
      fields.push(cur);
      cur = '';
    } else cur += ch;
  }
  fields.push(cur);
  return fields;
}

function parseWorldCitiesCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const [name, country, subcountry, geonameidStr] = parseCsvLine(lines[i]);
    if (!name?.trim()) continue;
    rows.push({
      name: name.trim(),
      country: (country || '').trim(),
      subcountry: (subcountry || '').trim(),
      geonameid: Number.parseInt(geonameidStr, 10),
    });
  }
  return rows;
}

function estimateBusinessTravelers(population, gdpPerCapita) {
  if (!population) return 0;
  const base = population * 0.0008;
  const incomeFactor = gdpPerCapita ? Math.min(2.5, Math.sqrt(gdpPerCapita / 15000)) : 1;
  return Math.round(base * incomeFactor);
}

function proxyRegulatoryEase(gdpPerCapita, incomeLevel) {
  if (gdpPerCapita) return Math.min(0.98, Math.max(0.35, Math.log10(gdpPerCapita) / 5));
  const map = {
    'High income': 0.9,
    'Upper middle income': 0.75,
    'Lower middle income': 0.6,
    'Low income': 0.45,
  };
  return map[incomeLevel] ?? 0.55;
}

function proxyStability(region, incomeLevel) {
  const unstable = /sub-saharan|middle east|conflict/i;
  let s = incomeLevel === 'High income' ? 0.88 : incomeLevel === 'Low income' ? 0.58 : 0.72;
  if (unstable.test(region || '')) s -= 0.12;
  return Math.min(0.95, Math.max(0.4, s));
}

function estimateAirportCapacity(population) {
  if (!population) return 100;
  return Math.min(1500, Math.max(80, Math.round(Math.sqrt(population) * 0.35)));
}

async function main() {
  console.log('=== Economic enrichment ===\n');

  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const worldCities = parseWorldCitiesCsv(csvText);
  console.log(`World cities in CSV: ${worldCities.length}`);

  const countryInfoPath = await ensureCountryInfo(CACHE);
  const countryInfoRows = parseCountryInfo(fs.readFileSync(countryInfoPath, 'utf8'));
  const countryIndex = buildCountryIndex(countryInfoRows);
  const countryInfoByIso2 = new Map(countryInfoRows.map((r) => [r.iso2, r]));

  const citiesPath = await ensureCities15000(CACHE);
  const geonameMap = parseGeonameCitiesTsv(fs.readFileSync(citiesPath, 'utf8'));
  console.log(`GeoNames cities15000 records: ${geonameMap.size}`);

  console.log('Fetching World Bank indicators…');
  const wbCountries = await fetchWorldBankCountries();
  const wbIndicators = await fetchCountryIndicators(
    [
      WB_INDICATORS.gdpCurrentUsd,
      WB_INDICATORS.population,
      WB_INDICATORS.gdpPerCapita,
      WB_INDICATORS.urbanPopulationPct,
    ],
    { date: '2020:2024' }
  );

  const countryEconomics = {};
  for (const [iso2, indicators] of wbIndicators) {
    const meta = wbCountries.get(iso2) ?? {};
    const info = countryInfoByIso2.get(iso2);
    countryEconomics[iso2] = {
      iso2,
      name: meta.name ?? info?.name ?? iso2,
      region: meta.region ?? '',
      incomeLevel: meta.incomeLevel ?? '',
      gdpCurrentUsd: indicators[WB_INDICATORS.gdpCurrentUsd] ?? null,
      population: indicators[WB_INDICATORS.population] ?? info?.population ?? null,
      gdpPerCapitaUsd: indicators[WB_INDICATORS.gdpPerCapita] ?? null,
      urbanPopulationPct: indicators[WB_INDICATORS.urbanPopulationPct] ?? null,
    };
  }

  const cityByGeoname = {};
  let matchedGeoname = 0;
  let matchedCountry = 0;
  const unmatchedCountries = new Set();

  for (const city of worldCities) {
    if (!Number.isFinite(city.geonameid)) continue;
    const gn = geonameMap.get(city.geonameid);
    const iso2 = resolveIso2(city.country, countryIndex) ?? gn?.countryCode ?? null;
    const country = iso2 ? countryEconomics[iso2] : null;
    if (gn) matchedGeoname++;
    if (country) matchedCountry++;
    else if (city.country) unmatchedCountries.add(city.country);

    const cityPop = gn?.population || 0;
    const countryPop = country?.population || 0;
    const countryGdp = country?.gdpCurrentUsd || 0;
    const gdpPerCapita = country?.gdpPerCapitaUsd ?? null;

    const cityGdpEstimate =
      cityPop && countryPop && countryGdp
        ? Math.round(countryGdp * (cityPop / countryPop))
        : null;

    const regulatoryEase = proxyRegulatoryEase(gdpPerCapita, country?.incomeLevel);
    const geopoliticalStability = proxyStability(country?.region, country?.incomeLevel);

    cityByGeoname[String(city.geonameid)] = {
      geonameid: city.geonameid,
      latitude: gn?.latitude ?? null,
      longitude: gn?.longitude ?? null,
      population: cityPop || null,
      countryIso2: iso2,
      gdpEstimateUsd: cityGdpEstimate,
      gdpPerCapitaUsd: gdpPerCapita,
      businessTravelers: estimateBusinessTravelers(cityPop, gdpPerCapita),
      airportCapacity: estimateAirportCapacity(cityPop),
      regulatoryEase,
      geopoliticalStability,
      hasCoordinates: gn?.latitude != null && gn?.longitude != null,
      dataSource: {
        coords: gn ? 'geonames-cities15000' : null,
        economics: country ? 'world-bank-2020-2024' : null,
      },
    };
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, 'country-economics.json'),
    JSON.stringify(countryEconomics, null, 0)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'city-economics-by-geonameid.json'),
    JSON.stringify(cityByGeoname, null, 0)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'enrichment-meta.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        worldCityCount: worldCities.length,
        geonameMatched: matchedGeoname,
        countryEconomicMatched: matchedCountry,
        countryCount: Object.keys(countryEconomics).length,
        unmatchedCountrySamples: [...unmatchedCountries].slice(0, 30),
        sources: [
          'https://download.geonames.org/export/dump/cities15000.zip',
          'https://download.geonames.org/export/dump/countryInfo.txt',
          'https://data.worldbank.org/',
        ],
      },
      null,
      2
    )
  );

  console.log(`\nGeoNames match: ${matchedGeoname}/${worldCities.length}`);
  console.log(`Country economics match: ${matchedCountry}/${worldCities.length}`);
  console.log(`Countries in World Bank set: ${Object.keys(countryEconomics).length}`);
  if (unmatchedCountries.size) {
    console.log(`Unmatched country labels (sample): ${[...unmatchedCountries].slice(0, 8).join(', ')}`);
  }
  console.log(`\nWrote ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
