import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetMatching } from "@/lib/services/matching";
import { queryKeys } from "@/lib/query-keys";

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
