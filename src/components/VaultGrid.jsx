import VaultCard from './VaultCard';

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
