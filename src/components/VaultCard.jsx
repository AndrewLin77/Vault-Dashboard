import { formatCompactNumber, formatPercent, formatTokenAmount, clampPercent } from '../lib/format';
import { getTokenDecimals, getTokenSymbol } from '../lib/morpho';

export default function VaultCard({ vault, selected, onClick }) {
  const decimals = getTokenDecimals(vault);
  const symbol = getTokenSymbol(vault);
  const totalAssets = formatTokenAmount(vault?.state?.totalAssets, decimals, 2);
  const apy = formatPercent(Number(vault?.state?.netApy ?? 0));
  const utilization = clampPercent(Number(vault?.state?.utilization ?? 0) * 100);
  const marketCount = vault.allocations?.length ?? 0;

  return (
    <button className={`vault-card ${selected ? 'is-selected' : ''}`} onClick={onClick} type="button">
      <div className="vault-card-header">
        <div>
          <span className="vault-symbol">{vault.symbol ?? symbol}</span>
          <h3>{vault.name}</h3>
        </div>
        <span className="vault-address">{vault.address.slice(0, 6)}…{vault.address.slice(-4)}</span>
      </div>

      <div className="vault-metrics">
        <div>
          <span>Total assets</span>
          <strong>{totalAssets}</strong>
        </div>
        <div>
          <span>APY</span>
          <strong>{apy}</strong>
        </div>
        <div>
          <span>Markets</span>
          <strong>{formatCompactNumber(marketCount)}</strong>
        </div>
      </div>

      <div className="utilization-meter">
        <div className="utilization-label">
          <span>Utilization</span>
          <strong>{utilization.toFixed(1)}%</strong>
        </div>
        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${utilization}%` }} />
        </div>
      </div>
    </button>
  );
}