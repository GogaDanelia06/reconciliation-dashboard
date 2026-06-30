import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runMatching } from "@/lib/services/matching";
import { queryKeys } from "@/lib/query-keys";

// Runs auto-matching, then invalidates every transactions + expected-vs-actual
// query (matching can touch any month), so all months refetch fresh data.
export function useRunMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runMatching,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.expectedVsActual.all });
    },
  });
}
