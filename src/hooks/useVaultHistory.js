import { useQuery } from '@tanstack/react-query';
import { fetchVaultHistory } from '../lib/morpho';

/**
 * React Query hook — loads TVL/APY history for the selected vault and range.
 * The API auto-picks granularity per range (hourly for a week, daily for a
 * month, weekly for a year / all time), matching Morpho's own chart. Polls once
 * a minute so the trailing edge tracks the live rate while the tab is focused.
 */
export function useVaultHistory(vault, range = 'weekly') {
  return useQuery({
    queryKey: ['vault-history', vault?.vaultVersion ?? 'v1', vault?.address, vault?.chain?.id, range],
    queryFn: () => fetchVaultHistory(vault.address, vault.chain?.id, vault.vaultVersion ?? 'v1', range),
    enabled: Boolean(vault?.address && vault?.chain?.id != null),
    placeholderData: (previous) => previous,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
