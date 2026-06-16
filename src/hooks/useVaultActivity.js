import { useQueries } from '@tanstack/react-query';
import { fetchVaultActivity } from '../lib/morpho';

export function useVaultActivities(vaults) {
  return useQueries({
    queries: vaults.map((vault) => ({
      queryKey: ['vault-activity', vault.vaultVersion ?? 'v1', vault.address, vault.chain?.id],
      queryFn: () => fetchVaultActivity(vault.address, vault.chain?.id, vault.vaultVersion ?? 'v1'),
      enabled: Boolean(vault.address && vault.chain?.id != null),
    })),
  });
}