import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export type Role = "parent" | "admin" | "superadmin";
export type Profile = {
  id: string;
  nama: string;
  no_hp: string | null;
  email: string | null;
  role: Role;
  status: "active" | "inactive";
  reminder_enabled: boolean;
  last_active_at: string | null;
};

export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

/** true jika pengguna punya TOTP terverifikasi tetapi sesi belum naik ke AAL2. */
export async function needsMfa(): Promise<boolean> {
  const user = await getAuthUser();
  const hasTotp = user?.factors?.some((f) => f.status === "verified" && f.factor_type === "totp");
  if (!hasTotp) return false;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.aal !== "aal2";
}

export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("id,nama,no_hp,email,role,status,reminder_enabled,last_active_at")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile) ?? null;
});

async function touchActive(p: Profile) {
  const last = p.last_active_at ? new Date(p.last_active_at).getTime() : 0;
  if (Date.now() - last < 60 * 60 * 1000) return;
  try {
    await createAdminClient().from("users").update({ last_active_at: new Date().toISOString() }).eq("id", p.id);
  } catch {
    /* abaikan */
  }
}

export type ParentContext = Profile & { familyId: string; consentVersion: string | null };

export const requireParent = cache(async (): Promise<ParentContext> => {
  const p = await getProfile();
  if (!p) redirect((await getAuthUser()) ? "/daftar/lengkapi" : "/login");
  if (p.status !== "active") redirect("/keluar?alasan=nonaktif");
  if (p.role !== "parent") redirect("/admin");
  const supabase = await createClient();
  const { data: fam } = await supabase.from("families").select("id,consent_version").eq("parent_id", p.id).maybeSingle();
  if (!fam) redirect("/keluar?alasan=keluarga");
  await touchActive(p);
  return { ...p, familyId: fam.id as string, consentVersion: (fam.consent_version as string | null) ?? null };
});

export const requireAdmin = cache(async (level: "admin" | "superadmin" = "admin"): Promise<Profile> => {
  const p = await getProfile();
  if (!p) redirect("/login/admin");
  if (p.status !== "active") redirect("/keluar?alasan=nonaktif");
  if (p.role === "parent") redirect("/app");
  // Verifikasi dua langkah (TOTP) jika superadmin sudah mendaftarkannya.
  if (await needsMfa()) redirect("/login/admin/verifikasi");
  if (level === "superadmin" && p.role !== "superadmin") redirect("/admin?akses=ditolak");
  await touchActive(p);
  return p;
});

export function isSuper(p: Profile) {
  return p.role === "superadmin";
}

export async function clientIp(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export const ACTIVE_CHILD_COOKIE = "sa_child";

export async function getActiveChildId(): Promise<string | undefined> {
  return (await cookies()).get(ACTIVE_CHILD_COOKIE)?.value;
}
