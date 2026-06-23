import { Link } from 'react-router-dom';
import AllocationChart from './AllocationChart';
import ActivityFeed from './ActivityFeed';
import { getAllocationRows, getTokenDecimals, getTokenSymbol, getVaultApy } from '../lib/morpho';
import { formatPercent, formatTokenAmount, formatUsd } from '../lib/format';

function morphoVaultUrl(vault) {
  const chainId = vault?.chain?.id ?? 1;
  const address = vault?.address ?? '';
  if (vault?.vaultVersion === 'v2') {
    return `https://app.morpho.org/vault?vault=${address}&chain=${chainId}`;
  }
  return `https://app.morpho.org/vault?vault=${address}&chain=${chainId}`;
}

export default function VaultDetail({ vault, curatorName, activity, activityLoading, backTo }) {
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

  return (
    <section className="vault-detail-view">
      <nav className="detail-nav">
        <Link to={backTo} className="back-button">
          ← {curatorName ? `${curatorName} vaults` : 'Back to vaults'}
        </Link>
        <div className="breadcrumb">
          {curatorName ? <span>{curatorName}</span> : null}
          {curatorName ? <span className="breadcrumb-sep">/</span> : null}
          <span>{vault.name}</span>
        </div>
      </nav>

      <header className="panel detail-hero">
        <div className="detail-hero-copy">
          <div className="detail-hero-tags">
            <span className="vault-symbol">{vault.symbol ?? symbol}</span>
            {vault.vaultVersion === 'v2' ? <span className="vault-tag">Vault V2</span> : null}
            {vault.chain?.id ? <span className="vault-tag">Chain {vault.chain.id}</span> : null}
          </div>
          <h1>{vault.name}</h1>
          <p className="muted vault-address-full">{vault.address}</p>
          <a
            className="morpho-link"
            href={morphoVaultUrl(vault)}
            target="_blank"
            rel="noreferrer"
          >
            View on Morpho ↗
          </a>
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
            <span>Markets</span>
            <strong>{allocations.length}</strong>
          </div>
        </div>
      </header>

      <div className="detail-columns">
        <div className="panel detail-block">
          <h3>Allocation breakdown</h3>
          <AllocationChart allocations={allocations} />
        </div>
        <div className="panel detail-block detail-block-activity">
          <h3>Recent activity</h3>
          {activityLoading ? (
            <div className="loading-block">Loading transactions…</div>
          ) : (
            <div className="activity-scroll">
              <ActivityFeed activity={activity} decimals={decimals} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
