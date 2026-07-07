import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatTokenAmount, formatUsd } from '../lib/format';

const COLORS = ['#f97316', '#14b8a6', '#60a5fa', '#e879f9', '#f43f5e', '#84cc16', '#c084fc'];

function AllocationTooltip({ active, payload, decimals, symbol }) {
  if (!active || !payload?.length) return null;

  const allocation = payload[0].payload;
  return (
    <div className="allocation-tooltip">
      <strong>{allocation.market}</strong>
      <span>{allocation.percentage.toFixed(2)}%</span>
      <span>{formatUsd(allocation.supplyAssetsUsd)}</span>
      <span>{formatTokenAmount(allocation.supplyAssets, decimals)} {symbol}</span>
    </div>
  );
}

/** Donut chart and list breakdown of a vault's market allocations. */
export default function AllocationChart({ allocations, decimals = 18, symbol = 'Token' }) {  if (!allocations.length) {
    return <div className="empty-state">No allocation data returned for this vault.</div>;
  }

  return (
    <div className="allocation-layout">
      <div className="allocation-chart">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={allocations} dataKey="percentage" nameKey="market" innerRadius={70} outerRadius={110} paddingAngle={3}>
              {allocations.map((entry, index) => (
                <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<AllocationTooltip decimals={decimals} symbol={symbol} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="allocation-list">
        {allocations.map((allocation, index) => (
          <div className="allocation-row" key={allocation.key}>
            <span className="allocation-swatch" style={{ background: COLORS[index % COLORS.length] }} />
            <div className="allocation-copy">
              <strong>{allocation.market}</strong>
            </div>
            <div className="allocation-values">
              <strong>{allocation.percentage.toFixed(2)}%</strong>
              <span>{formatUsd(allocation.supplyAssetsUsd)}</span>
              <small>
                {formatTokenAmount(allocation.supplyAssets, decimals)} {symbol}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}