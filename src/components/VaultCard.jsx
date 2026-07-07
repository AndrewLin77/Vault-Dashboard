import { formatCompactNumber, formatPercent, formatTokenAmount, formatUsd } from '../lib/format';
import { getChainLabel } from '../lib/explorer';
import { getTokenDecimals, getTokenSymbol, getVaultApy, getVaultLiquidity } from '../lib/morpho';

/** Clickable vault summary showing TVL, APY, liquidity, and market count. */
export default function VaultCard({ vault, onClick }) {
  const decimals = getTokenDecimals(vault);
  const symbol = getTokenSymbol(vault);
  const totalAssets = formatTokenAmount(vault?.state?.totalAssets, decimals, 2);
  const totalAssetsUsd = formatUsd(Number(vault?.state?.totalAssetsUsd ?? 0));
  const apy = formatPercent(getVaultApy(vault));
  const { assets: liquidityAssets, usd: liquidityUsd } = getVaultLiquidity(vault);
  const liquidity = formatTokenAmount(liquidityAssets, decimals, 2);
  const liquidityUsdFormatted = formatUsd(liquidityUsd);
  const hasNoLiquidity = liquidityUsd <= 0;
  const marketCount = vault?.state?.allocation?.filter((row) => Number(row?.supplyAssets ?? 0) > 0).length ?? 0;
  const chainId = vault?.chain?.id;

  return (
    <button className="vault-card" onClick={onClick} type="button">
      <div className="vault-card-main">
        <div className="vault-card-header">
          <div>
            <span className="vault-symbol">{vault.symbol ?? symbol}</span>
            <h3>{vault.name}</h3>
          </div>
          <div className="vault-card-tags">
            {vault.vaultVersion === 'v2' ? <span className="vault-tag">V2</span> : null}
            {chainId ? <span className="vault-tag">{getChainLabel(chainId)}</span> : null}
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
            <strong className="apy-value">{apy}</strong>
          </div>
          <div>
            <span>Liquidity</span>
            <strong className={hasNoLiquidity ? 'liquidity-zero' : undefined}>{liquidityUsdFormatted}</strong>
            <small className={hasNoLiquidity ? 'liquidity-zero' : undefined}>
              {liquidity} {symbol}
            </small>
          </div>
          <div>
            <span>Markets</span>
            <strong>{formatCompactNumber(marketCount)}</strong>
          </div>
        </div>
      </div>

      <span className="vault-card-chevron" aria-hidden="true">→</span>
    </button>
  );
}
