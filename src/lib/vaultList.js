import { getChainLabel } from './explorer';
import { getTokenSymbol, getVaultApy, getVaultLiquidity } from './morpho';

export const VAULT_SORT_OPTIONS = [
  { id: 'tvl', label: 'TVL' },
  { id: 'apy', label: 'APY' },
  { id: 'liquidity', label: 'Liquidity' },
];

export function filterVaultsBySearch(vaults, query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return vaults;

  return vaults.filter((vault) => {
    const symbol = getTokenSymbol(vault).toLowerCase();
    const chain = getChainLabel(vault?.chain?.id).toLowerCase();
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

export function filterVaultsByChain(vaults, chainId) {
  if (!chainId || chainId === 'all') return vaults;
  return vaults.filter((vault) => String(vault?.chain?.id) === chainId);
}

export function filterVaultsByAsset(vaults, asset) {
  if (!asset || asset === 'all') return vaults;
  return vaults.filter((vault) => getTokenSymbol(vault) === asset);
}

export function sortVaults(vaults, sortBy) {
  const sorted = [...vaults];

  if (sortBy === 'apy') {
    return sorted.sort((left, right) => getVaultApy(right) - getVaultApy(left));
  }

  if (sortBy === 'liquidity') {
    return sorted.sort(
      (left, right) => getVaultLiquidity(right).usd - getVaultLiquidity(left).usd,
    );
  }

  return sorted.sort(
    (left, right) => Number(right.state?.totalAssetsUsd ?? 0) - Number(left.state?.totalAssetsUsd ?? 0),
  );
}

export function getVaultChainOptions(vaults) {
  const chains = new Map();

  for (const vault of vaults) {
    const chainId = vault?.chain?.id;
    if (chainId == null) continue;
    chains.set(String(chainId), getChainLabel(chainId));
  }

  return [...chains.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getVaultAssetOptions(vaults) {
  const assets = new Set();

  for (const vault of vaults) {
    assets.add(getTokenSymbol(vault));
  }

  return [...assets].sort((left, right) => left.localeCompare(right));
}

export function applyVaultListControls(vaults, { search, chainId, asset, sortBy }) {
  let result = filterVaultsBySearch(vaults, search);
  result = filterVaultsByChain(result, chainId);
  result = filterVaultsByAsset(result, asset);
  return sortVaults(result, sortBy);
}
