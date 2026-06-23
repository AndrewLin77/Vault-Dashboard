import { useMemo, useState } from 'react';
import CuratorCard from './CuratorCard';
import { useCuratorSearch, usePrimaryCurators } from '../hooks/useCurators';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

export default function CuratorLanding({ onSelectCurator }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const primaryQuery = usePrimaryCurators();
  const searchQuery = useCuratorSearch(debouncedSearch);

  const isSearching = debouncedSearch.trim().length > 0;
  const curators = useMemo(() => {
    if (isSearching) return searchQuery.data ?? [];
    return primaryQuery.data ?? [];
  }, [isSearching, primaryQuery.data, searchQuery.data]);

  const loading = isSearching ? searchQuery.isLoading : primaryQuery.isLoading;
  const error = isSearching ? searchQuery.error : primaryQuery.error;

  return (
    <div className="curator-landing">
      <header className="landing-header">
        <p className="eyebrow">Morpho curator vault dashboard</p>
        <h1>Curators</h1>
        <p className="landing-subtitle">
          Browse vault curators on Morpho. Select a curator to explore their vaults, TVL, and activity.
        </p>
      </header>

      <div className="curator-search-wrap">
        <span className="curator-search-icon" aria-hidden="true">⌕</span>
        <input
          className="curator-search-input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search curators by name"
          spellCheck="false"
          autoComplete="off"
        />
      </div>

      <div className="landing-list-header">
        <h2>{isSearching ? 'Search results' : 'Primary curators'}</h2>
        {!loading ? (
          <span className="landing-count">{curators.length} curator{curators.length === 1 ? '' : 's'}</span>
        ) : null}
      </div>

      {loading ? (
        <div className="loading-block">Loading curators…</div>
      ) : null}

      {error ? (
        <section className="panel empty-state">Could not load curators. Please try again.</section>
      ) : null}

      {!loading && !error && curators.length === 0 ? (
        <section className="panel empty-state">
          {isSearching ? 'No curators matched your search.' : 'No curators found.'}
        </section>
      ) : null}

      {!loading && curators.length > 0 ? (
        <div className="curator-list">
          {curators.map((curator) => (
            <CuratorCard
              key={curator.name}
              curator={curator}
              onClick={() => onSelectCurator(curator)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
