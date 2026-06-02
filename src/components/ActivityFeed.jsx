import { formatCompactNumber, formatDateTime, formatRelativeTime } from '../lib/format';

const TYPE_LABELS = {
  Deposit: 'Deposit',
  Withdrawal: 'Withdrawal',
  Rebalance: 'Rebalance',
};

export default function ActivityFeed({ activity, decimals = 18 }) {
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
            <strong>{formatCompactNumber(Number(item.assets ?? 0) / 10 ** decimals)} assets</strong>
            <span>{formatDateTime(item.timestamp)}</span>
            <small>{formatRelativeTime(item.timestamp)}</small>
          </div>
          <code className="activity-hash">{item.txHash.slice(0, 10)}…</code>
        </article>
      ))}
    </div>
  );
}