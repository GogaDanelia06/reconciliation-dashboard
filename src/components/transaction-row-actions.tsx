"use client";

import { useUpdateTransaction } from "@/hooks/use-update-transaction";
import type { Company, TransactionWithCompany } from "@/lib/types";

interface RowActionsProps {
  transaction: TransactionWithCompany;
  companies: Company[];
  monthKey: string;
}

// Per-row manual overrides. Auto (inn_exact) matches are left read-only;
// everything else can be manually matched, ignored, or reset.
export function TransactionRowActions({ transaction, companies, monthKey }: RowActionsProps) {
  const updateTx = useUpdateTransaction();
  const isPending = updateTx.isPending;

  const assignCompany = (companyId: string) => {
    if (!companyId) return;
    updateTx.mutate({ id: transaction.id, status: "matched", matchedCompanyId: companyId, monthKey });
  };

  const setStatus = (status: "unmatched" | "ignored") =>
    updateTx.mutate({ id: transaction.id, status, matchedCompanyId: null, monthKey });

  if (transaction.match_method === "inn_exact") {
    return <span className="text-xs text-muted">auto</span>;
  }

  const ghostBtn =
    "rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-card-hover hover:text-ink disabled:opacity-50";

  return (
    <div className="flex items-center gap-2">
      {transaction.status !== "matched" && (
        <select
          aria-label="Assign company"
          defaultValue=""
          disabled={isPending}
          onChange={(e) => assignCompany(e.target.value)}
          className="max-w-[140px] rounded-md border border-line bg-page px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none disabled:opacity-50"
        >
          <option value="" disabled>
            Match…
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {transaction.status === "unmatched" && (
        <button type="button" disabled={isPending} onClick={() => setStatus("ignored")} className={ghostBtn}>
          Ignore
        </button>
      )}

      {(transaction.status === "ignored" || transaction.match_method === "manual") && (
        <button type="button" disabled={isPending} onClick={() => setStatus("unmatched")} className={ghostBtn}>
          Reset
        </button>
      )}
    </div>
  );
}
