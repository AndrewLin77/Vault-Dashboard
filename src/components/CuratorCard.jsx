import { formatUsd } from '../lib/format';
import CuratorAvatar from './CuratorAvatar';

/** Clickable row on the landing page showing curator name and AUM. */
export default function CuratorCard({ curator, onClick }) {
  return (
    <button className="curator-card" type="button" onClick={onClick}>
      <CuratorAvatar name={curator.name} image={curator.image} />

      <div className="curator-card-body">
        <div className="curator-card-title">
          <h3>{curator.name}</h3>
          {curator.verified ? <span className="curator-verified">Verified</span> : null}
        </div>
      </div>

      <div className="curator-card-stats">
        <span>Total AUM</span>
        <strong>{formatUsd(curator.aum)}</strong>
      </div>

      <span className="curator-card-chevron" aria-hidden="true">→</span>
    </button>
  );
}
