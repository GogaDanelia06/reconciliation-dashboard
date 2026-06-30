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

export function TransactionsTable({ transactions, monthKey }: TransactionsTableProps) {
  const { data: companies = [] } = useCompanies();

  // Toolbar state, normalised through Zod so the rest of the component works
  // with a validated TransactionFilters object.
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                status === s ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
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
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm sm:w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">
                <button type="button" onClick={() => toggleSort("entry_date")} className="font-semibold hover:text-slate-900">
                  Date{sortIndicator("entry_date")}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">Sender</th>
              <th className="px-4 py-3 font-semibold">Tax ID</th>
              <th className="px-4 py-3 text-right">
                <button type="button" onClick={() => toggleSort("amount")} className="font-semibold hover:text-slate-900">
                  Amount{sortIndicator("amount")}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Matched company</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(tx.entry_date)}</td>
                <td className="px-4 py-3 text-slate-700">
                  <span className="block max-w-[200px] truncate" title={tx.sender_name ?? ""}>
                    {tx.sender_name ?? "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">{tx.sender_inn ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">{formatGel(tx.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                <td className="px-4 py-3 text-slate-700">{tx.matched_company?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <TransactionRowActions transaction={tx} companies={companies} monthKey={monthKey} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
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
