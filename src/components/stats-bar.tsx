import { formatGel, formatPercent } from "@/lib/format";
import type { MonthStats } from "@/lib/stats";

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
  dotClass?: string;
}

function StatCard({ label, value, sub, valueClass = "text-ink", dotClass }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        {dotClass && <span className={`h-2 w-2 rounded-full ${dotClass}`} />}
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${valueClass}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{sub}</p>
    </div>
  );
}

export function StatsBar({ stats }: { stats: MonthStats }) {
  const reconcilable = stats.matched.count + stats.unmatched.count;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Total transactions"
        value={String(stats.total.count)}
        sub={formatGel(stats.total.amount)}
      />
      <StatCard
        label="Matched"
        value={String(stats.matched.count)}
        sub={formatGel(stats.matched.amount)}
        valueClass="text-green-600 dark:text-green-400"
        dotClass="bg-green-500"
      />
      <StatCard
        label="Unmatched"
        value={String(stats.unmatched.count)}
        sub={formatGel(stats.unmatched.amount)}
        valueClass="text-red-600 dark:text-red-400"
        dotClass="bg-red-500"
      />
      <StatCard
        label="Match rate"
        value={formatPercent(stats.matchRate)}
        sub={`${stats.matched.count} of ${reconcilable} reconcilable`}
        dotClass="bg-brand"
      />
    </div>
  );
}
