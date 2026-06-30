import type { TransactionStatus } from "@/lib/types";

// Status → colour mapping, shared by the table and anywhere else a status is
// shown. Green matched, red unmatched, grey ignored (per the spec).
const STATUS_STYLES: Record<TransactionStatus, { label: string; className: string }> = {
  matched: {
    label: "Matched",
    className: "bg-green-100 text-green-800 ring-green-600/20",
  },
  unmatched: {
    label: "Unmatched",
    className: "bg-red-100 text-red-800 ring-red-600/20",
  },
  ignored: {
    label: "Ignored",
    className: "bg-slate-100 text-slate-600 ring-slate-500/20",
  },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}
