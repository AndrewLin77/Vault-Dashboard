import AllocationChart from './AllocationChart';
import ActivityFeed from './ActivityFeed';
import { getAllocationRows, getTokenDecimals, getTokenSymbol, getVaultApy } from '../lib/morpho';
import { formatPercent, formatTokenAmount, formatUsd } from '../lib/format';

export default function VaultDetail({ vault, activity }) {
  if (!vault) {
    return <section className="panel detail-panel empty-state">Select a vault to inspect allocations and activity.</section>;
  }

  const decimals = getTokenDecimals(vault);
  const symbol = getTokenSymbol(vault);
  const allocations = getAllocationRows(vault);

  return (
    <section className="panel detail-panel">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Vault detail</p>
          <h2>{vault.name}</h2>
          <p className="muted">{vault.address}</p>
        </div>
        <div className="detail-summary">
          <div>
            <span>TVL</span>
            <strong>{formatUsd(Number(vault?.state?.totalAssetsUsd ?? 0))}</strong>
            <small>{formatTokenAmount(vault?.state?.totalAssets, decimals)} {symbol}</small>
          </div>
          <div>
            <span>APY</span>
            <strong>{formatPercent(getVaultApy(vault))}</strong>
          </div>
          <div>
            <span>Markets</span>
            <strong>{allocations.length}</strong>
          </div>
        </div>
      </div>

      <div className="detail-columns">
        <div className="detail-block">
          <h3>Allocation breakdown</h3>
          <AllocationChart allocations={allocations} />
        </div>
        <div className="detail-block">
          <h3>Recent activity</h3>
          <ActivityFeed activity={activity} decimals={decimals} />
        </div>
      </div>
    </section>
  );
}