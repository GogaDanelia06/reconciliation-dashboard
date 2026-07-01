-- ================================================
-- Payment Reconciliation — Database Functions (RPCs)
-- Run this THIRD (after 01_schema.sql and 02_seed_transactions.sql)
-- ================================================
-- We put the core business logic in the database for two reasons:
--   1. Matching is a set-based data operation. A single UPDATE ... FROM lets
--      Postgres match all transactions in one atomic statement — no fetching
--      89 rows to the client, looping, and firing 89 UPDATEs back.
--   2. "Active contract in a given month" is date math over the contracts
--      table. SQL expresses it cleanly and the client never has to reimplement it.
-- The Next.js service layer just calls these via supabase.rpc(...).
-- ================================================


-- ==================== 1. AUTO-MATCHING ====================
-- Matches every UNMATCHED transaction whose sender_inn equals a company's
-- tax_id. Matching is by identification code ONLY — sender_name is ignored,
-- because the same company shows up under name variations
-- ("შპს გეოტრანსი", "გეოტრანსი (ფილიალი)", "გეოტრანსი") with one tax_id.
--
-- Scope: p_months is an array of month-start dates (e.g. {'2026-06-01'}). NULL
-- means all months. Only transactions in those months are matched.
--
-- Idempotent: re-running only touches rows still 'unmatched', so it never
-- overrides a 'manual' match or an 'ignored' transaction.
-- Returns the number of rows newly matched in this run.

DROP FUNCTION IF EXISTS run_matching();
CREATE OR REPLACE FUNCTION run_matching(p_months date[] DEFAULT NULL)
RETURNS TABLE (newly_matched integer) AS $$
DECLARE
  affected integer;
BEGIN
  WITH updated AS (
    UPDATE bank_transactions bt
    SET matched_company_id = c.id,
        match_method       = 'inn_exact',
        match_confidence   = 1.00,
        status             = 'matched'
    FROM companies c
    WHERE bt.sender_inn = c.tax_id
      AND bt.status = 'unmatched'
      AND (p_months IS NULL OR date_trunc('month', bt.entry_date)::date = ANY(p_months))
    RETURNING bt.id
  )
  SELECT count(*) INTO affected FROM updated;

  RETURN QUERY SELECT affected;
END;
$$ LANGUAGE plpgsql;


-- ==================== 1a. PREVIEW MATCHING (dry run) ====================
-- Read-only: returns the unmatched transactions that WOULD be matched (with the
-- company they'd map to) for the given months, WITHOUT writing anything. Lets
-- the UI show a review step before the user commits.

CREATE OR REPLACE FUNCTION preview_matching(p_months date[] DEFAULT NULL)
RETURNS TABLE (
  id           uuid,
  entry_date   date,
  amount       numeric,
  sender_name  text,
  sender_inn   text,
  company_id   uuid,
  company_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT bt.id, bt.entry_date, bt.amount, bt.sender_name, bt.sender_inn, c.id, c.name
  FROM bank_transactions bt
  JOIN companies c ON bt.sender_inn = c.tax_id
  WHERE bt.status = 'unmatched'
    AND (p_months IS NULL OR date_trunc('month', bt.entry_date)::date = ANY(p_months))
  ORDER BY bt.entry_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;


-- ==================== 1b. RESET MATCHING ====================
-- Mirror of run_matching(): reverts every AUTO (inn_exact) match back to
-- 'unmatched'. Manual matches and ignored transactions are left untouched, so
-- the user's deliberate decisions survive a reset. Returns rows reverted.

CREATE OR REPLACE FUNCTION reset_matching()
RETURNS TABLE (reset_count integer) AS $$
DECLARE
  affected integer;
BEGIN
  WITH updated AS (
    UPDATE bank_transactions
    SET matched_company_id = NULL,
        match_method       = NULL,
        match_confidence   = NULL,
        status             = 'unmatched'
    WHERE match_method = 'inn_exact'
    RETURNING id
  )
  SELECT count(*) INTO affected FROM updated;

  RETURN QUERY SELECT affected;
END;
$$ LANGUAGE plpgsql;


-- ==================== 2. EXPECTED vs ACTUAL ====================
-- For a given month, returns one row per company that EITHER had a contract
-- active during the month OR received matched payments during the month.
--
-- "Active in month M" = the contract's lifetime overlaps month M:
--     start_date <= last day of M
--     AND (end_date IS NULL OR end_date > first day of M)
-- end_date is treated as EXCLUSIVE — the termination/pause date, i.e. the
-- contract was active up to the day before. This matches the seed narrative:
--   * სეიფ ტრანსპორტი (paused 2026-05-15): expected in April AND May, not June.
--   * ურბან მუვერსი (ended 2026-04-30):   expected in April, not May/June.
--   * რუსთავი ტრანსი 2nd contract (paused 2026-04-01): NOT expected in April
--     (its April transfer is labelled "March remaining debt").
--
-- No proration: if a contract was active for any part of the month, the full
-- monthly_amount is expected. A company that paid with no active contract that
-- month (e.g. ურბან in June) shows expected = 0, actual > 0 — a real signal.

CREATE OR REPLACE FUNCTION get_expected_vs_actual(p_month date)
RETURNS TABLE (
  company_id   uuid,
  company_name text,
  tax_id       text,
  expected     numeric,
  actual       numeric,
  difference   numeric
) AS $$
DECLARE
  m_start date := date_trunc('month', p_month)::date;
  m_end   date := (date_trunc('month', p_month) + interval '1 month - 1 day')::date;
BEGIN
  RETURN QUERY
  WITH expected_cte AS (
    SELECT ct.company_id AS cid, SUM(ct.monthly_amount) AS amt
    FROM contracts ct
    WHERE ct.start_date <= m_end
      AND (ct.end_date IS NULL OR ct.end_date > m_start)
    GROUP BY ct.company_id
  ),
  actual_cte AS (
    SELECT bt.matched_company_id AS cid, SUM(bt.amount) AS amt
    FROM bank_transactions bt
    WHERE bt.status = 'matched'
      AND bt.matched_company_id IS NOT NULL
      AND bt.entry_date BETWEEN m_start AND m_end
    GROUP BY bt.matched_company_id
  )
  SELECT
    co.id,
    co.name,
    co.tax_id,
    COALESCE(e.amt, 0)::numeric AS expected,
    COALESCE(a.amt, 0)::numeric AS actual,
    (COALESCE(a.amt, 0) - COALESCE(e.amt, 0))::numeric AS difference
  FROM companies co
  LEFT JOIN expected_cte e ON e.cid = co.id
  LEFT JOIN actual_cte   a ON a.cid = co.id
  WHERE e.amt IS NOT NULL OR a.amt IS NOT NULL
  ORDER BY co.name;
END;
$$ LANGUAGE plpgsql STABLE;
