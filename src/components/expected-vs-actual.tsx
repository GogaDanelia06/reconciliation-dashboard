"use client";

import { formatGel } from "@/lib/format";
import type { ExpectedVsActualRow } from "@/lib/types";

interface ExpectedVsActualProps {
  rows: ExpectedVsActualRow[];
  monthLabel: string;
}

// Row colour rule (per spec):
//   muted — no payment received (actual = 0)
//   green — paid at least the expected amount
//   red   — paid less than expected
function rowAccent(row: ExpectedVsActualRow): string {
  if (row.actual === 0) return "text-muted";
  if (row.actual >= row.expected) return "text-green-600 dark:text-green-400";
  return "text-red-600 dark:text-red-400";
}

function toCsv(rows: ExpectedVsActualRow[]): string {
  const header = ["Company", "Tax ID", "Expected", "Actual", "Difference"];
  const lines = rows.map((r) =>
    [r.company_name, r.tax_id, r.expected, r.actual, r.difference]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function ExpectedVsActual({ rows, monthLabel }: ExpectedVsActualProps) {
  const totals = rows.reduce(
    (acc, r) => ({
      expected: acc.expected + r.expected,
      actual: acc.actual + r.actual,
      difference: acc.difference + r.difference,
    }),
    { expected: 0, actual: 0, difference: 0 },
  );

  const downloadCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expected-vs-actual-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-line p-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Expected vs Actual</h2>
          <p className="text-sm text-muted">{monthLabel} — active contracts vs matched payments</p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={rows.length === 0}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-card-hover disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line bg-card-hover text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 text-right font-semibold">Expected</th>
              <th className="px-4 py-3 text-right font-semibold">Actual</th>
              <th className="px-4 py-3 text-right font-semibold">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.company_id} className="transition-colors hover:bg-card-hover">
                <td className="px-4 py-3 text-ink">{row.company_name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-muted">{formatGel(row.expected)}</td>
                <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${rowAccent(row)}`}>
                  {formatGel(row.actual)}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${rowAccent(row)}`}>
                  {row.difference > 0 ? "+" : ""}
                  {formatGel(row.difference)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted">
                  No active contracts or payments this month.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="border-t border-line bg-card-hover font-semibold text-ink">
              <tr>
                <td className="px-4 py-3">Total</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">{formatGel(totals.expected)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">{formatGel(totals.actual)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {totals.difference > 0 ? "+" : ""}
                  {formatGel(totals.difference)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
