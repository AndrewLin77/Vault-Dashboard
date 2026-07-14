const ENDPOINT = 'https://api.morpho.org/graphql';

/** Morpho GraphQL client — fetches curators, vaults (V1/V2), activity, and derived metrics. */

const CURATOR_LIST_QUERY = `
  query CuratorList($first: Int!, $where: CuratorFilters) {
    curators(first: $first, where: $where) {
      items {
        name
        image
        verified
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

/** Shape a raw Morpho curator API item into the app's curator model. */
function normalizeCuratorItem(item) {
  return {
    name: item?.name ?? 'Unknown curator',
    image: item?.image ?? null,
    verified: Boolean(item?.verified),
    aum: Number(item?.state?.aum ?? 0),
    addresses: item?.addresses ?? [],
  };
}

/** Sort curators by AUM descending. */
function sortCuratorsByAum(curators) {
  return [...curators].sort((left, right) => right.aum - left.aum);
}

/** Fetch verified curators from Morpho and return the top N by AUM. */
export async function fetchPrimaryCurators(limit = 20) {
  const data = await fetchGraphQL(CURATOR_LIST_QUERY, {
    first: 100,
    where: { verified: true },
  });
  const items = (data?.curators?.items ?? []).map(normalizeCuratorItem);
  return sortCuratorsByAum(items).slice(0, limit);
}

/** Search curators by name. */
export async function searchCurators(search, limit = 20) {
  const trimmed = search.trim();
  if (!trimmed) return [];

  const data = await fetchGraphQL(CURATOR_LIST_QUERY, {
    first: limit,
    where: { search: trimmed },
  });
  return sortCuratorsByAum((data?.curators?.items ?? []).map(normalizeCuratorItem));
}

/** POST a GraphQL query to the Morpho API and return the data payload. */
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

/**
 * Resolve a curator name to metadata and on-chain addresses used for vault queries.
 * Addresses are internal only — not shown in the UI.
 */
async function resolveCuratorAddresses(name) {
  const normalized = name.trim();
  if (!normalized) return { addresses: [], aum: 0, name: '' };

  const CURATORS_QUERY = `
    query Curators($search: String!) {
      curators(where: { search: $search }, first: 10) {
        items {
          name
          image
          verified
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
  const match = matches.find((curator) => curator.name?.toLowerCase() === normalized.toLowerCase())
    ?? matches.find((curator) => curator.name?.toLowerCase().includes(normalized.toLowerCase()))
    ?? matches[0];
  const addresses = [...new Set(
    matches.flatMap((curator) =>
      (curator?.addresses ?? []).map((address) => address?.address).filter(Boolean),
    ),
  )];

  if (addresses.length) {
    return {
      addresses,
      aum: Number(match?.state?.aum ?? 0),
      name: match?.name ?? normalized,
      image: match?.image ?? null,
      verified: Boolean(match?.verified),
    };
  }

  return {
    addresses: [],
    aum: 0,
    name: normalized,
    image: match?.image ?? null,
    verified: Boolean(match?.verified),
  };
}

function vaultNameMatchesCurator(vaultName, curatorName) {
  const vault = vaultName?.trim().toLowerCase() ?? '';
  const curator = curatorName?.trim().toLowerCase() ?? '';
  if (!vault || !curator) return false;
  return vault === curator || vault.startsWith(`${curator} `);
}

const CURATOR_VAULT_FIELDS = `
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
  liquidity {
    underlying
    usd
  }
  state {
    totalAssets
    totalAssetsUsd
    netApy
    avgNetApy
    fee
    feeRecipient
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
`;

const CURATOR_VAULTS_QUERY = `
  query CuratorVaults($addresses: [String!]!) {
    vaults(where: { curatorAddress_in: $addresses, listed: true }, first: 50) {
      items {
        ${CURATOR_VAULT_FIELDS}
      }
    }
  }
`;

const CURATOR_VAULTS_SEARCH_QUERY = `
  query CuratorVaultsSearch($search: String!) {
    vaults(where: { search: $search, listed: true }, first: 50) {
      items {
        ${CURATOR_VAULT_FIELDS}
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
        liquidity
        liquidityUsd
        idleAssets
        idleAssetsUsd
        forceDeallocatableLiquidity
        forceDeallocatableLiquidityUsd
        netApy
        avgNetApy
        performanceFee
        managementFee
        performanceFeeRecipient
        managementFeeRecipient
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

const VAULT_HISTORY_V1_QUERY = `
  query VaultHistoryV1($address: String!, $chainId: Int!, $options: TimeseriesOptions) {
    vaultByAddress(address: $address, chainId: $chainId) {
      historicalState {
        totalAssetsUsd(options: $options) {
          x
          y
        }
        dailyNetApy(options: $options) {
          x
          y
        }
      }
    }
  }
`;

const VAULT_HISTORY_V2_QUERY = `
  query VaultHistoryV2($address: String!, $chainId: Int!, $options: TimeseriesOptions) {
    vaultV2ByAddress(address: $address, chainId: $chainId) {
      historicalState {
        totalAssetsUsd(options: $options) {
          x
          y
        }
        avgNetApy(options: $options) {
          x
          y
        }
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

/** Skip internal/test vaults that should not appear in the dashboard. */
function isExcludedVaultName(name) {
  const trimmed = name?.trim() ?? '';
  return trimmed === '(Deployer)' || /^zzzz$/i.test(trimmed);
}

/** Unique key for deduplicating V1/V2 vaults on the same chain. */
function vaultKey(vault) {
  return `${vault.chain?.id ?? 'unknown'}-${vault.address?.toLowerCase()}`;
}

/** Normalize fee fields from V1/V2 vault API items. */
function normalizeVaultFees(item, version) {
  if (version === 'v2') {
    return {
      performanceFee: Number(item.performanceFee ?? 0),
      managementFee: Number(item.managementFee ?? 0),
      performanceFeeRecipient: item.performanceFeeRecipient ?? null,
      managementFeeRecipient: item.managementFeeRecipient ?? null,
    };
  }

  return {
    performanceFee: Number(item.state?.fee ?? 0),
    managementFee: null,
    performanceFeeRecipient: item.state?.feeRecipient ?? null,
    managementFeeRecipient: null,
  };
}

function isZeroAddress(address) {
  return !address || /^0x0+$/i.test(address);
}

/** Build display rows for vault fee UI. */
export function getVaultFeeRows(vault) {
  const fees = vault?.fees;
  if (!fees) return [];

  const rows = [
    {
      label: 'Performance fee',
      rate: fees.performanceFee,
      recipient: isZeroAddress(fees.performanceFeeRecipient) ? null : fees.performanceFeeRecipient,
    },
  ];

  if (vault.vaultVersion === 'v2') {
    rows.push({
      label: 'Management fee',
      rate: fees.managementFee ?? 0,
      recipient: isZeroAddress(fees.managementFeeRecipient) ? null : fees.managementFeeRecipient,
    });
  }

  return rows;
}

/** Add vaultVersion and flatten V1 liquidity onto state for consistent access. */
function normalizeVaultV1Item(item) {
  return {
    ...item,
    vaultVersion: 'v1',
    fees: normalizeVaultFees(item, 'v1'),
    state: {
      ...item.state,
      liquidityAssets: item.liquidity?.underlying,
      liquidityUsd: item.liquidity?.usd,
    },
  };
}

/** Sum instant and force-deallocatable V2 liquidity to match Morpho's displayed total. */
function getVaultV2LiquidityTotals(item) {
  const instantAssets = Number(item.liquidity ?? 0);
  const instantUsd = Number(item.liquidityUsd ?? 0);
  const forceAssets = Number(item.forceDeallocatableLiquidity ?? 0);
  const forceUsd = Number(item.forceDeallocatableLiquidityUsd ?? 0);

  return {
    liquidityAssets: instantAssets + forceAssets,
    liquidityUsd: instantUsd + forceUsd,
  };
}

/** Map V2 caps to allocation rows and normalize liquidity fields onto state. */
function normalizeVaultV2Item(item) {
  const totalAssets = Number(item.totalAssets ?? 0);
  const totalAssetsUsd = Number(item.totalAssetsUsd ?? 0);
  const liquidityTotals = getVaultV2LiquidityTotals(item);
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
    fees: normalizeVaultFees(item, 'v2'),
    state: {
      totalAssets: item.totalAssets,
      totalAssetsUsd: item.totalAssetsUsd,
      liquidityAssets: liquidityTotals.liquidityAssets,
      liquidityUsd: liquidityTotals.liquidityUsd,
      idleAssets: item.idleAssets,
      idleAssetsUsd: item.idleAssetsUsd,
      netApy: item.netApy,
      avgNetApy: item.avgNetApy,
      allocation,
    },
  };
}

function normalizeTimestampMs(x) {
  const value = Number(x);
  if (!Number.isFinite(value)) return null;
  // Morpho historical points use unix seconds.
  return value < 1e12 ? value * 1000 : value;
}

function normalizeDataPoint(point) {
  const timestampMs = normalizeTimestampMs(point?.x);
  // Morpho pads early/missing periods with null y — drop them so they don't render as 0%.
  if (point?.y == null) return null;
  const y = Number(point.y);
  if (timestampMs == null || !Number.isFinite(y)) return null;
  return { timestampMs, value: y };
}

function normalizeSeries(points) {
  return (points ?? [])
    .map(normalizeDataPoint)
    .filter(Boolean)
    .sort((a, b) => a.timestampMs - b.timestampMs);
}

/** Mean of a normalized series' values (null when empty). */
export function calculateSeriesAverage(points) {
  if (!points?.length) return null;
  const sum = points.reduce((acc, point) => acc + Number(point.value ?? 0), 0);
  return sum / points.length;
}

/**
 * Trailing window (seconds) requested per range. We pass only start/end and let
 * the API auto-pick the interval — matching Morpho's own chart, which yields
 * hourly points for a week, daily for a month, and weekly for a year / all time.
 */
const HISTORY_RANGE_SPAN_S = {
  weekly: 7 * 86_400,
  monthly: 30 * 86_400,
  yearly: 365 * 86_400,
  allTime: 5 * 365 * 86_400,
};

export const HISTORY_RANGES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'allTime', label: 'All time' },
];

/** Drop the leading warmup period where a vault is live but net APY is still 0. */
function dropLeadingZeros(points) {
  const firstEarning = points.findIndex((point) => point.value !== 0);
  return firstEarning > 0 ? points.slice(firstEarning) : points;
}

/**
 * Normalize a vault's history for the detail view: a daily net APY line and a
 * daily TVL line. V1 uses granular dailyNetApy; V2 only exposes avgNetApy.
 */
function normalizeVaultHistory(node, vaultVersion) {
  const hs = node?.historicalState ?? {};
  const apySource = vaultVersion === 'v2' ? hs.avgNetApy : hs.dailyNetApy;

  return {
    tvlUsd: normalizeSeries(hs.totalAssetsUsd),
    apy: dropLeadingZeros(normalizeSeries(apySource)),
  };
}

/** Merge listed V1 and V2 vaults, dedupe by chain+address, sort by TVL. */
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

/**
 * Fetch TVL + net APY history for a single vault over the selected range.
 * Only start/end are sent so the API auto-selects granularity (like Morpho's chart).
 */
export async function fetchVaultHistory(vaultAddress, chainId, vaultVersion = 'v1', range = 'weekly') {
  const now = Math.floor(Date.now() / 1000);
  const span = HISTORY_RANGE_SPAN_S[range] ?? HISTORY_RANGE_SPAN_S.weekly;
  const options = { startTimestamp: now - span, endTimestamp: now };

  if (vaultVersion === 'v2') {
    const data = await fetchGraphQL(VAULT_HISTORY_V2_QUERY, {
      address: vaultAddress,
      chainId: Number(chainId),
      options,
    });
    return normalizeVaultHistory(data?.vaultV2ByAddress, 'v2');
  }

  const data = await fetchGraphQL(VAULT_HISTORY_V1_QUERY, {
    address: vaultAddress,
    chainId: Number(chainId),
    options,
  });
  return normalizeVaultHistory(data?.vaultByAddress, 'v1');
}

/** Fetch all listed vaults for a curator (V1 + V2) with aggregate metadata. */
export async function fetchCuratorVaults(curatorInput) {
  const curator = await resolveCuratorAddresses(curatorInput);
  if (!curator.addresses.length) {
    return {
      vaults: [],
      curatorAum: 0,
      curatorName: curator.name,
      curatorImage: curator.image,
      curatorVerified: curator.verified,
    };
  }

  const [v1Data, v2Data] = await Promise.all([
    fetchGraphQL(CURATOR_VAULTS_QUERY, { addresses: curator.addresses }),
    fetchGraphQL(CURATOR_VAULTS_V2_QUERY, { addresses: curator.addresses }),
  ]);

  let v1Items = v1Data?.vaults?.items ?? [];
  const v2Items = v2Data?.vaultV2s?.items ?? [];

  if (v1Items.length === 0 && v2Items.length === 0 && curator.name) {
    const searchData = await fetchGraphQL(CURATOR_VAULTS_SEARCH_QUERY, { search: curator.name });
    v1Items = (searchData?.vaults?.items ?? []).filter((vault) =>
      vaultNameMatchesCurator(vault.name, curator.name),
    );
  }

  const vaults = mergeCuratorVaults(
    v1Items,
    v2Items,
  );

  const vaultTvl = vaults.reduce((sum, vault) => sum + Number(vault.state?.totalAssetsUsd ?? 0), 0);

  return {
    vaults,
    curatorAum: curator.aum || vaultTvl,
    curatorName: curator.name,
    curatorImage: curator.image,
    curatorVerified: curator.verified,
  };
}

/**
 * Fetch recent transactions for a vault.
 * V1 includes deposits/withdrawals plus V2-style rebalance events.
 */
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

/** Return the vault's current net APY (matches Morpho's live rate display). */
export function getVaultApy(vault) {
  const netApy = vault?.state?.netApy ?? vault?.netApy;
  if (netApy != null && Number.isFinite(Number(netApy))) {
    return Number(netApy);
  }
  return Number(vault?.state?.avgNetApy ?? vault?.avgNetApy ?? 0);
}

/** Return withdrawable liquidity (token amount, USD, and share of TVL). */
export function getVaultLiquidity(vault) {
  const assets = Number(
    vault?.state?.liquidityAssets
    ?? vault?.liquidity?.underlying
    ?? 0,
  );
  const usd = Number(
    vault?.state?.liquidityUsd
    ?? vault?.liquidity?.usd
    ?? 0,
  );
  const totalAssetsUsd = Number(vault?.state?.totalAssetsUsd ?? 0);
  const shareOfTvl = totalAssetsUsd > 0 ? usd / totalAssetsUsd : 0;

  return { assets, usd, shareOfTvl };
}

/** Return the vault underlying asset decimals (defaults to 18). */
export function getTokenDecimals(vault) {
  return Number(vault?.asset?.decimals ?? 18);
}

/** Return the display symbol for a vault's underlying asset. */
export function getTokenSymbol(vault) {
  return vault?.asset?.symbol ?? vault?.symbol ?? 'Token';
}

/** Build a human-readable market label from loan/collateral symbols. */
function formatMarketLabel(market) {
  const loan = market?.loanAsset?.symbol;
  const collateral = market?.collateralAsset?.symbol;
  if (loan && collateral) return `${loan} / ${collateral}`;
  return market?.marketId ?? 'Unknown market';
}

/** Build sorted allocation rows with percentages for charts and tables. */
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

/** Compute curator-level TVL, weighted APY, and optional 24h deposit/withdrawal totals. */
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

/** Sort activity items newest-first. */
export function normalizeVaultActivity(activities) {
  return [...activities].sort((left, right) => Number(right.timestamp) - Number(left.timestamp));
}