const ENDPOINT = 'https://api.morpho.org/graphql';

export const CURATOR_DIRECTORY = {
  alphaping: '0x6788c8ad65E85CCa7224a0B46D061EF7D81F9Da5',
  gauntlet: '0x4Ef4C1208F7374d0252767E3992546d61dCf9848',
  're7 labs': '0x86328E3A1A7492E0e0cA1B46021AEE936eCb72C6',
  steakhouse: '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
};

export const CURATOR_SUGGESTIONS = ['AlphaPing', 'Gauntlet', 'Steakhouse', 'Re7 Labs'];

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function resolveCuratorInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (isAddress(trimmed)) return trimmed;
  return CURATOR_DIRECTORY[trimmed.toLowerCase()] ?? trimmed;
}

async function fetchGraphQL(query, variables) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.[0]?.message || `Morpho request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload.data;
}

async function resolveCuratorAddresses(input) {
  const normalized = input.trim();
  if (!normalized) return { addresses: [], aum: 0, name: '' };
  if (isAddress(normalized)) {
    return { addresses: [normalized], aum: 0, name: normalized };
  }

  const CURATORS_QUERY = `
    query Curators($search: String!) {
      curators(where: { search: $search }, first: 10) {
        items {
          name
          state {
            aum
          }
          addresses {
            address
            chainId
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(CURATORS_QUERY, { search: normalized });
  const matches = data?.curators?.items ?? [];
  const addresses = [...new Set(
    matches.flatMap((curator) =>
      (curator?.addresses ?? []).map((address) => address?.address).filter(Boolean),
    ),
  )];

  if (addresses.length) {
    return {
      addresses,
      aum: Number(matches[0]?.state?.aum ?? 0),
      name: matches[0]?.name ?? normalized,
    };
  }

  const fallbackAddress = CURATOR_DIRECTORY[normalized.toLowerCase()];
  return fallbackAddress
    ? { addresses: [fallbackAddress], aum: 0, name: normalized }
    : { addresses: [], aum: 0, name: normalized };
}

const CURATOR_VAULTS_QUERY = `
  query CuratorVaults($addresses: [String!]!) {
    vaults(where: { curatorAddress_in: $addresses, listed: true }, first: 50) {
      items {
        address
        chain {
          id
        }
        name
        symbol
        listed
        asset {
          symbol
          decimals
        }
        state {
          totalAssets
          totalAssetsUsd
          netApy
          avgNetApy
          allocation {
            supplyAssets
            supplyAssetsUsd
            market {
              marketId
              loanAsset {
                symbol
              }
              collateralAsset {
                symbol
              }
            }
          }
        }
      }
    }
  }
`;

const CURATOR_VAULTS_V2_QUERY = `
  query CuratorVaultsV2($addresses: [Address!]!) {
    vaultV2s(where: { curatorAddress_in: $addresses, listed: true }, first: 50) {
      items {
        address
        chain {
          id
        }
        name
        symbol
        listed
        asset {
          symbol
          decimals
        }
        totalAssets
        totalAssetsUsd
        netApy
        avgNetApy
        caps {
          items {
            id
            type
            allocation
            data {
              ... on MarketV1CapData {
                market {
                  marketId
                  loanAsset {
                    symbol
                  }
                  collateralAsset {
                    symbol
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const VAULT_ACTIVITY_QUERY = `
  query VaultActivity($vault: String!, $chainId: Int!) {
    vaultV1Transactions(
      where: { vaultAddress_in: [$vault] }
      first: 50
      orderBy: Time
      orderDirection: Desc
    ) {
      items {
        type
        assets
        timestamp
        txHash
      }
    }

    vaultV2AllocationTransactions(
      chainId: $chainId
      vaultAddress: $vault
      first: 50
    ) {
      items {
        type
        assets
        timestamp
        txHash
      }
    }
  }
`;

const VAULT_V2_ACTIVITY_QUERY = `
  query VaultV2Activity($vault: String!, $chainId: Int!) {
    vaultV2transactions(
      where: { vaultAddress_in: [$vault], chainId_in: [$chainId] }
      first: 50
      orderBy: Time
      orderDirection: Desc
    ) {
      items {
        type
        assets
        timestamp
        txHash
      }
    }
  }
`;

function isExcludedVaultName(name) {
  const trimmed = name?.trim() ?? '';
  return trimmed === '(Deployer)' || /^zzzz$/i.test(trimmed);
}

function vaultKey(vault) {
  return `${vault.chain?.id ?? 'unknown'}-${vault.address?.toLowerCase()}`;
}

function normalizeVaultV1Item(item) {
  return {
    ...item,
    vaultVersion: 'v1',
  };
}

function normalizeVaultV2Item(item) {
  const totalAssets = Number(item.totalAssets ?? 0);
  const totalAssetsUsd = Number(item.totalAssetsUsd ?? 0);
  const allocation = (item.caps?.items ?? [])
    .filter((cap) => cap.type === 'MarketV1' && Number(cap.allocation ?? 0) > 0)
    .map((cap) => {
      const supplyAssets = Number(cap.allocation ?? 0);
      const supplyAssetsUsd = totalAssets > 0 ? (supplyAssets / totalAssets) * totalAssetsUsd : 0;
      return {
        supplyAssets,
        supplyAssetsUsd,
        market: cap.data?.market ?? null,
      };
    });

  return {
    vaultVersion: 'v2',
    address: item.address,
    chain: item.chain,
    name: item.name,
    symbol: item.symbol,
    listed: item.listed,
    asset: item.asset,
    state: {
      totalAssets: item.totalAssets,
      totalAssetsUsd: item.totalAssetsUsd,
      netApy: item.netApy,
      avgNetApy: item.avgNetApy,
      allocation,
    },
  };
}

function mergeCuratorVaults(v1Items, v2Items) {
  const merged = new Map();

  for (const item of v1Items) {
    if (isExcludedVaultName(item.name)) continue;
    merged.set(vaultKey(item), normalizeVaultV1Item(item));
  }

  for (const item of v2Items) {
    if (isExcludedVaultName(item.name)) continue;
    merged.set(vaultKey(item), normalizeVaultV2Item(item));
  }

  return [...merged.values()].sort(
    (left, right) => Number(right.state?.totalAssetsUsd ?? 0) - Number(left.state?.totalAssetsUsd ?? 0),
  );
}

export async function fetchCuratorVaults(curatorInput) {
  const curator = await resolveCuratorAddresses(curatorInput);
  if (!curator.addresses.length) {
    return { vaults: [], curatorAddresses: [], curatorAum: 0, curatorName: curator.name };
  }

  const [v1Data, v2Data] = await Promise.all([
    fetchGraphQL(CURATOR_VAULTS_QUERY, { addresses: curator.addresses }),
    fetchGraphQL(CURATOR_VAULTS_V2_QUERY, { addresses: curator.addresses }),
  ]);

  const vaults = mergeCuratorVaults(
    v1Data?.vaults?.items ?? [],
    v2Data?.vaultV2s?.items ?? [],
  );

  const vaultTvl = vaults.reduce((sum, vault) => sum + Number(vault.state?.totalAssetsUsd ?? 0), 0);

  return {
    vaults,
    curatorAddresses: curator.addresses,
    curatorAum: curator.aum || vaultTvl,
    curatorName: curator.name,
  };
}

export async function fetchVaultActivity(vaultAddress, chainId, vaultVersion = 'v1') {
  if (vaultVersion === 'v2') {
    const data = await fetchGraphQL(VAULT_V2_ACTIVITY_QUERY, {
      vault: vaultAddress,
      chainId: Number(chainId),
    });

    return (data?.vaultV2transactions?.items ?? [])
      .map((item) => ({
        type: item?.type === 'Withdraw' ? 'Withdrawal' : item?.type,
        assets: item?.assets,
        timestamp: item?.timestamp,
        txHash: item?.txHash,
      }))
      .sort((left, right) => Number(right.timestamp) - Number(left.timestamp));
  }

  const data = await fetchGraphQL(VAULT_ACTIVITY_QUERY, { vault: vaultAddress, chainId: Number(chainId) });

  const vaultTransactions = (data?.vaultV1Transactions?.items ?? [])
    .map((item) => {
      if (item?.type === 'Transfer') return null;
      return {
        type: item?.type === 'Withdraw' ? 'Withdrawal' : item?.type,
        assets: item?.assets,
        timestamp: item?.timestamp,
        txHash: item?.txHash,
      };
    })
    .filter(Boolean);

  const rebalanceTransactions = (data?.vaultV2AllocationTransactions?.items ?? []).map((item) => ({
    type: 'Rebalance',
    assets: item?.assets,
    timestamp: item?.timestamp,
    txHash: item?.txHash,
  }));

  return [...vaultTransactions, ...rebalanceTransactions].sort(
    (left, right) => Number(right.timestamp) - Number(left.timestamp),
  );
}

export function getVaultApy(vault) {
  const avgNetApy = vault?.state?.avgNetApy;
  if (avgNetApy != null && Number.isFinite(Number(avgNetApy))) {
    return Number(avgNetApy);
  }
  return Number(vault?.state?.netApy ?? 0);
}

export function getTokenDecimals(vault) {
  return Number(vault?.asset?.decimals ?? 18);
}

export function getTokenSymbol(vault) {
  return vault?.asset?.symbol ?? vault?.symbol ?? 'Token';
}

function formatMarketLabel(market) {
  const loan = market?.loanAsset?.symbol;
  const collateral = market?.collateralAsset?.symbol;
  if (loan && collateral) return `${loan} / ${collateral}`;
  return market?.marketId ?? 'Unknown market';
}

export function getAllocationRows(vault) {
  const totalAssets = Number(vault?.state?.totalAssets ?? 0);
  return (vault?.state?.allocation ?? [])
    .map((allocation) => {
      const supplyAssets = Number(allocation?.supplyAssets ?? 0);
      const percentage = totalAssets > 0 ? (supplyAssets / totalAssets) * 100 : 0;
      const marketLabel = formatMarketLabel(allocation?.market)
        || (allocation?.market?.collateralToken?.symbol
          ? `Collateral: ${allocation.market.collateralToken.symbol}`
          : 'Unknown market');
      return {
        key: allocation?.market?.marketId ?? `${marketLabel}-${supplyAssets}`,
        market: marketLabel,
        supplyAssets,
        supplyAssetsUsd: Number(allocation?.supplyAssetsUsd ?? 0),
        percentage,
      };
    })
    .filter((row) => row.supplyAssets > 0)
    .sort((left, right) => right.percentage - left.percentage);
}

export function calculateAggregateStats(vaults, activitiesByVault, curatorAum = 0) {
  const vaultSummaries = vaults.map((vault) => {
    const decimals = Number(vault?.asset?.decimals ?? 18);
    const asset = Number(vault?.state?.totalAssets ?? 0) / 10 ** decimals;
    const assetUsd = Number(vault?.state?.totalAssetsUsd ?? 0);
    const apy = getVaultApy(vault);
    return { asset, assetUsd, apy, decimals };
  });

  const totalAssetsUsd = curatorAum || vaultSummaries.reduce((sum, vault) => sum + vault.assetUsd, 0);
  const totalAssets = vaultSummaries.reduce((sum, vault) => sum + vault.asset, 0);
  const weightedApy = totalAssetsUsd
    ? vaultSummaries.reduce((sum, vault) => sum + vault.assetUsd * vault.apy, 0) / totalAssetsUsd
    : 0;

  const cutoff = Math.floor(Date.now() / 1000) - 86_400;
  let deposits24h = 0;
  let withdrawals24h = 0;

  for (const vault of vaults) {
    const decimals = Number(vault?.asset?.decimals ?? 18);
    const activities = activitiesByVault[vault.address] ?? [];
    for (const item of activities) {
      const timestamp = Number(item?.timestamp ?? 0);
      if (timestamp < cutoff) continue;
      const amount = Number(item?.assets ?? 0) / 10 ** decimals;
      if (item?.type === 'Deposit') deposits24h += amount;
      if (item?.type === 'Withdrawal' || item?.type === 'Withdraw') withdrawals24h += amount;
    }
  }

  return {
    totalAssets,
    totalAssetsUsd,
    weightedApy,
    deposits24h,
    withdrawals24h,
  };
}

export function normalizeVaultActivity(activities) {
  return [...activities].sort((left, right) => Number(right.timestamp) - Number(left.timestamp));
}