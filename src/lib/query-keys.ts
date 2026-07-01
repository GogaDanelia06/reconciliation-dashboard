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
