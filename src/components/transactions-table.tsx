"use client";

import { useMemo, useState } from "react";
import { useCompanies } from "@/hooks/use-companies";
import {
  transactionFiltersSchema,
  type SortField,
  type StatusFilter,
} from "@/lib/schemas";
import { formatDate, formatGel } from "@/lib/format";
import type { TransactionWithCompany } from "@/lib/types";
import { StatusBadge } from "./status-badge";
import { TransactionRowActions } from "./transaction-row-actions";

interface TransactionsTableProps {
  transactions: TransactionWithCompany[];
  monthKey: string;
}

const STATUS_FILTERS: StatusFilter[] = ["all", "matched", "unmatched", "ignored"];

const COLUMN_WIDTHS = ["12%", "16%", "12%", "11%", "12%", "14%", "23%"];

export function TransactionsTable({ transactions, monthKey }: TransactionsTableProps) {
  const { data: companies = [] } = useCompanies();

  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("entry_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filters = transactionFiltersSchema.parse({ status, search, sortField, sortDirection });

  const visible = useMemo(() => {
    const term = filters.search.toLowerCase();
    const rows = transactions.filter((tx) => {
      if (filters.status !== "all" && tx.status !== filters.status) return false;
      if (!term) return true;
      return (
        tx.sender_name?.toLowerCase().includes(term) ||
        tx.sender_inn?.toLowerCase().includes(term) ||
        false
      );
    });

    const dir = filters.sortDirection === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (filters.sortField === "amount") return (a.amount - b.amount) * dir;
      return a.entry_date.localeCompare(b.entry_date) * dir;
    });
  }, [transactions, filters.status, filters.search, filters.sortField, filters.sortDirection]);

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDirection === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-card-hover p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                status === s
                  ? "bg-card text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sender or tax ID…"
          className="w-full rounded-lg border border-line bg-page px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 sm:w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] table-fixed text-left text-sm">
          {/* single line: no whitespace text nodes allowed inside <colgroup> */}
          <colgroup>{COLUMN_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
          <thead className="border-b border-line bg-card-hover text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">
                <button type="button" onClick={() => toggleSort("entry_date")} className="font-semibold transition-colors hover:text-ink">
                  Date{sortIndicator("entry_date")}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">Sender</th>
              <th className="px-4 py-3 font-semibold">Tax ID</th>
              <th className="px-4 py-3 text-right">
                <button type="button" onClick={() => toggleSort("amount")} className="font-semibold transition-colors hover:text-ink">
                  Amount{sortIndicator("amount")}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Matched company</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((tx) => (
              <tr key={tx.id} className="transition-colors hover:bg-card-hover">
                <td className="whitespace-nowrap px-4 py-3 text-ink">{formatDate(tx.entry_date)}</td>
                <td className="px-4 py-3 text-ink">
                  <span className="block truncate" title={tx.sender_name ?? ""}>
                    {tx.sender_name ?? "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">{tx.sender_inn ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-ink">{formatGel(tx.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                <td className="truncate px-4 py-3 text-ink" title={tx.matched_company?.name ?? ""}>
                  {tx.matched_company?.name ?? <span className="text-muted">—</span>}
                </td>
                <td className="px-3 py-3">
                  <TransactionRowActions transaction={tx} companies={companies} monthKey={monthKey} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted">
                  No transactions match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
