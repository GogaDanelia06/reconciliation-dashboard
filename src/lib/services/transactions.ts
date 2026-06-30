import { supabase } from "@/lib/supabase/client";
import { monthRange } from "@/lib/months";
import type { TransactionStatus, TransactionWithCompany } from "@/lib/types";

// Columns + embedded matched company, requested once and reused.
const TRANSACTION_SELECT = `
  id, doc_key, entry_date, amount, currency,
  sender_name, sender_inn, sender_account, purpose,
  matched_company_id, match_method, match_confidence, status,
  created_at, updated_at,
  matched_company:companies!bank_transactions_matched_company_id_fkey ( id, name, tax_id )
` as const;

// All transactions whose entry_date falls in the given month. We fetch the
// whole month once and do sort / status filter / search client-side — the
// dataset is tiny (≤ ~50 rows/month) and that keeps stats accurate regardless
// of the active table filter.
export async function fetchTransactionsByMonth(
  monthKey: string,
): Promise<TransactionWithCompany[]> {
  const { start, end } = monthRange(monthKey);

  const { data, error } = await supabase
    .from("bank_transactions")
    .select(TRANSACTION_SELECT)
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date", { ascending: false });

  if (error) throw new Error(`Failed to load transactions: ${error.message}`);
  // Supabase types the embedded relation loosely; we own the schema, so we
  // assert to our hand-written type.
  return (data ?? []) as unknown as TransactionWithCompany[];
}

// Manually override a single transaction's status / match. Used by the row
// actions (ignore, manual match, reset to unmatched).
export async function updateTransactionMatch(params: {
  id: string;
  status: TransactionStatus;
  matchedCompanyId: string | null;
}): Promise<void> {
  const { id, status, matchedCompanyId } = params;

  const { error } = await supabase
    .from("bank_transactions")
    .update({
      status,
      matched_company_id: matchedCompanyId,
      match_method: matchedCompanyId ? "manual" : null,
      match_confidence: matchedCompanyId ? 1.0 : null,
    })
    .eq("id", id);

  if (error) throw new Error(`Failed to update transaction: ${error.message}`);
}
