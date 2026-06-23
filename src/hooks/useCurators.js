import { useQuery } from '@tanstack/react-query';
import { fetchPrimaryCurators, searchCurators } from '../lib/morpho';
import { PRIMARY_CURATORS_COUNT } from '../config';

export function usePrimaryCurators() {
  return useQuery({
    queryKey: ['primary-curators', PRIMARY_CURATORS_COUNT],
    queryFn: () => fetchPrimaryCurators(PRIMARY_CURATORS_COUNT),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCuratorSearch(search) {
  const trimmed = search.trim();

  return useQuery({
    queryKey: ['curator-search', trimmed],
    queryFn: () => searchCurators(trimmed, 20),
    enabled: trimmed.length > 0,
  });
}
