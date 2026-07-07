import FilterDropdown from './FilterDropdown';
import { VAULT_SORT_OPTIONS } from '../lib/vaultList';

function FilterIcon() {
  return (
    <svg className="filter-dropdown-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4.25h12M4.5 8h7M6.5 11.75h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Search, sort, and filter controls for the curator vault list. */
export default function VaultListToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  chainFilter,
  onChainFilterChange,
  chainOptions,
  assetFilter,
  onAssetFilterChange,
  assetOptions,
}) {
  const chainDropdownOptions = [
    { id: 'all', label: 'All chains' },
    ...chainOptions,
  ];

  const assetDropdownOptions = [
    { id: 'all', label: 'All assets' },
    ...assetOptions.map((asset) => ({ id: asset, label: asset })),
  ];

  return (
    <div className="vault-toolbar">
      <div className="vault-toolbar-search curator-search-wrap">
        <span className="curator-search-icon" aria-hidden="true">⌕</span>
        <input
          className="curator-search-input"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search vaults"
          spellCheck="false"
          autoComplete="off"
        />
      </div>

      <div className="vault-toolbar-filters">
        <FilterDropdown
          label="Sort by"
          value={sortBy}
          options={VAULT_SORT_OPTIONS}
          onChange={onSortChange}
          icon={<FilterIcon />}
          iconOnly
        />

        <FilterDropdown
          label="Filter by chain"
          placeholder="Chain"
          value={chainFilter}
          options={chainDropdownOptions}
          onChange={onChainFilterChange}
          active={chainFilter !== 'all'}
        />

        <FilterDropdown
          label="Filter by asset"
          placeholder="Asset"
          value={assetFilter}
          options={assetDropdownOptions}
          onChange={onAssetFilterChange}
          active={assetFilter !== 'all'}
        />
      </div>
    </div>
  );
}
