"use client";

import { useMemo, useState } from "react";
import { DEFAULT_MONTH, MONTHS } from "@/lib/months";
import { computeStats } from "@/lib/stats";
import { useTransactions } from "@/hooks/use-transactions";
import { useExpectedVsActual } from "@/hooks/use-expected-vs-actual";
import { useRunMatching } from "@/hooks/use-run-matching";
import { MonthTabs } from "./month-tabs";
import { StatsBar } from "./stats-bar";
import { TransactionsTable } from "./transactions-table";
import { ExpectedVsActual } from "./expected-vs-actual";

export function Dashboard() {
  const [monthKey, setMonthKey] = useState<string>(DEFAULT_MONTH);
  const monthLabel = MONTHS.find((m) => m.key === monthKey)?.label ?? "";

  const transactionsQuery = useTransactions(monthKey);
  const expectedQuery = useExpectedVsActual(monthKey);
  const runMatching = useRunMatching();

  const stats = useMemo(
    () => computeStats(transactionsQuery.data ?? []),
    [transactionsQuery.data],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Reconciliation</h1>
          <p className="text-sm text-slate-500">
            Bank of Georgia transactions matched against service contracts
          </p>
        </div>
        <button
          type="button"
          onClick={() => runMatching.mutate()}
          disabled={runMatching.isPending}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {runMatching.isPending ? "Matching…" : "Run auto-matching"}
        </button>
      </header>

      {runMatching.isSuccess && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 ring-1 ring-green-600/20">
          Matched {runMatching.data.newly_matched} new transaction(s).
        </p>
      )}
      {runMatching.isError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 ring-1 ring-red-600/20">
          {(runMatching.error as Error).message}
        </p>
      )}

      <div className="mb-6">
        <MonthTabs selected={monthKey} onSelect={setMonthKey} />
      </div>

      {/* Loading / error / content */}
      {transactionsQuery.isPending ? (
        <LoadingState />
      ) : transactionsQuery.isError ? (
        <ErrorState
          message={(transactionsQuery.error as Error).message}
          onRetry={() => transactionsQuery.refetch()}
        />
      ) : (
        <div className="space-y-6">
          <StatsBar stats={stats} />
          <TransactionsTable transactions={transactionsQuery.data} monthKey={monthKey} />
          <ExpectedVsActual rows={expectedQuery.data ?? []} monthLabel={monthLabel} />
        </div>
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">Something went wrong</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}
