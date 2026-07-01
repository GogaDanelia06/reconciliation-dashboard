import type { TransactionStatus } from "@/lib/types";

const STATUS_STYLES: Record<TransactionStatus, { label: string; className: string }> = {
  matched: {
    label: "Matched",
    className:
      "bg-green-100 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
  },
  unmatched: {
    label: "Unmatched",
    className:
      "bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  },
  ignored: {
    label: "Ignored",
    className:
      "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
  },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
