import "server-only";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase/env";

/** true/false = status provider Google di Supabase Auth; null = tidak bisa dicek. */
export async function googleProviderStatus(): Promise<boolean | null> {
  if (!SUPABASE_URL) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const j = await res.json();
    return Boolean(j?.external?.google);
  } catch {
    return null;
  }
}

/** URL callback yang harus didaftarkan di Google Cloud Console. */
export function supabaseOAuthCallback() {
  return `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/callback`;
}
