import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTransactionMatch } from "@/lib/services/transactions";
import { queryKeys } from "@/lib/query-keys";
import type { TransactionStatus, TransactionWithCompany } from "@/lib/types";

interface UpdateArgs {
  id: string;
  status: TransactionStatus;
  matchedCompanyId: string | null;
  monthKey: string;
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, matchedCompanyId }: UpdateArgs) =>
      updateTransactionMatch({ id, status, matchedCompanyId }),

    onMutate: async (vars) => {
      const key = queryKeys.transactions.byMonth(vars.monthKey);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TransactionWithCompany[]>(key);

      queryClient.setQueryData<TransactionWithCompany[]>(key, (old) =>
        old?.map((tx) =>
          tx.id === vars.id
            ? {
                ...tx,
                status: vars.status,
                matched_company_id: vars.matchedCompanyId,
                match_method: vars.matchedCompanyId ? "manual" : null,
                match_confidence: vars.matchedCompanyId ? 1.0 : null,
              }
            : tx,
        ),
      );

      return { previous, key };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.byMonth(vars.monthKey),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.expectedVsActual.byMonth(vars.monthKey),
      });
    },
  });
}
