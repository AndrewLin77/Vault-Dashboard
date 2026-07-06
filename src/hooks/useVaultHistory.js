import { useQuery } from '@tanstack/react-query';
import { fetchVaultHistory } from '../lib/morpho';

/** React Query hook — loads historical APY/TVL for the selected vault only. */
export function useVaultHistory(vault) {
  return useQuery({
    queryKey: ['vault-history', vault?.vaultVersion ?? 'v1', vault?.address, vault?.chain?.id],
    queryFn: () => fetchVaultHistory(vault.address, vault.chain?.id, vault.vaultVersion ?? 'v1'),
    enabled: Boolean(vault?.address && vault?.chain?.id != null),
    staleTime: 10 * 60 * 1000,
  });
}
