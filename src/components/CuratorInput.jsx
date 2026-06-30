import { CURATOR_SUGGESTIONS } from '../lib/morpho';

/** Legacy curator search form with suggestion chips (not used in current routing flow). */
export default function CuratorInput({
  value,
  onChange,
  onSubmit,
  onSelectSuggestion,
  loading,
  error,
  curatorName,
  resolvedAddress,
  vaultCount,
  compact = false,
}) {
  if (compact) {
    return (
      <form className="search-bar" onSubmit={onSubmit}>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search curator…"
          spellCheck="false"
          autoComplete="off"
        />
        <button type="submit" className="primary-button" disabled={loading || !value.trim()}>
          {loading ? '…' : 'Search'}
        </button>
      </form>
    );
  }

  return (
    <section className="panel hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">Morpho curator vault dashboard</p>
        <h1>Explore curator vaults on Morpho</h1>
        <p className="hero-text">
          Search by name or address to browse TVL, APY, and allocations. Open a vault for full detail and activity.
        </p>
        {curatorName && !loading ? (
          <div className="hero-meta">
            <span className="resolved-chip">{curatorName}</span>
            {resolvedAddress ? <span className="resolved-chip">{resolvedAddress}</span> : null}
            <span className="resolved-chip">
              {vaultCount} vault{vaultCount === 1 ? '' : 's'}
            </span>
          </div>
        ) : null}
      </div>

      <form className="curator-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Curator name or address</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck="false"
            autoComplete="off"
          />
        </label>

        <div className="curator-suggestions">
          {CURATOR_SUGGESTIONS.map((curator) => (
            <button
              key={curator}
              type="button"
              className="suggestion-chip"
              disabled={loading}
              onClick={() => onSelectSuggestion(curator)}
            >
              {curator}
            </button>
          ))}
        </div>

        <div className="actions-row">
          <button type="submit" className="primary-button" disabled={loading || !value.trim()}>
            {loading ? 'Loading…' : 'Load vaults'}
          </button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </section>
  );
}
