import { formatGel, formatPercent } from "@/lib/format";
import type { MonthStats } from "@/lib/stats";

// Donut ring for the match rate (by count), drawn with two SVG circles: a track
// and a progress arc whose dash offset encodes the percentage.
function Donut({ rate }: { rate: number }) {
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - rate);

  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-line" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="fill-none stroke-brand transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-ink">{formatPercent(rate)}</span>
        <span className="text-xs text-muted">matched</span>
      </div>
    </div>
  );
}

interface LegendRowProps {
  label: string;
  count: number;
  amount: number;
  dotClass: string;
}

function LegendRow({ label, count, amount, dotClass }: LegendRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="flex items-center gap-2 text-sm text-ink">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        {label}
      </span>
      <span className="text-sm text-muted">
        <span className="font-medium text-ink">{count}</span> · {formatGel(amount)}
      </span>
    </div>
  );
}

export function OverviewChart({ stats }: { stats: MonthStats }) {
  const total = stats.total.amount || 1; // avoid divide-by-zero
  const seg = (amount: number) => `${(amount / total) * 100}%`;

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-ink">Reconciliation progress</h3>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <Donut rate={stats.matchRate} />

        <div className="w-full flex-1">
          <LegendRow label="Matched" count={stats.matched.count} amount={stats.matched.amount} dotClass="bg-green-500" />
          <LegendRow label="Unmatched" count={stats.unmatched.count} amount={stats.unmatched.amount} dotClass="bg-red-500" />
          {stats.ignored.count > 0 && (
            <LegendRow label="Ignored" count={stats.ignored.count} amount={stats.ignored.amount} dotClass="bg-slate-400" />
          )}

          {/* Stacked bar — share of total amount by status */}
          <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-line">
            <div className="bg-green-500 transition-all duration-700" style={{ width: seg(stats.matched.amount) }} />
            <div className="bg-red-500 transition-all duration-700" style={{ width: seg(stats.unmatched.amount) }} />
            <div className="bg-slate-400 transition-all duration-700" style={{ width: seg(stats.ignored.amount) }} />
          </div>
          <p className="mt-2 text-xs text-muted">Share of {formatGel(stats.total.amount)} total by status</p>
        </div>
      </div>
    </div>
  );
}
