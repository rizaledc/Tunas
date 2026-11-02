"use server";
import { redirect } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { audit } from "@/lib/audit";
import { phoneToAuthEmail, str } from "@/lib/utils";
import { normalizeEmail, normalizePhone, phoneError, validatePassword } from "@/lib/validation";
import { checkInvite, createParent, createParentProfile, emailTaken, phoneTaken, consumeInvite, validateName, validateRt } from "@/lib/accounts";
import type { ActionState } from "@/components/ui";

const WINDOW_MIN = 15;
const MAX_FAIL = { parent: 5, admin: 5 } as const;

async function tooManyAttempts(identifier: string, scope: "parent" | "admin"): Promise<boolean> {
  const db = createAdminClient();
  const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString();
  const ip = await clientIp();
  const [{ count: byId }, { count: byIp }] = await Promise.all([
    db.from("login_attempts").select("id", { count: "exact", head: true }).eq("identifier", identifier).eq("scope", scope).eq("success", false).gte("created_at", since),
    db.from("login_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).eq("success", false).gte("created_at", since),
  ]);
  return (byId ?? 0) >= MAX_FAIL[scope] || (byIp ?? 0) >= 20;
}

async function recordAttempt(identifier: string, scope: "parent" | "admin", success: boolean) {
  await createAdminClient().from("login_attempts").insert({ identifier, scope, success, ip: await clientIp() });
}

/** Mengubah input nomor HP / email menjadi email login Supabase. */
async function resolveLoginEmail(identifier: string): Promise<{ email: string; key: string } | null> {
  if (identifier.includes("@")) return { email: identifier.toLowerCase(), key: identifier.toLowerCase() };
  const phone = normalizePhone(identifier);
  if (!phone) return null;
  const { data } = await createAdminClient().from("users").select("id").eq("no_hp", phone).maybeSingle();
  if (!data) return { email: phoneToAuthEmail(phone), key: phone };
  const { data: au } = await createAdminClient().auth.admin.getUserById(data.id);
  return { email: au.user?.email ?? phoneToAuthEmail(phone), key: phone };
}

async function doLogin(fd: FormData, scope: "parent" | "admin"): Promise<ActionState> {
  const identifier = str(fd, "identifier");
  const password = str(fd, "password");
  if (!identifier || !password) return { error: "Isi nomor HP/email dan password." };
  const resolved = await resolveLoginEmail(identifier);
  if (!resolved) return { error: "Format nomor HP tidak dikenali. Contoh: 081234567890" };

  if (await tooManyAttempts(resolved.key, scope)) {
    return { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${WINDOW_MIN} menit.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: resolved.email, password });
  if (error || !data.user) {
    await recordAttempt(resolved.key, scope, false);
    return { error: "Nomor HP/email atau password salah." };
  }
  const { data: profile } = await createAdminClient().from("users").select("role,status").eq("id", data.user.id).maybeSingle();
  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  if (!profile || profile.status !== "active" || (scope === "admin") !== isAdmin) {
    await supabase.auth.signOut({ scope: "local" });
    await recordAttempt(resolved.key, scope, false);
    if (profile?.status === "inactive") return { error: "Akun dinonaktifkan. Hubungi pengurus komunitas." };
    return { error: scope === "admin" ? "Akun ini bukan akun admin." : "Akun admin masuk lewat halaman /login/admin." };
  }
  await recordAttempt(resolved.key, scope, true);
  if (scope === "admin") {
    await audit(data.user.id, "admin.login");
    if (data.user.factors?.some((f) => f.status === "verified" && f.factor_type === "totp")) redirect("/login/admin/verifikasi");
    redirect("/admin");
  }
  const next = str(fd, "next");
  redirect(next.startsWith("/app") ? next : "/app");
}

export async function loginParent(_: ActionState, fd: FormData): Promise<ActionState> {
  return doLogin(fd, "parent");
}

export async function loginAdmin(_: ActionState, fd: FormData): Promise<ActionState> {
  return doLogin(fd, "admin");
}

export async function verifyMfa(_: ActionState, fd: FormData): Promise<ActionState> {
  const code = str(fd, "code").replace(/\s/g, "");
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.find((f) => f.status === "verified");
  if (!factor) redirect("/admin");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { error: "Kode salah atau kedaluwarsa." };
  redirect("/admin");
}

export async function register(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, "consent") !== "on") return { error: "Mohon setujui persetujuan data untuk melanjutkan." };
  const password = str(fd, "password");
  if (password !== str(fd, "password2")) return { error: "Konfirmasi password tidak sama." };
  const { invite, error: invErr } = await checkInvite(str(fd, "kode"));
  if (!invite) return { error: invErr };
  const res = await createParent(
    { nama: str(fd, "nama"), phone: str(fd, "no_hp"), email: str(fd, "email"), rt: str(fd, "rt"), password, inviteId: invite.id, consent: true },
    { requireBoth: true },
  );
  if (res.error || !res.authEmail) return { error: res.error };
  await consumeInvite(invite);
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email: res.authEmail, password });
  redirect("/app/anak?baru=1");
}

