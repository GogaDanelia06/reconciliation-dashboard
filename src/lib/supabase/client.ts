import { createClient } from "@supabase/supabase-js";

// Single browser-side Supabase client. We only use the anon (public) key —
// it's designed to be shipped to the browser and is gated by Row Level
// Security on the server. All reads/writes for this app go through it.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.local.example to .env.local and fill in " +
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
