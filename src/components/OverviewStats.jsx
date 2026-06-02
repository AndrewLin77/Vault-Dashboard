import { formatCompactNumber, formatPercent } from '../lib/format';

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
  const totalAssets = formatCompactNumber(stats.totalAssets);
  const weightedApy = formatPercent(stats.weightedApy);
  const deposits24h = formatCompactNumber(stats.deposits24h);
  const withdrawals24h = formatCompactNumber(stats.withdrawals24h);

  return (
    <section className="stats-grid">
      <StatCard label="Vaults" value={loading ? '…' : vaultCount} hint="Curator-managed vaults" />
      <StatCard label="Total assets" value={loading ? '…' : totalAssets} hint="Aggregated TVL" />
      <StatCard label="Weighted APY" value={loading ? '…' : weightedApy} hint="By vault assets" />
      <StatCard label="24h deposits" value={loading ? '…' : deposits24h} hint="Incoming capital" />
      <StatCard label="24h withdrawals" value={loading ? '…' : withdrawals24h} hint="Exited capital" />
    </section>
  );
}