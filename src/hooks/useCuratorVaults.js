import { useQuery } from '@tanstack/react-query';
import { fetchCuratorVaults } from '../lib/morpho';

export function useCuratorVaults(curatorQuery) {
  return useQuery({
    queryKey: ['curator-vaults', curatorQuery],
    queryFn: () => fetchCuratorVaults(curatorQuery),
    enabled: Boolean(curatorQuery),
  });
}