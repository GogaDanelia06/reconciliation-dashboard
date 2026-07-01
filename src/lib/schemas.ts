import { z } from "zod";
export const transactionStatusSchema = z.enum(["matched", "unmatched", "ignored"]);

export const statusFilterSchema = z.enum(["all", "matched", "unmatched", "ignored"]);

export const sortFieldSchema = z.enum(["entry_date", "amount"]);
export const sortDirectionSchema = z.enum(["asc", "desc"]);

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

export const monthKeySchema = z.string().regex(/^\d{4}-\d{2}-01$/);
