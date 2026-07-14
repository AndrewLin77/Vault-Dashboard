import AddressLink from './AddressLink';
import { formatPercent } from '../lib/format';
import { getVaultFeeRows } from '../lib/morpho';

/** Performance and management fee breakdown for a vault. */
export default function VaultFees({ vault }) {
  const rows = getVaultFeeRows(vault);
  const chainId = vault?.chain?.id;

  if (!rows.length) {
    return <div className="empty-state">No fee data returned for this vault.</div>;
  }

  return (
    <div className="vault-fees-grid">
      {rows.map((row) => (
        <article className="vault-fee-card" key={row.label}>
          <span className="vault-fee-label">{row.label}</span>
          <strong className="vault-fee-value">{formatPercent(row.rate)}</strong>
          <div className="vault-fee-recipient-wrap">
            <span className="vault-fee-recipient-label">Recipient</span>
            {row.recipient ? (
              <AddressLink
                address={row.recipient}
                chainId={chainId}
                className="vault-fee-recipient address-link"
              />
            ) : (
              <span className="muted">—</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
