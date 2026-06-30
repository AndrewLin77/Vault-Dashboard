const EXPLORERS = {
  1: 'https://etherscan.io',
  8453: 'https://basescan.org',
  42161: 'https://arbiscan.io',
  10: 'https://optimistic.etherscan.io',
  137: 'https://polygonscan.com',
  999: 'https://hyperevmscan.io',
};

/** Return the block explorer URL for a contract/wallet address on the given chain. */
export function getAddressExplorerUrl(address, chainId = 1) {
  const base = EXPLORERS[Number(chainId)] ?? EXPLORERS[1];
  return `${base}/address/${address}`;
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
  };
  return names[Number(chainId)] ?? 'Etherscan';
}
