# Payment Reconciliation Dashboard

A reconciliation tool for a company that manages service contracts. Bank
transactions arrive from the Bank of Georgia API and need to be matched against
existing contracts — *who paid, who didn't, and how the actual money compares to
what each contract expects.*

**Live demo:** https://reconciliation-dashboard-roan.vercel.app

![Dashboard](docs/screenshot.png)

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** (strict, no `any`)
- **Supabase** (Postgres) — data + business logic in SQL functions
- **TanStack Query v5** — data fetching, caching, mutations, optimistic updates
- **Zod** — validation of filter/search/sort inputs
- **Tailwind CSS** — styling

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project & run the SQL

In the [Supabase](https://supabase.com) dashboard, open the **SQL Editor** and
run the three migration files **in order**:

1. `supabase/migrations/01_schema.sql` — tables, indexes, trigger, 15 companies, 18 contracts
2. `supabase/migrations/02_seed_transactions.sql` — 89 bank transactions (April–June 2026)
3. `supabase/migrations/03_functions.sql` — the `run_matching()` and `get_expected_vs_actual()` functions

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in from **Supabase → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000> and click **Run auto-matching**.

## Where the matching logic lives — and why

**Matching runs in the database, as a Postgres function (`run_matching()`).**

The rule is: a transaction matches a company when `sender_inn = company.tax_id`.
Matching is by **identification code only** — `sender_name` is deliberately
ignored, because the same company appears under several name variations
(`შპს გეოტრანსი`, `გეოტრანსი (ფილიალი)`, `გეოტრანსი`) all sharing one tax ID.

I chose the database over client-side matching for three reasons:

1. **It's a set operation.** Matching all 89 rows is a single `UPDATE … FROM
   companies WHERE sender_inn = tax_id`. Doing it client-side would mean
   fetching every row, looping in JS, and firing dozens of `UPDATE`s back —
   more round-trips, more room for partial failure.
2. **Atomicity.** The whole match succeeds or fails as one statement.
3. **Idempotency.** It only touches rows still `unmatched`, so re-running never
   clobbers a manual match or an ignored transaction.

The Next.js side stays thin: a typed service (`lib/services/matching.ts`) calls
`supabase.rpc("run_matching")`, and a TanStack mutation
(`hooks/use-run-matching.ts`) invalidates the affected queries on success.

The same reasoning applies to **expected-vs-actual**: deciding whether a
contract was "active in a given month" is date math over the `contracts` table,
so it lives in `get_expected_vs_actual(p_month)` rather than being reimplemented
in the client.

### "Active in month" convention

A contract counts toward a month's *expected* total when its lifetime overlaps
the month:

```
start_date <= last day of month
AND (end_date IS NULL OR end_date > first day of month)
```

`end_date` is treated as **exclusive** (the termination/pause date; the contract
was active up to the day before). This matches the seed narrative:

- **სეიფ ტრანსპორტი** (paused 2026-05-15): expected in April **and** May, not June.
- **ურბან მუვერსი** (ended 2026-04-30): expected in April, not May/June.
- **რუსთავი ტრანსი** 2nd contract (paused 2026-04-01): **not** expected in April
  (its April transfer is labelled "March remaining debt").

No proration — if a contract was active for any part of the month, the full
`monthly_amount` is expected.

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # wraps the app in the Query provider
│   ├── providers.tsx       # QueryClient (one per session) + devtools
│   └── page.tsx            # renders <Dashboard/>
├── components/             # presentational + container components
│   ├── dashboard.tsx       # app shell: sidebar + sticky bar, queries, layout
│   ├── sidebar.tsx         # brand, period nav, section nav (scroll-spy)
│   ├── stats-bar.tsx
│   ├── transactions-table.tsx
│   ├── transaction-row-actions.tsx
│   ├── expected-vs-actual.tsx
│   ├── status-badge.tsx
│   └── theme-toggle.tsx
├── hooks/                  # TanStack Query hooks + use-scroll-spy
├── lib/
│   ├── services/           # the ONLY place that talks to Supabase
│   ├── supabase/client.ts
│   ├── types.ts            # domain types mirroring the schema
│   ├── schemas.ts          # Zod schemas for UI inputs
│   ├── query-keys.ts       # query-key factory (honest invalidation)
│   ├── stats.ts            # pure stats derivation
│   ├── months.ts
│   └── format.ts
└── supabase/migrations/    # schema + seed + functions
```

**Layering:** components → hooks (TanStack Query) → services (typed Supabase
calls) → database (RPCs). Components never call Supabase directly.

**Data flow per month:** the month's transactions are fetched once and held in
the query cache. Stats are derived from the full set (a pure function), while
sort / status-filter / search are applied client-side over the same data — so
the stats always reflect the whole month regardless of the active table filter.
The dataset is small (≤ ~50 rows/month), so this is both simpler and snappier
than re-querying.

## Features

- **Auto-matching** by tax ID (DB function), with a one-click trigger — and a **Reset** that reverts auto matches (manual/ignored decisions are preserved), so reconciliation is fully reversible and replayable
- **Stats bar:** total / matched / unmatched counts + amounts, and match rate
- **Transactions table:** sortable (date, amount), filterable (status), searchable
  (sender / tax ID), colour-coded status, per-row manual match / ignore / reset
- **Month navigation** (Apr / May / Jun) driving every section
- **Expected vs Actual** per company, colour-coded, with totals
- **Optimistic updates** on manual row actions, with rollback on error
- **Loading & error states** with retry
- **Dark / light mode** — system-aware, persisted, no flash (via `next-themes` + Tailwind `darkMode: "class"` over CSS-variable theme tokens)
- **App-shell layout** — sidebar (period + section navigation with scroll-spy) and a sticky action bar; collapses to a drawer on mobile, fully responsive

### Bonus features included

- 🔎 Search by company name / tax ID
- 📤 CSV export of the expected-vs-actual summary
- 🗄️ Matching implemented as a Supabase RPC (not client-side)

## Edge cases in the seed data (and how they're handled)

| Case | Handling |
|------|----------|
| Same company, different sender names | Match on `tax_id`, never name |
| Partial payments (750 on a 1500 contract) | Shown as actual < expected (red) |
| Advance payments (next month paid early) | Counted in the month they're dated |
| Duplicate transfer | Both matched; actual exceeds expected (visible signal) |
| 12 unknown senders | Stay `unmatched` (no matching tax ID) |
| Paused / ended contracts | Excluded from *expected* once their date passes; payments still show as actual |

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
```
