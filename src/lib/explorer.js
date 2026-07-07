const EXPLORERS = {
  1: 'https://etherscan.io',
  8453: 'https://basescan.org',
  42161: 'https://arbiscan.io',
  10: 'https://optimistic.etherscan.io',
  137: 'https://polygonscan.com',
  999: 'https://hyperevmscan.io',
};

const CHAIN_NAMES = {
  1: 'Ethereum',
  10: 'Optimism',
  130: 'Unichain',
  137: 'Polygon',
  143: 'Monad',
  480: 'World Chain',
  8453: 'Base',
  42161: 'Arbitrum',
  4217: 'Forma',
  4663: 'Forma',
  988: 'Stable',
  999: 'HyperEVM',
  747474: 'Katana',
};

/** Return a human-readable chain name for display tags. */
export function getChainName(chainId) {
  const id = Number(chainId);
  return CHAIN_NAMES[id] ?? `Chain ${id}`;
}

/** Chain tag label with human name and numeric id (e.g. "Base · 8453"). */
export function getChainLabel(chainId) {
  const id = Number(chainId);
  if (!Number.isFinite(id)) return '';
  const name = CHAIN_NAMES[id];
  return name ? `${name} · ${id}` : `Chain ${id}`;
}

/** Return the block explorer URL for a contract/wallet address on the given chain. */
export function getAddressExplorerUrl(address, chainId = 1) {
  const base = EXPLORERS[Number(chainId)] ?? EXPLORERS[1];
  return `${base}/address/${address}`;
}

/** Return the block explorer URL for a transaction hash on the given chain. */
export function getTxExplorerUrl(txHash, chainId = 1) {
  const base = EXPLORERS[Number(chainId)] ?? EXPLORERS[1];
  return `${base}/tx/${txHash}`;
}

/** Return the display name for a chain's block explorer. */
export function getExplorerName(chainId = 1) {
  const names = {
    1: 'Etherscan',
    8453: 'Basescan',
    42161: 'Arbiscan',
    10: 'Optimism Etherscan',
    137: 'Polygonscan',
    999: 'HyperEVM Scan',
    130: 'Uniscan',
  };
  return names[Number(chainId)] ?? 'Etherscan';
}
