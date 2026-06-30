import { supabase } from "@/lib/supabase/client";
import type { MatchingResult } from "@/lib/types";

// Runs the auto-matching RPC (sender_inn = company.tax_id). The whole match
// happens server-side in one atomic UPDATE; we just read back how many rows
// were newly matched so the UI can report it.
export async function runMatching(): Promise<MatchingResult> {
  const { data, error } = await supabase.rpc("run_matching");

  if (error) throw new Error(`Matching failed: ${error.message}`);

  // The RPC returns a single-row table { newly_matched }.
  const row = Array.isArray(data) ? data[0] : data;
  return { newly_matched: row?.newly_matched ?? 0 };
}
