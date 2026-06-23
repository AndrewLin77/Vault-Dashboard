# Morpho Curator Vault Dashboard

A React dashboard for tracking Morpho curator vaults. Browse verified curators, search by name, and drill into listed vaults — TVL, APY, withdrawable liquidity, market allocations, and recent activity.

---

## Features

- **Curator landing page** — top 20 verified curators ranked by AUM on load
- **Curator search** — debounced lookup by name
- **Shareable routes** — browser back/forward and deep links for curators and vaults
- **Vault portfolio** — all listed V1 and V2 vaults for a curator in one grid (no pagination)
- **Per-vault metrics** — USD TVL, current net APY, withdrawable liquidity (% of TVL), and active market count
- **Allocation breakdown** — pie chart and bar list by market supply weight
- **Activity feed** — recent deposits, withdrawals, and rebalancing for the selected vault
- **On-chain links** — vault addresses link to the correct block explorer (Etherscan, Basescan, Arbiscan, etc.)
- **Aggregate stats** — vault count, curator AUM / TVL, and TVL-weighted average APY


## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router |
| Styling | Custom CSS (`src/styles.css`) |
| Data fetching | TanStack Query (React Query) |
| Charts | Recharts |
| API | Morpho GraphQL (`api.morpho.org/graphql`) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-username/Vault-Dashboard.git
cd Vault-Dashboard
npm install
```

### Running locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── pages/
│   ├── HomePage.jsx           # Landing → curator list
│   ├── CuratorPage.jsx        # Vault grid + overview stats
│   └── VaultPage.jsx          # Vault detail wrapper
├── components/
│   ├── CuratorLanding.jsx     # Search + primary curator list
│   ├── CuratorCard.jsx        # Curator row on landing
│   ├── OverviewStats.jsx      # TVL, weighted APY, vault count
│   ├── VaultGrid.jsx          # Grid of vault cards
│   ├── VaultCard.jsx          # Vault summary (TVL, APY, liquidity)
│   ├── VaultDetail.jsx        # Allocations + activity + explorer link
│   ├── AddressLink.jsx        # Block explorer link for vault address
│   ├── AllocationChart.jsx    # Pie chart + breakdown (Recharts)
│   └── ActivityFeed.jsx       # Deposit / withdrawal / rebalance timeline
├── hooks/
│   ├── useCurators.js         # Primary curators + search
│   ├── useCuratorVaults.js    # Vaults for a curator
│   ├── useVaultActivity.js    # Transactions for selected vault
│   └── useDebouncedValue.js   # Search debounce
├── lib/
│   ├── morpho.js              # GraphQL queries and data helpers
│   ├── routes.js              # Path builders and slug decode
│   ├── explorer.js            # Chain → block explorer URLs
│   └── format.js              # Token, APY, and USD formatting
├── config.js                  # PRIMARY_CURATORS_COUNT (20)
├── App.jsx                    # Route definitions
└── main.jsx                   # BrowserRouter + QueryClient
```

---

## Morpho API

All data comes from the public Morpho GraphQL API — no API key required.

**Endpoint:** `https://api.morpho.org/graphql`

### Curators

Primary curators are fetched with `verified: true`, sorted by AUM client-side, and limited to `PRIMARY_CURATORS_COUNT` (20). Search uses `curators(where: { search })`.

### Vaults (V1 + V2)

Listed vaults are fetched separately for V1 (`vaults`) and V2 (`vaultV2s`), filtered by `curatorAddress_in` and `listed: true`, then merged. Test/deployer vaults named `(Deployer)` or `zzzz` are excluded.

```graphql
query CuratorVaults($addresses: [String!]!) {
  vaults(where: { curatorAddress_in: $addresses, listed: true }, first: 50) {
    items {
      address
      name
      liquidity { underlying usd }
      state {
        totalAssets
        totalAssetsUsd
        netApy
        allocation { supplyAssets supplyAssetsUsd market { marketId } }
      }
    }
  }
}
```

```graphql
query CuratorVaultsV2($addresses: [Address!]!) {
  vaultV2s(where: { curatorAddress_in: $addresses, listed: true }, first: 50) {
    items {
      address
      totalAssetsUsd
      netApy
      liquidity
      liquidityUsd
      caps { items { type allocation data { ... on MarketV1CapData { market { marketId } } } } }
    }
  }
}
```

### Activity

Activity is loaded only for the vault being viewed:

- **V1** — `vaultV1Transactions` + `vaultV2AllocationTransactions` (rebalances)
- **V2** — `vaultV2transactions`

### Data formatting notes

- `totalAssets` and `liquidity` are raw token units — divide by the asset's `decimals` before display
- APY uses **`netApy`** (current rate shown on Morpho), not `avgNetApy` (historical average)
- **Liquidity** — V1: `liquidity.usd`; V2: `liquidityUsd` (idle assets + liquidity adapter capacity)
- Allocation percentages: each market's `supplyAssets` divided by vault `totalAssets`
- Transaction types: `Deposit`, `Withdrawal`, `Rebalance`

### Block explorers

Vault addresses link to chain-specific explorers (mainnet → Etherscan, Base → Basescan, Arbitrum → Arbiscan, etc.). See `src/lib/explorer.js` for the full mapping.

---

## Configuration

`src/config.js`:

```js
export const PRIMARY_CURATORS_COUNT = 20;
```

No environment variables are required. The Morpho GraphQL API is public.

---

## Example Curators

| Curator | Address |
|---|---|
| AlphaPing | `0x6788c8ad65E85CCa7224a0B46D061EF7D81F9Da5` |
| Gauntlet | `0x4Ef4C1208F7374d0252767E3992546d61dCf9848` |
| Re7 Labs | `0x86328E3A1A7492E0e0cA1B46021AEE936eCb72C6` |
| Steakhouse | `0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc` |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'add your feature'`
4. Push and open a pull request

---

## License

MIT
