import { formatCompactNumber, formatPercent, formatUsd } from '../lib/format';

function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint ? <span className="stat-hint">{hint}</span> : null}
    </article>
  );
}

export default function OverviewStats({ stats, vaultCount, loading }) {
  const totalAssetsUsd = formatUsd(stats.totalAssetsUsd);
  const weightedApy = formatPercent(stats.weightedApy);
  const deposits24h = formatCompactNumber(stats.deposits24h);
  const withdrawals24h = formatCompactNumber(stats.withdrawals24h);

  return (
    <section className="stats-grid">
      <StatCard label="Vaults" value={loading ? '…' : vaultCount} hint="Curator-managed vaults" />
      <StatCard label="Total TVL" value={loading ? '…' : totalAssetsUsd} hint="Aggregated USD value" />
      <StatCard label="Weighted APY" value={loading ? '…' : weightedApy} hint="By vault TVL" />
      <StatCard label="24h deposits" value={loading ? '…' : deposits24h} hint="Incoming capital (token units)" />
      <StatCard label="24h withdrawals" value={loading ? '…' : withdrawals24h} hint="Exited capital (token units)" />
    </section>
  );
}