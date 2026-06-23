import { useQuery } from '@tanstack/react-query';
import { fetchCuratorVaults } from '../lib/morpho';

export function useCuratorVaults(curatorQuery, enabled = true) {
  return useQuery({
    queryKey: ['curator-vaults', curatorQuery],
    queryFn: () => fetchCuratorVaults(curatorQuery),
    enabled: Boolean(curatorQuery) && enabled,
  });
}