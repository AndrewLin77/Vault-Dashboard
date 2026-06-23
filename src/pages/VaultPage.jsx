import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import VaultDetail from '../components/VaultDetail';
import { useCuratorVaults } from '../hooks/useCuratorVaults';
import { useVaultActivity } from '../hooks/useVaultActivity';
import { normalizeVaultActivity } from '../lib/morpho';
import { curatorPath, decodeCuratorSlug } from '../lib/routes';

export default function VaultPage() {
  const { curatorSlug, chainId, vaultAddress } = useParams();
  const curatorQuery = decodeCuratorSlug(curatorSlug);

  const vaultsQuery = useCuratorVaults(curatorQuery);
  const vaults = vaultsQuery.data?.vaults ?? [];
  const curatorName = vaultsQuery.data?.curatorName || curatorQuery;

  const vault = vaults.find(
    (item) =>
      item.address?.toLowerCase() === vaultAddress?.toLowerCase()
      && String(item.chain?.id) === String(chainId),
  ) ?? null;

  const activityQuery = useVaultActivity(vault);
  const activity = useMemo(
    () => normalizeVaultActivity(activityQuery.data ?? []),
    [activityQuery.data],
  );

  const backTo = curatorPath(curatorName);

  if (vaultsQuery.isLoading) {
    return <div className="loading-block">Loading vault…</div>;
  }

  return (
    <VaultDetail
      vault={vault}
      curatorName={curatorName}
      activity={activity}
      activityLoading={activityQuery.isLoading}
      backTo={backTo}
    />
  );
}
