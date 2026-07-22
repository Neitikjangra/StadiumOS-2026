'use client';

export interface ComparisonRow {
  label: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
}

export function ComparisonTable({
  rows,
  unit,
  title,
}: {
  rows: ComparisonRow[];
  unit: string;
  title: string;
}) {
  return (
    <div className="w-full">
      <h4 className="text-sm font-medium text-text-secondary mb-3">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-medium text-text-muted">Source</th>
              <th className="text-right py-2 px-3 font-medium text-text-muted">Current</th>
              <th className="text-right py-2 px-3 font-medium text-text-muted">Previous</th>
              <th className="text-right py-2 px-3 font-medium text-text-muted">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border hover:bg-surface-alt transition-colors">
                <td className="py-2 px-3 font-medium text-text-primary">{row.label}</td>
                <td className="py-2 px-3 text-right tabular-nums text-text-primary">{row.current}{unit}</td>
                <td className="py-2 px-3 text-right tabular-nums text-text-muted">{row.previous}{unit}</td>
                <td className={`py-2 px-3 text-right font-medium tabular-nums ${row.change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {row.change >= 0 ? '+' : ''}{row.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
