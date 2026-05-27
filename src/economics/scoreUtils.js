/**
 * Normalization helpers for 0–100 economic scores.
 */

export function clampScore(value, min = 0, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function normalizeTo100(value, min, max) {
  if (max <= min) return 0;
  return clampScore(((safeNumber(value) - min) / (max - min)) * 100);
}

/**
 * @param {number[]} values
 * @param {number} percentile 0–1 (0.9 = top 10%)
 */
export function percentileThreshold(values, percentile) {
  const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const p = Math.min(1, Math.max(0, Number(percentile) || 0));
  const idx = Math.floor(sorted.length * p);
  return sorted[Math.min(sorted.length - 1, Math.max(0, idx))];
}

export function logPopulationScore(population) {
  const pop = safeNumber(population, 0);
  if (pop <= 0) return 0;
  return clampScore((Math.log10(pop / 100_000) / 3) * 100);
}
