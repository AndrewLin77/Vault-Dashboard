import { getAddressExplorerUrl } from '../lib/explorer';

/** External link to view a vault address on the chain's block explorer. */
export default function AddressLink({ address, chainId = 1, className = 'address-link' }) {
  if (!address) return null;

  return (
    <a
      className={className}
      href={getAddressExplorerUrl(address, chainId)}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => event.stopPropagation()}
    >
      {address}
    </a>
  );
}
