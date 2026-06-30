import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchVaultActivity } from '../lib/morpho';

/** React Query hook — loads recent transactions for a single vault. */
export function useVaultActivity(vault) {
  return useQuery({
    queryKey: ['vault-activity', vault?.vaultVersion ?? 'v1', vault?.address, vault?.chain?.id],
    queryFn: () => fetchVaultActivity(vault.address, vault.chain?.id, vault.vaultVersion ?? 'v1'),
    enabled: Boolean(vault?.address && vault?.chain?.id != null),
  });
}

/** React Query hook — loads activity for multiple vaults in parallel (batch use). */
export function useVaultActivities(vaults) {
  return useQueries({
    queries: vaults.map((vault) => ({
      queryKey: ['vault-activity', vault.vaultVersion ?? 'v1', vault.address, vault.chain?.id],
      queryFn: () => fetchVaultActivity(vault.address, vault.chain?.id, vault.vaultVersion ?? 'v1'),
      enabled: Boolean(vault.address && vault.chain?.id != null),
    })),
  });
}
