// Domain types mirroring the Postgres schema (see supabase/migrations).
// Kept hand-written and small; if the schema grew we'd generate these with
// `supabase gen types typescript`.

export type ContractStatus = "active" | "paused" | "ended";
export type TransactionStatus = "matched" | "unmatched" | "ignored";
export type MatchMethod = "inn_exact" | "manual" | null;

export interface Company {
  id: string;
  name: string;
  tax_id: string;
  created_at: string;
}

export interface Contract {
  id: string;
  company_id: string;
  monthly_amount: number;
  status: ContractStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface BankTransaction {
  id: string;
  doc_key: string;
  entry_date: string;
  amount: number;
  currency: string;
  sender_name: string | null;
  sender_inn: string | null;
  sender_account: string | null;
  purpose: string | null;
  matched_company_id: string | null;
  match_method: MatchMethod;
  match_confidence: number | null;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

// A transaction joined with its matched company (for the table display).
export interface TransactionWithCompany extends BankTransaction {
  matched_company: Pick<Company, "id" | "name" | "tax_id"> | null;
}

// Return shape of the get_expected_vs_actual(p_month) RPC.
export interface ExpectedVsActualRow {
  company_id: string;
  company_name: string;
  tax_id: string;
  expected: number;
  actual: number;
  difference: number;
}

// Return shape of the run_matching() RPC.
export interface MatchingResult {
  newly_matched: number;
}

// Return shape of the reset_matching() RPC.
export interface ResetResult {
  reset_count: number;
}
