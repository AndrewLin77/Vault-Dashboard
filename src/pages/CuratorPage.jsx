import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CuratorAvatar from '../components/CuratorAvatar';
import OverviewStats from '../components/OverviewStats';
import { CuratorPageHeaderSkeleton, StatsGridSkeleton, VaultGridSkeleton } from '../components/Skeleton';
import VaultGrid from '../components/VaultGrid';
import VaultListToolbar from '../components/VaultListToolbar';
import { useCuratorVaults } from '../hooks/useCuratorVaults';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { calculateAggregateStats } from '../lib/morpho';
import { decodeCuratorSlug, vaultPath } from '../lib/routes';
import {
  applyVaultListControls,
  getVaultAssetOptions,
  getVaultChainOptions,
} from '../lib/vaultList';

/** Curator detail page — overview stats and clickable vault grid. */
export default function CuratorPage() {
  const { curatorSlug } = useParams();
  const navigate = useNavigate();
  const curatorQuery = decodeCuratorSlug(curatorSlug);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
  const [chainFilter, setChainFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
  const debouncedSearch = useDebouncedValue(search);

  const vaultsQuery = useCuratorVaults(curatorQuery);
  const vaults = vaultsQuery.data?.vaults ?? [];
  const curatorName = vaultsQuery.data?.curatorName || curatorQuery;
  const curatorImage = vaultsQuery.data?.curatorImage ?? null;
  const curatorVerified = vaultsQuery.data?.curatorVerified ?? false;

  const chainOptions = useMemo(() => getVaultChainOptions(vaults), [vaults]);
  const assetOptions = useMemo(() => getVaultAssetOptions(vaults), [vaults]);

  const displayedVaults = useMemo(
    () => applyVaultListControls(vaults, {
      search: debouncedSearch,
      chainId: chainFilter,
      asset: assetFilter,
      sortBy,
    }),
    [vaults, debouncedSearch, chainFilter, assetFilter, sortBy],
  );

  const hasActiveFilters = Boolean(
    debouncedSearch.trim()
    || chainFilter !== 'all'
    || assetFilter !== 'all',
  );

  const stats = useMemo(
    () => calculateAggregateStats(
      hasActiveFilters ? displayedVaults : vaults,
      {},
      hasActiveFilters ? 0 : (vaultsQuery.data?.curatorAum ?? 0),
    ),
    [displayedVaults, vaults, hasActiveFilters, vaultsQuery.data?.curatorAum],
  );

  const vaultSubtitle = hasActiveFilters
    ? `${displayedVaults.length} of ${vaults.length} vaults match your filters`
    : 'Click a vault to view allocations and activity';

  return (
    <>
      {vaultsQuery.isLoading ? (
        <CuratorPageHeaderSkeleton />
      ) : (
        <section className="section-header curator-view-header curator-page-header">
          <CuratorAvatar
            name={curatorName}
            image={curatorImage}
            className="curator-avatar-lg"
          />
          <div className="curator-page-header-copy">
            <p className="eyebrow">Curator</p>
            <div className="curator-page-title">
              <h2>{curatorName}</h2>
              {curatorVerified ? <span className="curator-verified">Verified</span> : null}
            </div>
          </div>
        </section>
      )}

      {vaultsQuery.isLoading ? (
        <>
          <StatsGridSkeleton />
          <VaultGridSkeleton count={4} />
        </>
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
            vaultCount={displayedVaults.length}
            loading={vaultsQuery.isLoading}
          />

          <section className="section-header vault-list-header">
            <div>
              <p className="eyebrow">Vault portfolio</p>
              <h2>Vaults</h2>
              <p className="section-subtitle">{vaultSubtitle}</p>
            </div>
          </section>

          <VaultListToolbar
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
            chainFilter={chainFilter}
            onChainFilterChange={setChainFilter}
            chainOptions={chainOptions}
            assetFilter={assetFilter}
            onAssetFilterChange={setAssetFilter}
            assetOptions={assetOptions}
          />

          {displayedVaults.length === 0 ? (
            <section className="panel empty-state">
              No vaults matched your filters.
            </section>
          ) : (
            <VaultGrid
              vaults={displayedVaults}
              onVaultSelect={(vault) => navigate(vaultPath(curatorName, vault))}
            />
          )}
        </>
      ) : null}
    </>
  );
}
