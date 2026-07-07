function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`.trim()} style={style} aria-hidden="true" />;
}

export function CuratorListSkeleton({ count = 6 }) {
  return (
    <div className="curator-list" aria-busy="true" aria-label="Loading curators">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-curator-card" key={index}>
          <Skeleton className="skeleton-avatar" />
          <div className="skeleton-curator-body">
            <Skeleton className="skeleton-line skeleton-line-title" />
            <Skeleton className="skeleton-line skeleton-line-short" />
          </div>
          <div className="skeleton-curator-stats">
            <Skeleton className="skeleton-line skeleton-line-label" />
            <Skeleton className="skeleton-line skeleton-line-value" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CuratorPageHeaderSkeleton() {
  return (
    <section className="section-header curator-view-header curator-page-header" aria-hidden="true">
      <Skeleton className="skeleton-avatar skeleton-avatar-lg" />
      <div className="curator-page-header-copy">
        <Skeleton className="skeleton-line skeleton-line-eyebrow" />
        <Skeleton className="skeleton-line skeleton-line-hero" />
      </div>
    </section>
  );
}

export function StatsGridSkeleton() {
  return (
    <section className="stats-grid" aria-busy="true" aria-label="Loading stats">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="skeleton-stat-card" key={index}>
          <Skeleton className="skeleton-line skeleton-line-label" />
          <Skeleton className="skeleton-line skeleton-line-stat" />
          <Skeleton className="skeleton-line skeleton-line-short" />
        </div>
      ))}
    </section>
  );
}

export function VaultGridSkeleton({ count = 4 }) {
  return (
    <section className="vault-list" aria-busy="true" aria-label="Loading vaults">
      <div className="vault-grid">
        {Array.from({ length: count }, (_, index) => (
          <div className="skeleton-vault-card" key={index}>
            <div className="skeleton-vault-main">
              <div className="skeleton-vault-header">
                <div>
                  <Skeleton className="skeleton-line skeleton-line-tag" />
                  <Skeleton className="skeleton-line skeleton-line-title" />
                </div>
                <Skeleton className="skeleton-line skeleton-line-tag" />
              </div>
              <div className="skeleton-vault-metrics">
                {Array.from({ length: 4 }, (__, metricIndex) => (
                  <div className="skeleton-metric" key={metricIndex}>
                    <Skeleton className="skeleton-line skeleton-line-label" />
                    <Skeleton className="skeleton-line skeleton-line-value" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HistoryChartsSkeleton() {
  return (
    <div className="history-grid" aria-busy="true" aria-label="Loading charts">
      {Array.from({ length: 2 }, (_, index) => (
        <div className="history-card skeleton-history-card" key={index}>
          <Skeleton className="skeleton-line skeleton-line-title" />
          <Skeleton className="skeleton-chart" />
        </div>
      ))}
    </div>
  );
}

export function ActivityListSkeleton({ count = 5 }) {
  return (
    <div className="activity-list" aria-busy="true" aria-label="Loading activity">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-activity-row" key={index}>
          <Skeleton className="skeleton-badge" />
          <div className="skeleton-activity-copy">
            <Skeleton className="skeleton-line skeleton-line-value" />
            <Skeleton className="skeleton-line skeleton-line-short" />
          </div>
          <Skeleton className="skeleton-line skeleton-line-hash" />
        </div>
      ))}
    </div>
  );
}

export function VaultDetailSkeleton() {
  return (
    <section className="vault-detail-view" aria-busy="true" aria-label="Loading vault">
      <div className="panel detail-hero skeleton-detail-hero">
        <div className="skeleton-detail-copy">
          <Skeleton className="skeleton-line skeleton-line-tag" />
          <Skeleton className="skeleton-line skeleton-line-hero" />
          <Skeleton className="skeleton-line skeleton-line-address" />
        </div>
        <div className="skeleton-detail-summary">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="skeleton-metric" key={index}>
              <Skeleton className="skeleton-line skeleton-line-label" />
              <Skeleton className="skeleton-line skeleton-line-value" />
            </div>
          ))}
        </div>
      </div>
      <div className="panel detail-block history-panel">
        <div className="history-panel-head">
          <Skeleton className="skeleton-line skeleton-line-title" />
          <Skeleton className="skeleton-range-toggle" />
        </div>
        <HistoryChartsSkeleton />
      </div>
    </section>
  );
}

export default Skeleton;
