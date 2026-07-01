import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runMatching } from "@/lib/services/matching";
import { queryKeys } from "@/lib/query-keys";

export function useRunMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (months: string[] | null) => runMatching(months),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.expectedVsActual.all });
    },
  });
}
