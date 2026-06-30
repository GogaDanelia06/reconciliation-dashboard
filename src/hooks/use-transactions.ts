import { useQuery } from "@tanstack/react-query";
import { fetchTransactionsByMonth } from "@/lib/services/transactions";
import { queryKeys } from "@/lib/query-keys";

export function useTransactions(monthKey: string) {
  return useQuery({
    queryKey: queryKeys.transactions.byMonth(monthKey),
    queryFn: () => fetchTransactionsByMonth(monthKey),
  });
}
