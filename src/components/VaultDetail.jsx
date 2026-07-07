import { Link } from 'react-router-dom';
import AllocationChart from './AllocationChart';
import ActivityFeed from './ActivityFeed';
import AddressLink from './AddressLink';
import HistoryCharts from './HistoryCharts';
import { ActivityListSkeleton } from './Skeleton';
import {
  getAllocationRows,
  getTokenDecimals,
  getTokenSymbol,
  getVaultApy,
  getVaultLiquidity,
} from '../lib/morpho';
import { formatPercent, formatTokenAmount, formatUsd } from '../lib/format';
import { getChainLabel } from '../lib/explorer';

/** Full vault view with allocations chart, activity feed, and explorer link. */
export default function VaultDetail({
  vault,
  curatorName,
  activity,
  activityLoading,
  backTo,
}) {
  if (!vault) {
    return (
      <section className="panel detail-panel empty-state">
        Vault not found. {backTo ? <Link to={backTo} className="text-button">Go back</Link> : null}
      </section>
    );
  }

  const decimals = getTokenDecimals(vault);
  const symbol = getTokenSymbol(vault);
  const allocations = getAllocationRows(vault);
  const { assets: liquidityAssets, usd: liquidityUsd } = getVaultLiquidity(vault);
  const hasNoLiquidity = liquidityUsd <= 0;

  return (
    <section className="vault-detail-view">
      <header className="panel detail-hero">
        <div className="detail-hero-copy">
          <div className="detail-hero-tags">
            <span className="vault-symbol">{vault.symbol ?? symbol}</span>
            {vault.vaultVersion === 'v2' ? <span className="vault-tag">Vault V2</span> : null}
            {vault.chain?.id ? <span className="vault-tag">{getChainLabel(vault.chain.id)}</span> : null}
          </div>
          <h1>{vault.name}</h1>
          <p className="vault-address-full">
            <AddressLink address={vault.address} chainId={vault.chain?.id} />
          </p>
        </div>

        <div className="detail-summary">
          <div>
            <span>TVL</span>
            <strong>{formatUsd(Number(vault?.state?.totalAssetsUsd ?? 0))}</strong>
            <small>{formatTokenAmount(vault?.state?.totalAssets, decimals)} {symbol}</small>
          </div>
          <div>
            <span>APY</span>
            <strong className="apy-value">{formatPercent(getVaultApy(vault))}</strong>
          </div>
          <div>
            <span>Liquidity</span>
            <strong className={hasNoLiquidity ? 'liquidity-zero' : undefined}>{formatUsd(liquidityUsd)}</strong>
            <small className={hasNoLiquidity ? 'liquidity-zero' : undefined}>
              {formatTokenAmount(liquidityAssets, decimals)} {symbol}
            </small>
          </div>
          <div>
            <span>Markets</span>
            <strong>{allocations.length}</strong>
          </div>
        </div>
      </header>

      <HistoryCharts vault={vault} />

      <div className="detail-columns">
        <div className="panel detail-block">
          <h3>Allocation breakdown</h3>
          <AllocationChart allocations={allocations} decimals={decimals} symbol={symbol} />
        </div>
        <div className="panel detail-block detail-block-activity">
          <h3>Recent activity</h3>
          {activityLoading ? (
            <ActivityListSkeleton count={5} />
          ) : (
            <div className="activity-scroll">
              <ActivityFeed
                activity={activity}
                decimals={decimals}
                symbol={symbol}
                chainId={vault.chain?.id}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
