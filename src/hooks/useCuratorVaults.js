import { useQuery } from '@tanstack/react-query';
import { fetchCuratorVaults } from '../lib/morpho';

/** React Query hook — fetches all listed V1/V2 vaults for a curator name. */
export function useCuratorVaults(curatorQuery, enabled = true) {
  return useQuery({
    queryKey: ['curator-vaults', curatorQuery],
    queryFn: () => fetchCuratorVaults(curatorQuery),
    enabled: Boolean(curatorQuery) && enabled,
  });
}
