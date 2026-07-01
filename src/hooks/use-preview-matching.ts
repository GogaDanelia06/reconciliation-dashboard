import { useMutation } from "@tanstack/react-query";
import { previewMatching } from "@/lib/services/matching";

export function usePreviewMatching() {
  return useMutation({
    mutationFn: (months: string[] | null) => previewMatching(months),
  });
}