export async function requestReset(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = normalizeEmail(str(fd, "email"));
  if (!email) return { error: "Format email tidak valid, contoh nama@gmail.com." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${SITE_URL}/auth/callback?next=/reset-password` });
  return { ok: true, message: "Jika email terdaftar, tautan reset password sudah dikirim. Periksa kotak masuk (dan folder spam). Akun yang hanya memakai nomor HP: minta pengurus komunitas mereset password." };
}

export async function updatePassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const password = str(fd, "password");
  if (password !== str(fd, "password2")) return { error: "Konfirmasi password tidak sama." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const pwErr = validatePassword(password, { email: user?.email });
  if (pwErr) return { error: pwErr };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Gagal mengubah password. Tautan mungkin sudah kedaluwarsa." };
  redirect("/app");
}

// ---------- Google ----------
export async function signInWithGoogle(fd: FormData) {
  const auth = await getSetting("public.auth");
  if (!auth.google) redirect("/login?alasan=google_mati");
  const kode = str(fd, "kode").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const next = kode ? `/daftar/lengkapi?kode=${kode}` : "/app";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`, queryParams: { prompt: "select_account" } },
  });
  if (error || !data.url) redirect("/login?alasan=google_gagal");
  redirect(data.url);
}

/** Langkah terakhir pendaftaran lewat Google: kode undangan, nomor HP, RT, persetujuan. */
export async function completeGoogleProfile(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const db = createAdminClient();
  const { data: existing } = await db.from("users").select("id").eq("id", user.id).maybeSingle();
  if (existing) redirect("/app");
  if (str(fd, "consent") !== "on") return { error: "Mohon setujui persetujuan data untuk melanjutkan." };
  const nama = str(fd, "nama");
  const nameErr = validateName(nama);
  if (nameErr) return { error: nameErr };
  const phoneErr = phoneError(str(fd, "no_hp"));
  if (phoneErr) return { error: phoneErr };
  const phone = normalizePhone(str(fd, "no_hp"))!;
  const rtErr = validateRt(str(fd, "rt"));
  if (rtErr) return { error: rtErr };
  if (await phoneTaken(phone)) return { error: "Nomor HP sudah dipakai akun lain. Masuk dengan akun tersebut atau hubungi pengurus." };
  const email = normalizeEmail(user.email ?? "");
  if (email && (await emailTaken(email))) return { error: "Email Google ini sudah terhubung dengan akun lain." };
  const { invite, error: invErr } = await checkInvite(str(fd, "kode"));
  if (!invite) return { error: invErr };
  const err = await createParentProfile(user.id, { nama, phone, email, rt: str(fd, "rt") || null, inviteId: invite.id, consent: true });
  if (err) return { error: "Profil gagal disimpan, coba lagi." };
  await consumeInvite(invite);
  redirect("/app/anak?baru=1");
}

/** Batal mendaftar lewat Google: hapus akun auth yang belum punya profil. */
export async function cancelGoogleSignup() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const db = createAdminClient();
    const { data: existing } = await db.from("users").select("id").eq("id", user.id).maybeSingle();
    await supabase.auth.signOut({ scope: "local" });
    if (!existing) await db.auth.admin.deleteUser(user.id);
  }
  redirect("/login");
}
