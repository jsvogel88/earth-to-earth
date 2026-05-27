import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GLOBAL_COVERAGE_SEEDS } from '../src/data/globalCoverageRegions.js';
import { normalizeCityKey, PHASE1_MANUAL_COORDS } from '../src/data/hyperloopPhase1Coordinates.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const geoPath = join(process.env.TEMP || '/tmp', 'cities15000.txt');
const lines = readFileSync(geoPath, 'utf8').split(/\r?\n/).filter(Boolean);
const byName = new Map();

for (const line of lines) {
  const p = line.split('\t');
  const lat = Number(p[4]);
  const lon = Number(p[5]);
  if (!Number.isFinite(lat)) continue;
  const keys = [normalizeCityKey(p[1]), normalizeCityKey(p[2])];
  for (const k of keys) {
    if (!k || byName.has(k)) continue;
    byName.set(k, { lat, lon, name: p[1] });
  }
}

const ALIASES = {
  "n'djamena": 'ndjamena',
  'n’djamena': 'ndjamena',
  reykjavík: 'reykjavik',
  'tórshavn': 'torshavn',
  ürümqi: 'urumqi',
  'nukuʻalofa': 'nukualofa',
  belém: 'belem',
  santarém: 'santarem',
  yaoundé: 'yaounde',
  córdoba: 'cordoba',
  copiapó: 'copiapo',
  neuquén: 'neuquen',
  'río gallegos': 'rio gallegos',
  nouméa: 'noumea',
  astana: 'astana',
};

const out = {};
let matched = 0;
let manual = 0;
const missing = [];

for (const seed of GLOBAL_COVERAGE_SEEDS) {
  const key = normalizeCityKey(seed.name);
  const alias = ALIASES[key] || key;
  if (PHASE1_MANUAL_COORDS[key] || PHASE1_MANUAL_COORDS[alias]) {
    manual += 1;
    continue;
  }
  const g = byName.get(key) || byName.get(alias);
  if (g) {
    out[key] = {
      name: seed.name,
      lat: g.lat,
      lon: g.lon,
      country: seed.country,
      continent: seed.continent,
    };
    matched += 1;
  } else {
    missing.push(seed.name);
  }
}

writeFileSync(join(root, 'src/data/globalCoverageCoordinates.json'), JSON.stringify(out, null, 0));

console.log(
  JSON.stringify({
    seeds: GLOBAL_COVERAGE_SEEDS.length,
    geoMatched: matched,
    alreadyManual: manual,
    missing: missing.length,
    missingSample: missing.slice(0, 30),
  })
);
