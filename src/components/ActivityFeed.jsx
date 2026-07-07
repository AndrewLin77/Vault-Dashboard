import { formatDateTime, formatRelativeTime, formatTokenAmount } from '../lib/format';
import TxLink from './TxLink';

const TYPE_LABELS = {
  Deposit: 'Deposit',
  Withdrawal: 'Withdrawal',
  Rebalance: 'Rebalance',
};

function truncateTxHash(txHash) {
  if (!txHash || txHash.length < 14) return txHash ?? '—';
  return `${txHash.slice(0, 10)}…`;
}

/** Chronological list of deposits, withdrawals, and rebalances for a vault. */
export default function ActivityFeed({ activity, decimals = 18, symbol = 'assets', chainId = 1 }) {
  if (!activity.length) {
    return <div className="empty-state">No recent activity returned for this vault.</div>;
  }

  return (
    <div className="activity-list">
      {activity.map((item) => (
        <article className="activity-row" key={item.txHash + item.timestamp}>
          <div className={`activity-badge activity-${item.type?.toLowerCase() ?? 'unknown'}`}>
            {TYPE_LABELS[item.type] ?? item.type ?? 'Event'}
          </div>
          <div className="activity-copy">
            <strong>
              {formatTokenAmount(item.assets, decimals)} {symbol}
            </strong>
            <span>{formatDateTime(item.timestamp)}</span>
            <small>{formatRelativeTime(item.timestamp)}</small>
          </div>
          {item.txHash ? (
            <TxLink txHash={item.txHash} chainId={chainId} className="activity-hash tx-link">
              {truncateTxHash(item.txHash)}
            </TxLink>
          ) : (
            <span className="activity-hash">—</span>
          )}
        </article>
      ))}
    </div>
  );
}