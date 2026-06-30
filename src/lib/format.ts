// Small presentation helpers shared across the dashboard.

const currencyFormatter = new Intl.NumberFormat("ka-GE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// "1500" -> "1,500.00 ₾"
export function formatGel(amount: number): string {
  return `${currencyFormatter.format(amount)} ₾`;
}

// "2026-06-03" -> "03 Jun 2026"
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(0)}%`;
}
