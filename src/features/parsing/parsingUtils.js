/**
 * Input cleanup for bulk city paste — no graph or route side effects.
 */

const INVALID_LINE_CHARS = /[^\p{L}\p{N}\s,.\-''()&]/gu;

/**
 * Trim, collapse whitespace, strip control chars.
 * @param {string} raw
 */
export function cleanRawInput(raw) {
  return String(raw || '')
    .replace(/\r\n/g, '\n')
    .replace(/\uFEFF/g, '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .trim();
}

/**
 * Title-case a token while preserving known abbreviations.
 * @param {string} word
 */
function titleCaseWord(word) {
  if (!word) return '';
  if (word.length <= 3 && word === word.toUpperCase()) return word;
  const lower = word.toLowerCase();
  if (lower === 'são' || lower === 'sao') return 'São';
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * @param {string} name
 */
export function normalizeCapitalization(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .map((w) => titleCaseWord(w.replace(INVALID_LINE_CHARS, '')))
    .filter(Boolean)
    .join(' ');
}

/**
 * Remove characters that cannot appear in city/country names.
 * @param {string} line
 */
export function removeInvalidSymbols(line) {
  return String(line || '')
    .replace(INVALID_LINE_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect CSV header row.
 * @param {string} line
 */
function isCsvHeader(line) {
  const lower = line.toLowerCase();
  return (
    (lower.includes('city') && (lower.includes('country') || lower.includes('lat'))) ||
    lower === 'name,country' ||
    lower.startsWith('city,')
  );
}

/**
 * Parse one logical line into { city, country }.
 * @param {string} line
 */
export function parseCityCountryLine(line) {
  const cleaned = removeInvalidSymbols(line);
  if (!cleaned) return { city: '', country: '', raw: line };

  if (cleaned.includes('\t')) {
    const parts = cleaned.split('\t').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return {
        city: normalizeCapitalization(parts[0]),
        country: normalizeCapitalization(parts[parts.length - 1]),
        raw: line,
      };
    }
  }

  const commaParts = cleaned.split(',').map((p) => p.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    const last = commaParts[commaParts.length - 1];
    if (last.length <= 40 && !/^-?\d/.test(last)) {
      return {
        city: normalizeCapitalization(commaParts.slice(0, -1).join(', ')),
        country: normalizeCapitalization(last),
        raw: line,
      };
    }
    if (commaParts.length === 3 && /^-?\d/.test(commaParts[1])) {
      return {
        city: normalizeCapitalization(commaParts[0]),
        country: '',
        lat: Number.parseFloat(commaParts[1]),
        lng: Number.parseFloat(commaParts[2]),
        raw: line,
      };
    }
  }

  return {
    city: normalizeCapitalization(cleaned),
    country: '',
    raw: line,
  };
}

/**
 * Split pasted blob into individual city lines (newline + inline comma lists).
 * @param {string} raw
 */
export function splitInputLines(raw) {
  const text = cleanRawInput(raw);
  if (!text) return [];

  const lines = [];
  const rowSplit = text.split(/\n+/);

  for (let row of rowSplit) {
    row = row.trim();
    if (!row) continue;
    if (isCsvHeader(row)) continue;

    if (row.includes(';')) {
      row.split(';').forEach((part) => {
        const p = part.trim();
        if (p) lines.push(p);
      });
      continue;
    }

    const commaCount = (row.match(/,/g) || []).length;
    if (commaCount >= 2 && !row.match(/,\s*[-\d]/)) {
      const parts = row.split(',').map((p) => p.trim()).filter(Boolean);
      const chunk = [];
      for (const part of parts) {
        if (part.length > 0 && part.length < 60) {
          chunk.push(part);
          if (chunk.length === 2) {
            lines.push(`${chunk[0]}, ${chunk[1]}`);
            chunk.length = 0;
          } else if (chunk.length === 1 && !part.includes(' ')) {
            lines.push(part);
            chunk.length = 0;
          }
        } else {
          lines.push(part);
        }
      }
      continue;
    }

    if (commaCount === 1 && !row.includes('\t')) {
      const [a, b] = row.split(',').map((p) => p.trim());
      if (a && b && b.length < 50) {
        lines.push(row);
        continue;
      }
    }

    if (commaCount > 0 && row.length < 120 && row.split(',').every((p) => p.trim().length < 40)) {
      row.split(',').forEach((part) => {
        const p = part.trim();
        if (p && !/^-?\d+\.?\d*$/.test(p)) lines.push(p);
      });
      continue;
    }

    lines.push(row);
  }

  return lines;
}

/**
 * Dedupe by normalized city|country key.
 * @param {string[]} lines
 */
export function dedupeInputLines(lines) {
  const seen = new Set();
  const out = [];
  for (const line of lines) {
    const { city, country } = parseCityCountryLine(line);
    const key = `${city.toLowerCase()}|${country.toLowerCase()}`;
    if (!city || seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

/**
 * Split paste into lines (duplicates preserved for parse-time duplicate reporting).
 * @param {string} raw
 */
export function prepareInputLines(raw) {
  return splitInputLines(raw).filter((line) => {
    const { city } = parseCityCountryLine(line);
    return Boolean(city);
  });
}
