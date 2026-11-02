"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { audit } from "@/lib/audit";
import { normalizePhone, phoneToAuthEmail, str } from "@/lib/utils";
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
    if (profile?.status === "inactive") return { error: "Akun dinonaktifkan. Hubungi pengurus TUNAS." };
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
  const nama = str(fd, "nama");
  const contact = str(fd, "contact");
  const password = str(fd, "password");
  const password2 = str(fd, "password2");
  const code = str(fd, "kode").toUpperCase();
  const rt = str(fd, "rt");
  const consent = str(fd, "consent") === "on";

  if (nama.length < 2) return { error: "Nama minimal 2 huruf." };
  if (!consent) return { error: "Mohon setujui persetujuan data untuk melanjutkan." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };
  if (password !== password2) return { error: "Konfirmasi password tidak sama." };

  let phone: string | null = null;
  let email: string | null = null;
  if (contact.includes("@")) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return { error: "Format email tidak valid." };
    email = contact.toLowerCase();
  } else {
    phone = normalizePhone(contact);
    if (!phone) return { error: "Nomor HP tidak valid. Contoh: 081234567890" };
  }

  const db = createAdminClient();
  const { data: invite } = await db.from("invite_codes").select("*").eq("code", code).maybeSingle();
  if (!invite) return { error: "Kode undangan tidak ditemukan. Tanyakan ke pengurus TUNAS." };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return { error: "Kode undangan sudah kedaluwarsa." };
  if (invite.used_count >= invite.max_uses) return { error: "Kode undangan sudah habis dipakai." };

  if (phone) {
    const { data: exists } = await db.from("users").select("id").eq("no_hp", phone).maybeSingle();
    if (exists) return { error: "Nomor HP sudah terdaftar. Silakan masuk." };
  }

  const authEmail = email ?? phoneToAuthEmail(phone!);
  const { data: created, error: createErr } = await db.auth.admin.createUser({ email: authEmail, password, email_confirm: true, user_metadata: { nama } });
  if (createErr || !created.user) {
    return { error: createErr?.message.includes("already") ? "Email sudah terdaftar. Silakan masuk." : "Pendaftaran gagal, coba lagi." };
  }
  const uid = created.user.id;
  const consentCfg = await getSetting("public.consent");
  const { error: e1 } = await db.from("users").insert({ id: uid, nama, no_hp: phone, email, role: "parent" });
  const { error: e2 } = e1
    ? { error: e1 }
    : await db.from("families").insert({ parent_id: uid, rt: rt || null, invite_code_id: invite.id, consent_at: new Date().toISOString(), consent_version: consentCfg.version });
  if (e1 || e2) {
    await db.auth.admin.deleteUser(uid);
    return { error: "Pendaftaran gagal disimpan, coba lagi." };
  }
  // Penambahan bersyarat agar kuota tidak terlampaui saat daftar bersamaan.
  await db.from("invite_codes").update({ used_count: invite.used_count + 1 }).eq("id", invite.id).eq("used_count", invite.used_count);

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email: authEmail, password });
  redirect("/app/anak?baru=1");
}

export async function requestReset(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  if (!email.includes("@")) {
    return { error: "Reset lewat email hanya untuk akun yang mendaftar dengan email. Jika memakai nomor HP, minta pengurus TUNAS mereset password Anda." };
  }
  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${site}/auth/callback?next=/reset-password` });
  return { ok: true, message: "Jika email terdaftar, tautan reset password sudah dikirim. Periksa kotak masuk Anda." };
}

export async function updatePassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const password = str(fd, "password");
  if (password.length < 8) return { error: "Password minimal 8 karakter." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Gagal mengubah password. Tautan mungkin sudah kedaluwarsa." };
  redirect("/app");
}
