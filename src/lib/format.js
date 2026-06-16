export function formatCompactNumber(value) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUsd(value) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 2 : 0,
  }).format(value);
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(2)}%`;
}

export function formatTokenAmount(rawAmount, decimals = 18, maximumFractionDigits = 2) {
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) return '—';
  const normalized = amount / 10 ** decimals;
  return new Intl.NumberFormat('en', {
    maximumFractionDigits,
  }).format(normalized);
}

export function formatDateTime(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value)) return '—';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value * 1000));
}

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

export function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}