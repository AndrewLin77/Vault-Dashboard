import { useQuery } from '@tanstack/react-query';
import { fetchCuratorVaults } from '../lib/morpho';

export function useCuratorVaults(curatorAddress) {
  return useQuery({
    queryKey: ['curator-vaults', curatorAddress],
    queryFn: () => fetchCuratorVaults(curatorAddress),
    enabled: Boolean(curatorAddress),
  });
}