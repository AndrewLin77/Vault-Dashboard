import VaultCard from './VaultCard';

export default function VaultGrid({ vaults, selectedAddress, onSelect }) {
  return (
    <section className="vault-grid">
      {vaults.map((vault) => (
        <VaultCard
          key={vault.address}
          vault={vault}
          selected={selectedAddress === vault.address}
          onClick={() => onSelect(vault.address)}
        />
      ))}
    </section>
  );
}