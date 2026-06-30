import type { BankTransaction } from "@/lib/types";

export interface MonthStats {
  total: { count: number; amount: number };
  matched: { count: number; amount: number };
  unmatched: { count: number; amount: number };
  ignored: { count: number; amount: number };
  matchRate: number; // matched / (matched + unmatched); excludes ignored
}

// Derives the stats-bar summary from the month's transactions. Pure function —
// the same list drives both the stats and the (separately filtered) table, so
// the stats always reflect the whole month, not the active filter.
export function computeStats(transactions: BankTransaction[]): MonthStats {
  const acc: MonthStats = {
    total: { count: 0, amount: 0 },
    matched: { count: 0, amount: 0 },
    unmatched: { count: 0, amount: 0 },
    ignored: { count: 0, amount: 0 },
    matchRate: 0,
  };

  for (const tx of transactions) {
    acc.total.count += 1;
    acc.total.amount += tx.amount;
    acc[tx.status].count += 1;
    acc[tx.status].amount += tx.amount;
  }

  const reconcilable = acc.matched.count + acc.unmatched.count;
  acc.matchRate = reconcilable === 0 ? 0 : acc.matched.count / reconcilable;

  return acc;
}
