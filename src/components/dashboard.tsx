"use client";

import { useMemo, useState } from "react";
import { DEFAULT_MONTH, MONTHS } from "@/lib/months";
import { computeStats } from "@/lib/stats";
import { useTransactions } from "@/hooks/use-transactions";
import { useExpectedVsActual } from "@/hooks/use-expected-vs-actual";
import { useRunMatching } from "@/hooks/use-run-matching";
import { useResetMatching } from "@/hooks/use-reset-matching";
import { MonthTabs } from "./month-tabs";
import { StatsBar } from "./stats-bar";
import { TransactionsTable } from "./transactions-table";
import { ExpectedVsActual } from "./expected-vs-actual";
import { ThemeToggle } from "./theme-toggle";

export function Dashboard() {
  const [monthKey, setMonthKey] = useState<string>(DEFAULT_MONTH);
  const monthLabel = MONTHS.find((m) => m.key === monthKey)?.label ?? "";

  const transactionsQuery = useTransactions(monthKey);
  const expectedQuery = useExpectedVsActual(monthKey);
  const runMatching = useRunMatching();
  const resetMatching = useResetMatching();

  const stats = useMemo(
    () => computeStats(transactionsQuery.data ?? []),
    [transactionsQuery.data],
  );

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-line bg-page/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-ink shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-ink">Payment Reconciliation</h1>
              <p className="hidden text-xs text-muted sm:block">
                Bank of Georgia transactions matched against service contracts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => resetMatching.mutate()}
              disabled={resetMatching.isPending || runMatching.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-card-hover disabled:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 2.64-6.36M3 3v6h6" />
              </svg>
              {resetMatching.isPending ? "Resetting…" : "Reset"}
            </button>
            <button
              type="button"
              onClick={() => runMatching.mutate()}
              disabled={runMatching.isPending || resetMatching.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${runMatching.isPending ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
              </svg>
              {runMatching.isPending ? "Matching…" : "Run auto-matching"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {runMatching.isSuccess && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 ring-1 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
            Matched {runMatching.data.newly_matched} new transaction(s).
          </p>
        )}
        {resetMatching.isSuccess && (
          <p className="mb-4 rounded-lg bg-card px-4 py-2 text-sm text-muted ring-1 ring-line">
            Reset {resetMatching.data.reset_count} auto-matched transaction(s) to unmatched.
          </p>
        )}
        {runMatching.isError && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 ring-1 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
            {(runMatching.error as Error).message}
          </p>
        )}

        <div className="mb-6">
          <MonthTabs selected={monthKey} onSelect={setMonthKey} />
        </div>

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
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-card-hover" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-card-hover" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
      <p className="font-medium text-red-700 dark:text-red-400">Something went wrong</p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}
