// Centralised TanStack Query key factory. Keeping keys in one place keeps
// invalidation honest: the matching mutation invalidates exactly the keys
// declared here, and there's no string drift between fetch and invalidate.

export const queryKeys = {
  companies: ["companies"] as const,

  transactions: {
    all: ["transactions"] as const,
    byMonth: (monthKey: string) => ["transactions", monthKey] as const,
  },

  expectedVsActual: {
    all: ["expected-vs-actual"] as const,
    byMonth: (monthKey: string) => ["expected-vs-actual", monthKey] as const,
  },
} as const;
