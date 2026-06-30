import { MONTHS } from "@/lib/months";

interface MonthTabsProps {
  selected: string;
  onSelect: (monthKey: string) => void;
}

// Apr / May / Jun switcher. The selected month drives stats, the table, and
// the expected-vs-actual section.
export function MonthTabs({ selected, onSelect }: MonthTabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-card p-1 shadow-sm">
      {MONTHS.map((month) => {
        const isActive = month.key === selected;
        return (
          <button
            key={month.key}
            type="button"
            onClick={() => onSelect(month.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand text-brand-ink shadow-sm"
                : "text-muted hover:bg-card-hover hover:text-ink"
            }`}
          >
            {month.label}
          </button>
        );
      })}
    </div>
  );
}
