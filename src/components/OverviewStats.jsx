import { formatPercent, formatUsd } from '../lib/format';

function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint ? <span className="stat-hint">{hint}</span> : null}
    </article>
  );
}

export default function OverviewStats({ stats, vaultCount, loading, compact = false }) {
  const totalAssetsUsd = formatUsd(stats.totalAssetsUsd);
  const weightedApy = formatPercent(stats.weightedApy);

  return (
    <section className={`stats-grid ${compact ? 'stats-grid-compact' : ''}`}>
      <StatCard label="Vaults" value={loading ? '…' : vaultCount} hint="Listed on Morpho" />
      <StatCard label="Total TVL" value={loading ? '…' : totalAssetsUsd} hint="Curator AUM" />
      <StatCard label="Weighted APY" value={loading ? '…' : weightedApy} hint="By vault TVL" />
    </section>
  );
}
