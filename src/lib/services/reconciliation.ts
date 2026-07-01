import { supabase } from "@/lib/supabase/client";
import type { ExpectedVsActualRow } from "@/lib/types";

export async function fetchExpectedVsActual(
  monthKey: string,
): Promise<ExpectedVsActualRow[]> {
  const { data, error } = await supabase.rpc("get_expected_vs_actual", {
    p_month: monthKey,
  });

  if (error) {
    throw new Error(`Failed to load expected vs actual: ${error.message}`);
  }

  return (data ?? []).map((row: ExpectedVsActualRow) => ({
    ...row,
    expected: Number(row.expected),
    actual: Number(row.actual),
    difference: Number(row.difference),
  }));
}
