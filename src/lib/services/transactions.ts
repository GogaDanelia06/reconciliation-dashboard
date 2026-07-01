import { supabase } from "@/lib/supabase/client";
import { monthRange } from "@/lib/months";
import type { TransactionStatus, TransactionWithCompany } from "@/lib/types";

const TRANSACTION_SELECT = `
  id, doc_key, entry_date, amount, currency,
  sender_name, sender_inn, sender_account, purpose,
  matched_company_id, match_method, match_confidence, status,
  created_at, updated_at,
  matched_company:companies!bank_transactions_matched_company_id_fkey ( id, name, tax_id )
` as const;

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
  return (data ?? []) as unknown as TransactionWithCompany[];
}

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
