"use client";

import type { ReactNode } from "react";
import { MONTHS } from "@/lib/months";
import { ThemeToggle } from "./theme-toggle";

// Section anchors the sidebar nav links to (shared with the scroll-spy in the
// dashboard).
export const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "reconciliation", label: "Expected vs Actual" },
] as const;

const SECTION_ICONS: Record<string, ReactNode> = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  reconciliation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M12 3v18M3 7h18M6 7l-3 6a3 3 0 0 0 6 0zM18 7l-3 6a3 3 0 0 0 6 0z" />
    </svg>
  ),
};

interface SidebarProps {
  selectedMonth: string;
  onSelectMonth: (key: string) => void;
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function Sidebar({ selectedMonth, onSelectMonth, activeSection, onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 pt-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-ink shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-ink">Reconcile</p>
          <p className="text-xs text-muted">Payments dashboard</p>
        </div>
      </div>

      {/* Period (month navigation) */}
      <nav className="space-y-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">Period</p>
        {MONTHS.map((month) => {
          const isActive = month.key === selectedMonth;
          return (
            <button
              key={month.key}
              type="button"
              onClick={() => onSelectMonth(month.key)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-brand text-brand-ink shadow-sm" : "text-muted hover:bg-card-hover hover:text-ink"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-brand-ink" : "bg-current opacity-40"}`} />
              {month.label}
            </button>
          );
        })}
      </nav>

      {/* Section navigation */}
      <nav className="space-y-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">Sections</p>
        {SECTIONS.map((s) => {
          const isActive = s.id === activeSection;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onNavigate(s.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-card-hover text-ink" : "text-muted hover:bg-card-hover hover:text-ink"
              }`}
            >
              <span className={isActive ? "text-brand" : ""}>{SECTION_ICONS[s.id]}</span>
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-line px-2 pt-4">
        <p className="text-xs text-muted">Bank of Georgia API</p>
        <ThemeToggle />
      </div>
    </div>
  );
}
