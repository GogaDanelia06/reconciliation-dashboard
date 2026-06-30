import { supabase } from "@/lib/supabase/client";
import type { ExpectedVsActualRow } from "@/lib/types";

// Expected (active contracts that month) vs actual (matched payments that
// month), computed in the database by get_expected_vs_actual(p_month).
export async function fetchExpectedVsActual(
  monthKey: string,
): Promise<ExpectedVsActualRow[]> {
  const { data, error } = await supabase.rpc("get_expected_vs_actual", {
    p_month: monthKey,
  });

  if (error) {
    throw new Error(`Failed to load expected vs actual: ${error.message}`);
  }

  // numeric columns arrive as strings from PostgREST; coerce to number.
  return (data ?? []).map((row: ExpectedVsActualRow) => ({
    ...row,
    expected: Number(row.expected),
    actual: Number(row.actual),
    difference: Number(row.difference),
  }));
}
