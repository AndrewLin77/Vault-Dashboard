# Morpho Curator Vault Dashboard

A React dashboard for tracking Morpho curator vaults. Browse verified curators, search by name, and drill into listed vaults — TVL, APY, withdrawable liquidity, market allocations, historical trends, and recent activity.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router |
| Data fetching | TanStack Query (React Query) |
| Charts | Recharts |
| API | Morpho GraphQL (`api.morpho.org/graphql`) |

## Getting Started

Requires Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## How It Works

All data comes from the public Morpho GraphQL API (`https://api.morpho.org/graphql`) — no API key required.

- **Curators** are fetched verified-only and ranked by AUM; the landing page shows the top `PRIMARY_CURATORS_COUNT`.
- **Vaults** (V1 + V2) are fetched per curator, merged, and sorted by TVL.
- **Activity and history** are loaded lazily, only for the vault being viewed.

Source layout: `src/pages` (routes), `src/components` (UI), `src/hooks` (React Query data hooks), `src/lib` (`morpho.js` API client, `format.js`, `routes.js`, `explorer.js`).

## Configuration

No environment variables required. Tunables live in `src/config.js`:

## License

MIT
