import { formatUsd } from '../lib/format';

function CuratorAvatar({ curator }) {
  if (curator.image) {
    return <img className="curator-avatar" src={curator.image} alt="" />;
  }

  const initial = curator.name?.charAt(0)?.toUpperCase() ?? '?';
  return <div className="curator-avatar curator-avatar-fallback">{initial}</div>;
}

export default function CuratorCard({ curator, onClick }) {
  return (
    <button className="curator-card" type="button" onClick={onClick}>
      <CuratorAvatar curator={curator} />

      <div className="curator-card-body">
        <div className="curator-card-title">
          <h3>{curator.name}</h3>
          {curator.verified ? <span className="curator-verified">Verified</span> : null}
        </div>
        <p className="curator-card-meta">
          {curator.primaryAddress
            ? `${curator.primaryAddress.slice(0, 6)}…${curator.primaryAddress.slice(-4)}`
            : '—'}
        </p>
      </div>

      <div className="curator-card-stats">
        <span>Total AUM</span>
        <strong>{formatUsd(curator.aum)}</strong>
      </div>

      <span className="curator-card-chevron" aria-hidden="true">→</span>
    </button>
  );
}
