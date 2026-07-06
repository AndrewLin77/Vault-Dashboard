import { useMemo, useState } from 'react';
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { calculateSeriesAverage, filterSeriesByApyRange } from '../lib/morpho';
import { formatPercent, formatUsd } from '../lib/format';

const APY_RANGES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'allTime', label: 'All time' },
];

function formatChartDate(timestampMs) {
  return new Date(Number(timestampMs)).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function HistoryMiniChart({ points, color, valueFormatter, chartKey, average }) {
  if (!points?.length) {
    return <div className="empty-state history-empty">No history returned.</div>;
  }

  return (
    <div className="history-mini-chart">
      <ResponsiveContainer width="100%" height={140}>
        <LineChart key={chartKey} data={points}>
          <XAxis
            dataKey="timestampMs"
            type="number"
            domain={['dataMin', 'dataMax']}
            hide
          />
          <YAxis hide domain={['auto', 'auto']} />
          {Number.isFinite(average) ? (
            <ReferenceLine
              y={average}
              stroke="#94a3b8"
              strokeOpacity={0.7}
              strokeWidth={1}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={{
                value: `avg ${valueFormatter(average)}`,
                position: 'insideTopRight',
                fill: '#94a3b8',
                fontSize: 10,
              }}
            />
          ) : null}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.2}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            formatter={(value) => valueFormatter(Number(value))}
            labelFormatter={(label) => formatChartDate(label)}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              background: 'rgba(2, 6, 23, 0.9)',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Small APY + TVL history panel for the selected vault. */
export default function HistoryCharts({ history, loading = false }) {
  const [apyRange, setApyRange] = useState('weekly');

  const tvlPoints = history?.tvlUsd ?? [];
  const apyPoints = useMemo(
    () => filterSeriesByApyRange(history?.apy ?? [], apyRange),
    [history, apyRange],
  );
  const apyAverage = useMemo(() => calculateSeriesAverage(apyPoints), [apyPoints]);

  if (loading) {
    return (
      <section className="panel detail-block history-panel">
        <h3>Historical trend</h3>
        <div className="loading-block">Loading history…</div>
      </section>
    );
  }

  return (
    <section className="panel detail-block history-panel">
      <h3>Historical trend</h3>
      <div className="history-grid">
        <div className="history-card">
          <div className="history-card-head">
            <strong>TVL (USD)</strong>
          </div>
          <HistoryMiniChart points={tvlPoints} color="#60a5fa" valueFormatter={formatUsd} chartKey="tvl" />
        </div>

        <div className="history-card">
          <div className="history-card-head">
            <strong>Net APY</strong>
          </div>

          <div className="history-range-toggle" role="tablist" aria-label="APY range">
            {APY_RANGES.map((range) => (
              <button
                key={range.id}
                type="button"
                role="tab"
                aria-selected={apyRange === range.id}
                className={`history-range-button ${apyRange === range.id ? 'active' : ''}`}
                onClick={() => setApyRange(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>

          <HistoryMiniChart
            points={apyPoints}
            color="#34d399"
            valueFormatter={formatPercent}
            chartKey={`apy-${apyRange}`}
            average={apyAverage}
          />
        </div>
      </div>
    </section>
  );
}
