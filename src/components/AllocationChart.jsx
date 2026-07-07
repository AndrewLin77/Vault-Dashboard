import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
const COLORS = ['#f97316', '#14b8a6', '#60a5fa', '#e879f9', '#f43f5e', '#84cc16', '#c084fc'];

/** Donut chart and list breakdown of a vault's market allocations. */
export default function AllocationChart({ allocations }) {
  if (!allocations.length) {
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
            <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
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
            <strong>{allocation.percentage.toFixed(2)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}