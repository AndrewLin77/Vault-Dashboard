import { formatCompactNumber, formatPercent, formatTokenAmount, formatUsd } from '../lib/format';
import { getTokenDecimals, getTokenSymbol, getVaultApy } from '../lib/morpho';

export default function VaultCard({ vault, selected, onClick }) {
  const decimals = getTokenDecimals(vault);
  const symbol = getTokenSymbol(vault);
  const totalAssets = formatTokenAmount(vault?.state?.totalAssets, decimals, 2);
  const totalAssetsUsd = formatUsd(Number(vault?.state?.totalAssetsUsd ?? 0));
  const apy = formatPercent(getVaultApy(vault));
  const marketCount = vault?.state?.allocation?.filter((row) => Number(row?.supplyAssets ?? 0) > 0).length ?? 0;
  const chainId = vault?.chain?.id;

  return (
    <button className={`vault-card ${selected ? 'is-selected' : ''}`} onClick={onClick} type="button">
      <div className="vault-card-header">
        <div>
          <span className="vault-symbol">{vault.symbol ?? symbol}</span>
          <h3>{vault.name}</h3>
        </div>
        <div className="vault-card-tags">
          {vault.vaultVersion === 'v2' ? <span className="vault-chain">Vault V2</span> : null}
          {chainId ? <span className="vault-chain">Chain {chainId}</span> : null}
          <span className="vault-address">{vault.address.slice(0, 6)}…{vault.address.slice(-4)}</span>
        </div>
      </div>

      <div className="vault-metrics">
        <div>
          <span>TVL</span>
          <strong>{totalAssetsUsd}</strong>
          <small>{totalAssets} {symbol}</small>
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
    </button>
  );
}