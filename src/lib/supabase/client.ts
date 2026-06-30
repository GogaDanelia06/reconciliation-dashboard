import { createClient } from "@supabase/supabase-js";

// Single browser-side Supabase client. We only use the anon (public) key —
// it's designed to be shipped to the browser. All reads/writes go through it.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Surface a clear error in the browser if the vars are missing — but don't
// throw during the production build / prerender (which runs without a window),
// so a misconfigured env never hard-crashes the build.
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (local) or your Vercel project settings.",
  );
}

// Placeholder fallbacks keep the production build / prerender (which runs
// without env in some setups) from crashing on createClient. They're never
// reached at runtime: the browser has the real inlined vars, and the guard
// above throws first if they're genuinely missing.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);
