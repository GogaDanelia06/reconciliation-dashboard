"use client";

import { useMemo, useState } from "react";
import { DEFAULT_MONTH, MONTHS } from "@/lib/months";
import { computeStats } from "@/lib/stats";
import { useTransactions } from "@/hooks/use-transactions";
import { useExpectedVsActual } from "@/hooks/use-expected-vs-actual";
import { useRunMatching } from "@/hooks/use-run-matching";
import { useResetMatching } from "@/hooks/use-reset-matching";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { Sidebar, SECTIONS } from "./sidebar";
import { StatsBar } from "./stats-bar";
import { TransactionsTable } from "./transactions-table";
import { ExpectedVsActual } from "./expected-vs-actual";

export function Dashboard() {
  const [monthKey, setMonthKey] = useState<string>(DEFAULT_MONTH);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const monthLabel = MONTHS.find((m) => m.key === monthKey)?.label ?? "";

  const sectionIds = useMemo(() => SECTIONS.map((s) => s.id), []);
  const activeSection = useScrollSpy(sectionIds);

  const transactionsQuery = useTransactions(monthKey);
  const expectedQuery = useExpectedVsActual(monthKey);
  const runMatching = useRunMatching();
  const resetMatching = useResetMatching();

  const stats = useMemo(
    () => computeStats(transactionsQuery.data ?? []),
    [transactionsQuery.data],
  );

  const navigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  };
  const selectMonth = (key: string) => {
    setMonthKey(key);
    setSidebarOpen(false);
  };

  const busy = runMatching.isPending || resetMatching.isPending;

  return (
    <div className="min-h-screen">
      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-card transition-transform duration-200 lg:w-64 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          selectedMonth={monthKey}
          onSelectMonth={selectMonth}
          activeSection={activeSection}
          onNavigate={navigate}
        />
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Sticky action bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-page/80 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-card-hover hover:text-ink lg:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold tracking-tight text-ink sm:text-lg">Payment Reconciliation</h1>
                <p className="hidden truncate text-xs text-muted sm:block">{monthLabel} · Bank of Georgia transactions vs contracts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => resetMatching.mutate()}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-card-hover disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 2.64-6.36M3 3v6h6" /></svg>
                <span className="hidden sm:inline">{resetMatching.isPending ? "Resetting…" : "Reset"}</span>
              </button>
              <button
                type="button"
                onClick={() => runMatching.mutate()}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 ${runMatching.isPending ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" /></svg>
                <span className="sm:hidden">{runMatching.isPending ? "…" : "Match"}</span>
                <span className="hidden sm:inline">{runMatching.isPending ? "Matching…" : "Run auto-matching"}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
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
          {(runMatching.isError || resetMatching.isError) && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 ring-1 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
              {((runMatching.error ?? resetMatching.error) as Error).message}
            </p>
          )}

          {transactionsQuery.isPending ? (
            <LoadingState />
          ) : transactionsQuery.isError ? (
            <ErrorState
              message={(transactionsQuery.error as Error).message}
              onRetry={() => transactionsQuery.refetch()}
            />
          ) : (
            <div className="space-y-8">
              <section id="overview" className="scroll-mt-24">
                <SectionHeading title="Overview" subtitle={monthLabel} />
                <StatsBar stats={stats} />
              </section>

              <section id="transactions" className="scroll-mt-24">
                <SectionHeading title="Transactions" subtitle={`${transactionsQuery.data.length} this month`} />
                <TransactionsTable transactions={transactionsQuery.data} monthKey={monthKey} />
              </section>

              <section id="reconciliation" className="scroll-mt-24">
                <ExpectedVsActual rows={expectedQuery.data ?? []} monthLabel={monthLabel} />
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      {subtitle && <span className="text-sm text-muted">{subtitle}</span>}
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
