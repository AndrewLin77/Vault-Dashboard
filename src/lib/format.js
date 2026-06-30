/** Format a number in compact notation (e.g. 1.2M). */
export function formatCompactNumber(value) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a USD value; uses compact notation for amounts ≥ $1M. */
export function formatUsd(value) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 2 : 0,
  }).format(value);
}

/** Format a decimal APY/rate as a percentage string (e.g. 0.0812 → "8.12%"). */
export function formatPercent(value) {
  if (!Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(2)}%`;
}

/** Convert a raw on-chain token amount to a human-readable string. */
export function formatTokenAmount(rawAmount, decimals = 18, maximumFractionDigits = 2) {
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) return '—';
  const normalized = amount / 10 ** decimals;
  return new Intl.NumberFormat('en', {
    maximumFractionDigits,
  }).format(normalized);
}

/** Format a Unix timestamp as a localized date and time. */
export function formatDateTime(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value)) return '—';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value * 1000));
}

/** Format a Unix timestamp as a relative time (e.g. "2 hours ago"). */
export function formatRelativeTime(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value)) return '—';
  const diffSeconds = Math.round((Date.now() - value * 1000) / 1000);
  const absolute = Math.abs(diffSeconds);
  const units = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, size] of units) {
    if (absolute >= size || unit === 'second') {
      const amount = Math.max(1, Math.round(absolute / size));
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        diffSeconds < 0 ? amount : -amount,
        unit,
      );
    }
  }

  return '—';
}

/** Clamp a percentage value to the 0–100 range. */
export function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
