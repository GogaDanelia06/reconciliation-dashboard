import { formatGel, formatPercent } from "@/lib/format";
import type { MonthStats } from "@/lib/stats";

interface StatCardProps {
  label: string;
  count: number;
  amount: string;
  accent: string;
}

function StatCard({ label, count, amount, accent }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent}`}>{count}</p>
      <p className="mt-0.5 text-sm text-slate-500">{amount}</p>
    </div>
  );
}

export function StatsBar({ stats }: { stats: MonthStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Total transactions"
        count={stats.total.count}
        amount={formatGel(stats.total.amount)}
        accent="text-slate-900"
      />
      <StatCard
        label="Matched"
        count={stats.matched.count}
        amount={formatGel(stats.matched.amount)}
        accent="text-green-600"
      />
      <StatCard
        label="Unmatched"
        count={stats.unmatched.count}
        amount={formatGel(stats.unmatched.amount)}
        accent="text-red-600"
      />
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Match rate</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {formatPercent(stats.matchRate)}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          {stats.matched.count} of {stats.matched.count + stats.unmatched.count} reconcilable
        </p>
      </div>
    </div>
  );
}
