import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import OverviewStats from '../components/OverviewStats';
import VaultGrid from '../components/VaultGrid';
import { useCuratorVaults } from '../hooks/useCuratorVaults';
import { calculateAggregateStats } from '../lib/morpho';
import { decodeCuratorSlug, vaultPath } from '../lib/routes';

/** Curator detail page — overview stats and clickable vault grid. */
export default function CuratorPage() {
  const { curatorSlug } = useParams();
  const navigate = useNavigate();
  const curatorQuery = decodeCuratorSlug(curatorSlug);

  const vaultsQuery = useCuratorVaults(curatorQuery);
  const vaults = vaultsQuery.data?.vaults ?? [];
  const curatorName = vaultsQuery.data?.curatorName || curatorQuery;
  const resolvedAddress = vaultsQuery.data?.curatorAddresses?.[0] ?? '';

  const stats = useMemo(
    () => calculateAggregateStats(vaults, {}, vaultsQuery.data?.curatorAum ?? 0),
    [vaults, vaultsQuery.data?.curatorAum],
  );

  return (
    <>
      <nav className="detail-nav">
        <Link to="/" className="back-button">
          ← All curators
        </Link>
      </nav>

      <section className="section-header curator-view-header">
        <div>
          <p className="eyebrow">Curator</p>
          <h2>{curatorName}</h2>
          {resolvedAddress ? <p className="section-subtitle">{resolvedAddress}</p> : null}
        </div>
      </section>

      {vaultsQuery.isLoading ? (
        <div className="loading-block">Loading vaults…</div>
      ) : null}

      {vaultsQuery.isError ? (
        <section className="panel empty-state">
          Could not load vaults for this curator.
        </section>
      ) : null}

      {!vaultsQuery.isLoading && !vaultsQuery.isError && vaults.length === 0 ? (
        <section className="panel empty-state">
          No listed vaults were found for this curator.
        </section>
      ) : null}

      {vaults.length > 0 ? (
        <>
          <OverviewStats
            stats={stats}
            vaultCount={vaults.length}
            loading={vaultsQuery.isLoading}
          />

          <section className="section-header">
            <div>
              <p className="eyebrow">Vault portfolio</p>
              <h2>Vaults</h2>
              <p className="section-subtitle">Click a vault to view allocations and activity</p>
            </div>
          </section>

          <VaultGrid
            vaults={vaults}
            onVaultSelect={(vault) => navigate(vaultPath(curatorName, vault))}
          />
        </>
      ) : null}
    </>
  );
}
