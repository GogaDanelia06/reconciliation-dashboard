import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/lib/services/companies";
import { queryKeys } from "@/lib/query-keys";

export function useCompanies() {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: fetchCompanies,
    staleTime: 5 * 60 * 1000, // reference data; rarely changes
  });
}
