import { useQuery } from "@tanstack/react-query";
import { fetchExpectedVsActual } from "@/lib/services/reconciliation";
import { queryKeys } from "@/lib/query-keys";

export function useExpectedVsActual(monthKey: string) {
  return useQuery({
    queryKey: queryKeys.expectedVsActual.byMonth(monthKey),
    queryFn: () => fetchExpectedVsActual(monthKey),
  });
}
