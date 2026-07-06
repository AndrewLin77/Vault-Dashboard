import { getExplorerName, getTxExplorerUrl } from '../lib/explorer';

/** External link to view a transaction on the chain's block explorer. */
export default function TxLink({ txHash, chainId = 1, className = 'tx-link', children }) {
  if (!txHash) return null;

  const explorerName = getExplorerName(chainId);

  return (
    <a
      className={className}
      href={getTxExplorerUrl(txHash, chainId)}
      target="_blank"
      rel="noreferrer"
      title={`View transaction on ${explorerName}`}
    >
      {children ?? txHash}
    </a>
  );
}
