import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from "./env";

/**
 * Klien service role — melewati RLS. HANYA dipakai di server setelah
 * peran pengguna diverifikasi (lihat lib/auth.ts), atau untuk data agregat.
 */
export function createAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diatur");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
