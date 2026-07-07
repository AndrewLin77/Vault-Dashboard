import { useMemo, useState } from 'react';
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { HISTORY_RANGES, calculateSeriesAverage } from '../lib/morpho';
import { useVaultHistory } from '../hooks/useVaultHistory';
import { HistoryChartsSkeleton } from './Skeleton';
import { formatPercent, formatUsd } from '../lib/format';

function formatChartDate(timestampMs) {
  return new Date(Number(timestampMs)).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatChartTickDate(timestampMs) {
  return new Date(Number(timestampMs)).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
  });
}

const AXIS_TICK_STYLE = { fill: '#94a3b8', fontSize: 10 };
const AXIS_LINE_STYLE = { stroke: 'rgba(148, 163, 184, 0.2)' };

function HistoryMiniChart({ points, color, valueFormatter, chartKey, average }) {
  if (!points?.length) {
    return <div className="empty-state history-empty">No history returned.</div>;
  }

  return (
    <div className="history-mini-chart">
      <ResponsiveContainer width="100%" height={168}>
        <LineChart key={chartKey} data={points} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="timestampMs"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatChartTickDate}
            tick={AXIS_TICK_STYLE}
            axisLine={AXIS_LINE_STYLE}
            tickLine={false}
            minTickGap={36}
            dy={6}
          />
          <YAxis
            tickFormatter={valueFormatter}
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={56}
            tickCount={4}
            domain={['auto', 'auto']}
          />
          {Number.isFinite(average) ? (
            <ReferenceLine
              y={average}
              stroke="#94a3b8"
              strokeOpacity={0.7}
              strokeWidth={1}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={{
                value: `Avg: ${valueFormatter(average)}`,
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

/** TVL + net APY history for the selected vault, with a Morpho-style range selector. */
export default function HistoryCharts({ vault }) {
  const [range, setRange] = useState('weekly');
  const { data: history, isLoading } = useVaultHistory(vault, range);

  const tvlPoints = history?.tvlUsd ?? [];
  const apyPoints = history?.apy ?? [];
  const apyAverage = useMemo(() => calculateSeriesAverage(apyPoints), [apyPoints]);

  return (
    <section className="panel detail-block history-panel">
      <div className="history-panel-head">
        <h3>Historical trend</h3>
        <div className="history-range-toggle" role="tablist" aria-label="History range">
          {HISTORY_RANGES.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={range === option.id}
              className={`history-range-button ${range === option.id ? 'active' : ''}`}
              onClick={() => setRange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <HistoryChartsSkeleton />
      ) : (
        <div className="history-grid">
          <div className="history-card">
            <div className="history-card-head">
              <strong>TVL (USD)</strong>
            </div>
            <HistoryMiniChart
              points={tvlPoints}
              color="#60a5fa"
              valueFormatter={formatUsd}
              chartKey={`tvl-${range}`}
            />
          </div>

          <div className="history-card">
            <div className="history-card-head">
              <strong>Net APY</strong>
            </div>
            <HistoryMiniChart
              points={apyPoints}
              color="#34d399"
              valueFormatter={formatPercent}
              chartKey={`apy-${range}`}
              average={apyAverage}
            />
          </div>
        </div>
      )}
    </section>
  );
}
