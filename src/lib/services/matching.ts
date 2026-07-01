import { supabase } from "@/lib/supabase/client";
import type { MatchPreviewRow, MatchingResult, ResetResult } from "@/lib/types";

type MonthScope = string[] | null;

export async function previewMatching(months: MonthScope): Promise<MatchPreviewRow[]> {
  const { data, error } = await supabase.rpc("preview_matching", { p_months: months });

  if (error) throw new Error(`Preview failed: ${error.message}`);

  return (data ?? []).map((row: MatchPreviewRow) => ({ ...row, amount: Number(row.amount) }));
}

export async function runMatching(months: MonthScope): Promise<MatchingResult> {
  const { data, error } = await supabase.rpc("run_matching", { p_months: months });

  if (error) throw new Error(`Matching failed: ${error.message}`);

  const row = Array.isArray(data) ? data[0] : data;
  return { newly_matched: row?.newly_matched ?? 0 };
}

export async function resetMatching(): Promise<ResetResult> {
  const { data, error } = await supabase.rpc("reset_matching");

  if (error) throw new Error(`Reset failed: ${error.message}`);

  const row = Array.isArray(data) ? data[0] : data;
  return { reset_count: row?.reset_count ?? 0 };
}
