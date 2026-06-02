import { useEffect, useMemo, useState } from 'react';
import CuratorInput from './components/CuratorInput';
import OverviewStats from './components/OverviewStats';
import VaultGrid from './components/VaultGrid';
import VaultDetail from './components/VaultDetail';
import { useCuratorVaults } from './hooks/useCuratorVaults';
import { useVaultActivities } from './hooks/useVaultActivity';
import {
  calculateAggregateStats,
  normalizeVaultActivity,
  resolveCuratorInput,
} from './lib/morpho';

const INITIAL_INPUT = 'Gauntlet';

export default function App() {
  const [input, setInput] = useState(INITIAL_INPUT);
  const [curatorAddress, setCuratorAddress] = useState(resolveCuratorInput(INITIAL_INPUT));
  const [selectedVaultAddress, setSelectedVaultAddress] = useState('');
  const [submitError, setSubmitError] = useState('');

  const vaultsQuery = useCuratorVaults(curatorAddress);
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

  const stats = useMemo(() => calculateAggregateStats(vaults, activitiesByVault), [activitiesByVault, vaults]);
  const selectedVault = vaults.find((vault) => vault.address === selectedVaultAddress) ?? vaults[0] ?? null;
  const selectedVaultActivity = selectedVault ? activitiesByVault[selectedVault.address] ?? [] : [];

  function handleSubmit(event) {
    event.preventDefault();
    const resolved = resolveCuratorInput(input);
    if (!resolved) {
      setSubmitError('Enter a curator name or address.');
      return;
    }
    setSubmitError('');
    setCuratorAddress(resolved);
    setSelectedVaultAddress('');
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
          loading={vaultsQuery.isLoading}
          error={submitError || vaultsQuery.error?.message}
          resolvedAddress={vaultsQuery.data?.curatorAddresses?.[0] ?? curatorAddress}
        />

        <OverviewStats
          stats={stats}
          vaultCount={vaults.length}
          loading={vaultsQuery.isLoading || activityQueries.some((query) => query.isLoading)}
        />

        {vaultsQuery.isError ? (
          <section className="panel empty-state">
            Could not load vaults for that curator. Try another address or curator name.
          </section>
        ) : null}

        {!vaultsQuery.isLoading && vaults.length === 0 && curatorAddress ? (
          <section className="panel empty-state">
            No vaults were found for this curator.
          </section>
        ) : null}

        {vaults.length ? (
          <>
            <section className="section-header">
              <div>
                <p className="eyebrow">Curator vaults</p>
                <h2>Vault overview</h2>
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