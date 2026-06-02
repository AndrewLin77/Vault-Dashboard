export default function CuratorInput({ value, onChange, onSubmit, loading, error, resolvedAddress }) {
  return (
    <section className="panel hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">Morpho curator vault dashboard</p>
        <h1>Track a curator’s vaults, allocations, APY, and recent activity.</h1>
        <p className="hero-text">
          Enter a curator name or address to load their vaults and inspect the capital
          deployed across each market.
        </p>
      </div>

      <form className="curator-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Curator name or address</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Gauntlet or 0x..."
            spellCheck="false"
            autoComplete="off"
          />
        </label>
        <div className="actions-row">
          <button type="submit" className="primary-button" disabled={loading || !value.trim()}>
            {loading ? 'Loading…' : 'Load vaults'}
          </button>
          {resolvedAddress ? <span className="resolved-chip">Resolved: {resolvedAddress}</span> : null}
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </section>
  );
}