export function formatCurrency(value) {
  if (value == null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value, decimals = 1) {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

export function formatTimeHours(hours) {
  if (hours == null || !Number.isFinite(hours)) return '—';
  return `${hours.toFixed(1)}h`;
}

export function formatDistanceKm(km) {
  if (km == null || !Number.isFinite(km)) return '—';
  return `${km.toFixed(0)} km`;
}

export function formatPercent(value) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(0)}%`;
}
