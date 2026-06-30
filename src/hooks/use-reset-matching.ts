import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetMatching } from "@/lib/services/matching";
import { queryKeys } from "@/lib/query-keys";

// Reverts all auto matches, then invalidates every transactions +
// expected-vs-actual query so all months refetch fresh data.
export function useResetMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetMatching,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.expectedVsActual.all });
    },
  });
}
