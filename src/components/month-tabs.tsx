import { MONTHS } from "@/lib/months";

interface MonthTabsProps {
  selected: string;
  onSelect: (monthKey: string) => void;
}

// Apr / May / Jun switcher. The selected month drives stats, the table, and
// the expected-vs-actual section.
export function MonthTabs({ selected, onSelect }: MonthTabsProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      {MONTHS.map((month) => {
        const isActive = month.key === selected;
        return (
          <button
            key={month.key}
            type="button"
            onClick={() => onSelect(month.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {month.label}
          </button>
        );
      })}
    </div>
  );
}
