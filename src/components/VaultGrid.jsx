import VaultCard from './VaultCard';

/** Renders a grid of vault summary cards for a curator. */
export default function VaultGrid({ vaults, onVaultSelect }) {
  return (
    <section className="vault-list">
      <div className="vault-grid">
        {vaults.map((vault) => (
          <VaultCard
            key={`${vault.chain?.id}-${vault.address}`}
            vault={vault}
            onClick={() => onVaultSelect(vault)}
          />
        ))}
      </div>
    </section>
  );
}
