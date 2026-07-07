import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OverviewStats from '../components/OverviewStats';
import VaultGrid from '../components/VaultGrid';
import { useCuratorVaults } from '../hooks/useCuratorVaults';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { calculateAggregateStats, getTokenSymbol } from '../lib/morpho';
import { getChainName } from '../lib/explorer';
import { decodeCuratorSlug, vaultPath } from '../lib/routes';

function filterVaults(vaults, query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return vaults;

  return vaults.filter((vault) => {
    const symbol = getTokenSymbol(vault).toLowerCase();
    const chain = getChainName(vault?.chain?.id).toLowerCase();
    const chainId = String(vault?.chain?.id ?? '');
    const haystack = [
      vault?.name,
      vault?.symbol,
      symbol,
      chain,
      chainId,
      vault?.address,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(trimmed);
  });
}

/** Curator detail page — overview stats and clickable vault grid. */
export default function CuratorPage() {
  const { curatorSlug } = useParams();
  const navigate = useNavigate();
  const curatorQuery = decodeCuratorSlug(curatorSlug);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const vaultsQuery = useCuratorVaults(curatorQuery);
  const vaults = vaultsQuery.data?.vaults ?? [];
  const curatorName = vaultsQuery.data?.curatorName || curatorQuery;
  const isSearching = debouncedSearch.trim().length > 0;
  const filteredVaults = useMemo(
    () => filterVaults(vaults, debouncedSearch),
    [vaults, debouncedSearch],
  );
  const displayedVaults = isSearching ? filteredVaults : vaults;

  const stats = useMemo(
    () => calculateAggregateStats(
      displayedVaults,
      {},
      isSearching ? 0 : (vaultsQuery.data?.curatorAum ?? 0),
    ),
    [displayedVaults, isSearching, vaultsQuery.data?.curatorAum],
  );

  return (
    <>
      <section className="section-header curator-view-header">
        <div>
          <p className="eyebrow">Curator</p>
          <h2>{curatorName}</h2>
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
            vaultCount={displayedVaults.length}
            loading={vaultsQuery.isLoading}
          />

          <section className="section-header vault-list-header">
            <div>
              <p className="eyebrow">Vault portfolio</p>
              <h2>Vaults</h2>
              <p className="section-subtitle">
                {isSearching
                  ? `${displayedVaults.length} of ${vaults.length} vaults match your search`
                  : 'Click a vault to view allocations and activity'}
              </p>
            </div>
          </section>

          <div className="curator-search-wrap vault-search-wrap">
            <span className="curator-search-icon" aria-hidden="true">⌕</span>
            <input
              className="curator-search-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vaults by name, asset, or chain"
              spellCheck="false"
              autoComplete="off"
            />
          </div>

          {displayedVaults.length === 0 ? (
            <section className="panel empty-state">
              No vaults matched your search.
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
