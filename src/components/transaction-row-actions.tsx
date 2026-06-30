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
    return <span className="text-xs text-slate-400">auto</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {transaction.status !== "matched" && (
        <select
          aria-label="Assign company"
          defaultValue=""
          disabled={isPending}
          onChange={(e) => assignCompany(e.target.value)}
          className="max-w-[140px] rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-50"
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
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus("ignored")}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
        >
          Ignore
        </button>
      )}

      {(transaction.status === "ignored" || transaction.match_method === "manual") && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus("unmatched")}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
        >
          Reset
        </button>
      )}
    </div>
  );
}
