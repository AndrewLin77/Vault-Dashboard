const ENDPOINT = 'https://api.morpho.org/graphql';

export const CURATOR_DIRECTORY = {
  'gauntlet': '0x4Ef4C1208F7374d0252767E3992546d61dCf9848',
  're7 labs': '0x86328E3A1A7492E0e0cA1B46021AEE936eCb72C6',
  'steakhouse': '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
};

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
  if (!normalized) return [];
  if (isAddress(normalized)) return [normalized];

  const CURATORS_QUERY = `
    query Curators($search: String!) {
      curators(where: { search: $search }, first: 10) {
        items {
          name
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

  if (addresses.length) return addresses;

  const fallbackAddress = CURATOR_DIRECTORY[normalized.toLowerCase()];
  return fallbackAddress ? [fallbackAddress] : [];
}

const CURATOR_VAULTS_QUERY = `
  query CuratorVaults($addresses: [String!]!) {
    vaults(where: { curatorAddress_in: $addresses }, first: 20) {
      items {
        address
        chain {
          id
        }
        name
        symbol
        asset {
          symbol
          decimals
        }
        state {
          totalAssets
          netApy
          utilization
          totalDeposits
          totalWithdrawals
        }
        allocations {
          market {
            uniqueKey
            id
          }
          supplyAssets
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

export async function fetchCuratorVaults(curatorInput) {
  const curatorAddresses = await resolveCuratorAddresses(curatorInput);
  if (!curatorAddresses.length) return { vaults: [], curatorAddresses: [] };

  const data = await fetchGraphQL(CURATOR_VAULTS_QUERY, { addresses: curatorAddresses });
  return {
    vaults: data?.vaults?.items ?? [],
    curatorAddresses,
  };
}

export async function fetchVaultActivity(vault, chainId) {
  const data = await fetchGraphQL(VAULT_ACTIVITY_QUERY, { vault, chainId: Number(chainId) });

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

export function getTokenDecimals(vault) {
  return Number(vault?.asset?.decimals ?? 18);
}

export function getTokenSymbol(vault) {
  return vault?.asset?.symbol ?? vault?.symbol ?? 'Token';
}

export function getAllocationRows(vault) {
  const totalAssets = Number(vault?.state?.totalAssets ?? 0);
  return (vault?.allocations ?? [])
    .map((allocation) => {
      const supplyAssets = Number(allocation?.supplyAssets ?? 0);
      const percentage = totalAssets > 0 ? (supplyAssets / totalAssets) * 100 : 0;
      return {
        key: allocation?.market?.uniqueKey ?? allocation?.market?.id ?? `${allocation?.market?.id ?? 'market'}-${supplyAssets}`,
        market: allocation?.market?.uniqueKey ?? allocation?.market?.id ?? 'Unknown market',
        supplyAssets,
        percentage,
      };
    })
    .sort((left, right) => right.percentage - left.percentage);
}

export function calculateAggregateStats(vaults, activitiesByVault) {
  const vaultSummaries = vaults.map((vault) => {
    const decimals = Number(vault?.asset?.decimals ?? 18);
    const asset = Number(vault?.state?.totalAssets ?? 0) / 10 ** decimals;
    const apy = Number(vault?.state?.netApy ?? 0);
    return { asset, apy, decimals };
  });

  const totalAssets = vaultSummaries.reduce((sum, vault) => sum + vault.asset, 0);
  const weightedApy = totalAssets
    ? vaultSummaries.reduce((sum, vault) => sum + vault.asset * vault.apy, 0) / totalAssets
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
    weightedApy,
    deposits24h,
    withdrawals24h,
  };
}

export function normalizeVaultActivity(activities) {
  return [...activities].sort((left, right) => Number(right.timestamp) - Number(left.timestamp));
}