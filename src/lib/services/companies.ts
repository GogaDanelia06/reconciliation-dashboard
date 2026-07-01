import { supabase } from "@/lib/supabase/client";
import type { Company } from "@/lib/types";

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load companies: ${error.message}`);
  return data ?? [];
}
