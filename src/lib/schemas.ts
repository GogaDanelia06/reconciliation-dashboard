import { z } from "zod";

// Zod schemas validate the dashboard's filter / search / sort controls before
// they drive any query. Parsing here means the rest of the app works with
// narrow, trustworthy types instead of loose strings.

export const transactionStatusSchema = z.enum(["matched", "unmatched", "ignored"]);

// The table's status filter adds an "all" pseudo-value on top of the real
// statuses.
export const statusFilterSchema = z.enum(["all", "matched", "unmatched", "ignored"]);

export const sortFieldSchema = z.enum(["entry_date", "amount"]);
export const sortDirectionSchema = z.enum(["asc", "desc"]);

// One schema for everything the user can tweak in the transactions toolbar.
export const transactionFiltersSchema = z.object({
  status: statusFilterSchema.default("all"),
  search: z.string().trim().max(100).default(""),
  sortField: sortFieldSchema.default("entry_date"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type StatusFilter = z.infer<typeof statusFilterSchema>;
export type SortField = z.infer<typeof sortFieldSchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;

// The dashboard only covers Apr–Jun 2026. A month is identified by the first
// day of the month ("2026-04-01"); the schema validates that shape.
export const monthKeySchema = z.string().regex(/^\d{4}-\d{2}-01$/);
