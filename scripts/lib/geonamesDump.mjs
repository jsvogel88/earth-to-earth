/**
 * GeoNames bulk dumps (free, attribution required).
 * https://download.geonames.org/export/dump/
 */

import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import { createGunzip } from 'zlib';
import { execSync } from 'child_process';

const GEONAMES_BASE = 'https://download.geonames.org/export/dump';

export async function downloadToFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

/** Parse GeoNames countryInfo.txt (tab-separated, # comments). */
export function parseCountryInfo(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const cols = line.split('\t');
    if (cols.length < 5) continue;
    rows.push({
      iso2: cols[0],
      iso3: cols[1],
      isoNumeric: cols[2],
      fips: cols[3],
      name: cols[4],
      capital: cols[5],
      areaSqKm: Number(cols[6]) || null,
      population: Number(cols[7]) || null,
      continent: cols[8],
    });
  }
  return rows;
}

/** Parse cities15000.txt / geoname dump (tab-separated). */
export function parseGeonameCitiesTsv(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    const c = line.split('\t');
    if (c.length < 15) continue;
    const geonameid = Number.parseInt(c[0], 10);
    if (!Number.isFinite(geonameid)) continue;
    map.set(geonameid, {
      geonameid,
      name: c[1],
      latitude: Number.parseFloat(c[4]),
      longitude: Number.parseFloat(c[5]),
      featureClass: c[6],
      featureCode: c[7],
      countryCode: c[8],
      admin1: c[10],
      population: Number.parseInt(c[14], 10) || 0,
    });
  }
  return map;
}

export async function ensureCities15000(cacheDir) {
  const zipPath = path.join(cacheDir, 'cities15000.zip');
  const txtPath = path.join(cacheDir, 'cities15000.txt');

  if (!fs.existsSync(txtPath)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    if (!fs.existsSync(zipPath)) {
      console.log('Downloading GeoNames cities15000.zip…');
      await downloadToFile(`${GEONAMES_BASE}/cities15000.zip`, zipPath);
    }
    console.log('Extracting cities15000.zip…');
    if (process.platform === 'win32') {
      execSync(
        `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${cacheDir.replace(/'/g, "''")}' -Force"`,
        { stdio: 'inherit' }
      );
    } else {
      execSync(`unzip -o "${zipPath}" -d "${cacheDir}"`, { stdio: 'inherit' });
    }
  }

  if (!fs.existsSync(txtPath)) {
    throw new Error(`Expected ${txtPath} after extract`);
  }
  return txtPath;
}

export async function ensureCountryInfo(cacheDir) {
  const dest = path.join(cacheDir, 'countryInfo.txt');
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log('Downloading GeoNames countryInfo.txt…');
    await downloadToFile(`${GEONAMES_BASE}/countryInfo.txt`, dest);
  }
  return dest;
}
