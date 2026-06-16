import { useEffect, useMemo, useState } from 'react';
import CuratorInput from './components/CuratorInput';
import OverviewStats from './components/OverviewStats';
import VaultGrid from './components/VaultGrid';
import VaultDetail from './components/VaultDetail';
import { DEFAULT_CURATOR } from './config';
import { useCuratorVaults } from './hooks/useCuratorVaults';
import { useVaultActivities } from './hooks/useVaultActivity';
import {
  calculateAggregateStats,
  normalizeVaultActivity,
} from './lib/morpho';

export default function App() {
  const [input, setInput] = useState(DEFAULT_CURATOR);
  const [curatorQuery, setCuratorQuery] = useState(DEFAULT_CURATOR);
  const [selectedVaultAddress, setSelectedVaultAddress] = useState('');
  const [submitError, setSubmitError] = useState('');

  const vaultsQuery = useCuratorVaults(curatorQuery);
  const vaults = vaultsQuery.data?.vaults ?? [];
  const activityQueries = useVaultActivities(vaults);

  useEffect(() => {
    if (vaults.length && !selectedVaultAddress) {
      setSelectedVaultAddress(vaults[0].address);
    }
    if (!vaults.length) {
      setSelectedVaultAddress('');
    }
  }, [vaults, selectedVaultAddress]);

  const activitiesByVault = useMemo(
    () =>
      Object.fromEntries(
        vaults.map((vault, index) => [vault.address, normalizeVaultActivity(activityQueries[index]?.data ?? [])]),
      ),
    [activityQueries, vaults],
  );

  const stats = useMemo(
    () => calculateAggregateStats(vaults, activitiesByVault, vaultsQuery.data?.curatorAum ?? 0),
    [activitiesByVault, vaults, vaultsQuery.data?.curatorAum],
  );
  const selectedVault = vaults.find((vault) => vault.address === selectedVaultAddress) ?? vaults[0] ?? null;
  const selectedVaultActivity = selectedVault ? activitiesByVault[selectedVault.address] ?? [] : [];
  const curatorName = vaultsQuery.data?.curatorName ?? '';
  const resolvedAddress = vaultsQuery.data?.curatorAddresses?.[0] ?? '';

  function loadCurator(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      setSubmitError('Enter a curator name or address.');
      return;
    }
    setSubmitError('');
    setInput(trimmed);
    setCuratorQuery(trimmed);
    setSelectedVaultAddress('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadCurator(input);
  }

  return (
    <main className="app-shell">
      <div className="background-orb background-orb-a" />
      <div className="background-orb background-orb-b" />
      <div className="content-wrap">
        <CuratorInput
          value={input}
          onChange={(nextValue) => {
            setInput(nextValue);
            if (submitError) setSubmitError('');
          }}
          onSubmit={handleSubmit}
          onSelectSuggestion={loadCurator}
          loading={vaultsQuery.isLoading}
          error={submitError || vaultsQuery.error?.message}
          curatorName={curatorName}
          resolvedAddress={resolvedAddress}
          vaultCount={vaults.length}
        />

        <OverviewStats
          stats={stats}
          vaultCount={vaults.length}
          loading={vaultsQuery.isLoading || activityQueries.some((query) => query.isLoading)}
        />

        {vaultsQuery.isError ? (
          <section className="panel empty-state">
            Could not load vaults for that curator. Try another name or address.
          </section>
        ) : null}

        {!vaultsQuery.isLoading && vaults.length === 0 && curatorQuery ? (
          <section className="panel empty-state">
            No listed vaults were found for this curator.
          </section>
        ) : null}

        {vaults.length ? (
          <>
            <section className="section-header">
              <div>
                <p className="eyebrow">Vault portfolio</p>
                <h2>{curatorName ? `${curatorName} vaults` : 'All vaults'}</h2>
              </div>
            </section>
            <VaultGrid
              vaults={vaults}
              selectedAddress={selectedVaultAddress || selectedVault?.address}
              onSelect={setSelectedVaultAddress}
            />
            <VaultDetail vault={selectedVault} activity={selectedVaultActivity} />
          </>
        ) : null}
      </div>
    </main>
  );
}
