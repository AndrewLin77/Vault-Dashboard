export default function DashboardHeader({ curatorLabel, resolvedAddress, vaultCount, loading }) {
  return (
    <section className="panel hero-panel hero-panel-single">
      <div className="hero-copy">
        <p className="eyebrow">Curator vault dashboard</p>
        <h1>{curatorLabel} vaults</h1>
        <p className="hero-text">
          Track TVL, APY, market allocations, and recent deposits, withdrawals, and rebalancing
          across all {curatorLabel} vaults.
        </p>
        <div className="hero-meta">
          {resolvedAddress ? (
            <span className="resolved-chip">Curator: {resolvedAddress}</span>
          ) : null}
          <span className="resolved-chip">
            {loading ? 'Loading vaults…' : `${vaultCount} vault${vaultCount === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>
    </section>
  );
}
