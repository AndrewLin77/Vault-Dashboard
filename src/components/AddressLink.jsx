import { getAddressExplorerUrl, getExplorerName } from '../lib/explorer';

export default function AddressLink({ address, chainId = 1, className = 'address-link' }) {
  if (!address) return null;

  const explorerName = getExplorerName(chainId);

  return (
    <a
      className={className}
      href={getAddressExplorerUrl(address, chainId)}
      target="_blank"
      rel="noreferrer"
      title={`View on ${explorerName}`}
      onClick={(event) => event.stopPropagation()}
    >
      {address}
    </a>
  );
}
