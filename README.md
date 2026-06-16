# Morpho Curator Vault Dashboard

A React dashboard for tracking Morpho curator vaults. Search any curator by name or address to view their listed vaults — TVL, APY, market allocation breakdowns, and recent activity (deposits, withdrawals, rebalancing). Defaults to **AlphaPing** on load.

---

## Features

- **Curator search** — look up any Morpho curator by name (e.g. `Gauntlet`, `AlphaPing`) or `0x` address via the Morpho API
- **Quick suggestions** — one-click chips for popular curators
- **Vault overview** — USD TVL, net APY (`avgNetApy`), and active market count per vault (V1 + V2)
- **Allocation breakdown** — pie chart + bar list showing each vault's market allocations by supply weight
- **Activity feed** — recent deposits, withdrawals, and rebalancing events sorted by timestamp
- **Aggregate stats** — curator AUM, weighted avg APY, 24h deposit/withdrawal volume across listed vaults

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
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
git clone https://github.com/your-username/morpho-vault-dashboard.git
cd morpho-vault-dashboard
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
├── components/
│   ├── CuratorInput.jsx       # Address input + load button
│   ├── OverviewStats.jsx      # Aggregate stat cards (TVL, avg APY, 24h flows)
│   ├── VaultGrid.jsx          # Grid of vault summary cards
│   ├── VaultCard.jsx          # Individual vault card (assets, APY, utilization)
│   ├── VaultDetail.jsx        # Expanded detail panel (allocations + activity)
│   ├── AllocationChart.jsx    # Pie chart + breakdown list (Recharts)
│   └── ActivityFeed.jsx       # Deposit / withdrawal / rebalance timeline
├── hooks/
│   ├── useCuratorVaults.js    # React Query hook — fetches vaults by curator
│   └── useVaultActivity.js    # React Query hook — fetches vault transactions
├── lib/
│   ├── morpho.js              # GraphQL queries and fetch helpers
│   └── format.js              # Token unit conversion, APY formatting, date helpers
├── App.jsx
└── main.jsx
```

---

## Morpho API

All data comes from the public Morpho GraphQL API — no API key required.

**Endpoint:** `https://api.morpho.org/graphql`

### Fetch vaults by curator

```graphql
query CuratorVaults($curator: String!) {
  vaults(where: { curator: $curator }, first: 20) {
    items {
      address
      name
      symbol
      totalAssets
      state {
        netApy
        utilization
        totalDeposits
        totalWithdrawals
      }
      allocations {
        market { uniqueKey id }
        supplyAssets
      }
    }
  }
}
```

### Fetch vault activity

```graphql
query VaultActivity($vault: String!) {
  vaultTransactions(
    where: { vaultAddress: $vault }
    first: 50
    orderBy: Timestamp
    orderDirection: Desc
  ) {
    items {
      type
      assets
      timestamp
      hash
    }
  }
}
```

### Data formatting notes

- `totalAssets` is in raw token units — divide by the token's decimals (e.g. `1e6` for USDC, `1e18` for ETH/WBTC) before displaying
- `netApy` is a decimal (e.g. `0.0812`) — multiply by 100 to display as `8.12%`
- Allocation percentages: divide each market's `supplyAssets` by the vault's `totalAssets`
- Transaction `type` values: `Deposit`, `Withdrawal`, `Rebalance`

---

## Environment Variables

No environment variables are required — the Morpho GraphQL API is public. If you add a custom RPC or analytics endpoint, create a `.env` file:

```env
VITE_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
```

---

## Example Curators

| Curator | Address |
|---|---|
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
