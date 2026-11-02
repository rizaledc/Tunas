import "server-only";
import { createAdminClient } from "./supabase/admin";
import { getSetting } from "./settings";
import { phoneToAuthEmail } from "./utils";
import { emailError, normalizeEmail, normalizePhone, phoneError, validatePassword } from "./validation";

export type Invite = { id: string; code: string; max_uses: number; used_count: number; expires_at: string | null };

/** Periksa kode undangan; kembalikan pesan error atau data undangan. */
export async function checkInvite(code: string): Promise<{ invite?: Invite; error?: string }> {
  const c = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6,12}$/.test(c)) return { error: "Kode undangan terdiri dari 6–12 huruf/angka." };
  const { data: invite } = await createAdminClient().from("invite_codes").select("id,code,max_uses,used_count,expires_at").eq("code", c).maybeSingle();
  if (!invite) return { error: "Kode undangan tidak ditemukan. Tanyakan ke pengurus komunitas." };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return { error: "Kode undangan sudah kedaluwarsa." };
  if (invite.used_count >= invite.max_uses) return { error: "Kode undangan sudah habis dipakai." };
  return { invite: invite as Invite };
}

export async function consumeInvite(invite: Invite) {
  // Penambahan bersyarat agar kuota tidak terlampaui saat daftar bersamaan.
  await createAdminClient().from("invite_codes").update({ used_count: invite.used_count + 1 }).eq("id", invite.id).eq("used_count", invite.used_count);
}

export function validateName(nama: string): string | null {
  const n = nama.trim();
  if (n.length < 2) return "Nama minimal 2 huruf.";
  if (n.length > 80) return "Nama terlalu panjang.";
  if (!/^[\p{L}\s.'-]+$/u.test(n)) return "Nama hanya boleh berisi huruf, spasi, titik, atau tanda petik.";
  return null;
}

export function validateRt(rt: string): string | null {
  if (!rt) return null;
  return /^\d{1,3}$/.test(rt) ? null : "RT hanya angka (maks. 3 digit).";
}

export async function phoneTaken(phone: string, exceptId?: string) {
  let q = createAdminClient().from("users").select("id").eq("no_hp", phone);
  if (exceptId) q = q.neq("id", exceptId);
  return Boolean((await q.maybeSingle()).data);
}

export async function emailTaken(email: string, exceptId?: string) {
  let q = createAdminClient().from("users").select("id").eq("email", email);
  if (exceptId) q = q.neq("id", exceptId);
  return Boolean((await q.maybeSingle()).data);
}

/** Simpan profil users + families untuk akun auth yang sudah ada. */
export async function createParentProfile(uid: string, p: { nama: string; phone: string | null; email: string | null; rt: string | null; inviteId: string | null; consent: boolean }) {
  const db = createAdminClient();
  const consentCfg = await getSetting("public.consent");
  const { error: e1 } = await db.from("users").insert({ id: uid, nama: p.nama.trim(), no_hp: p.phone, email: p.email, role: "parent" });
  if (e1) return e1.message;
  const { error: e2 } = await db.from("families").insert({
    parent_id: uid,
    rt: p.rt || null,
    invite_code_id: p.inviteId,
    consent_at: p.consent ? new Date().toISOString() : null,
    consent_version: p.consent ? consentCfg.version : null,
  });
  if (e2) {
    await db.from("users").delete().eq("id", uid);
    return e2.message;
  }
  return null;
}

export type NewParent = { nama: string; phone: string; email: string; rt: string; password: string; inviteId: string | null; consent: boolean };

/**
 * Validasi + buat akun orang tua (Supabase Auth + profil). Minimal salah satu dari
 * nomor HP/email wajib; `requireBoth` untuk pendaftaran mandiri tanpa Google.
 */
export async function createParent(input: NewParent, opts: { requireBoth: boolean }): Promise<{ id?: string; authEmail?: string; error?: string }> {
  const nameErr = validateName(input.nama);
  if (nameErr) return { error: nameErr };
  let phone: string | null = null;
  let email: string | null = null;
  if (input.phone || opts.requireBoth) {
    const e = phoneError(input.phone);
    if (e) return { error: e };
    phone = normalizePhone(input.phone);
  }
  if (input.email || opts.requireBoth) {
    const e = emailError(input.email);
    if (e) return { error: e };
    email = normalizeEmail(input.email);
  }
  if (!phone && !email) return { error: "Isi nomor HP atau email." };
  const rtErr = validateRt(input.rt);
  if (rtErr) return { error: rtErr };
  const pwErr = validatePassword(input.password, { name: input.nama, phone: input.phone, email: input.email });
  if (pwErr) return { error: pwErr };
  if (phone && (await phoneTaken(phone))) return { error: "Nomor HP sudah terdaftar." };
  if (email && (await emailTaken(email))) return { error: "Email sudah terdaftar." };

  const db = createAdminClient();
  const authEmail = email ?? phoneToAuthEmail(phone!);
  const { data, error } = await db.auth.admin.createUser({ email: authEmail, password: input.password, email_confirm: true, user_metadata: { nama: input.nama } });
  if (error || !data.user) return { error: error?.message.toLowerCase().includes("already") ? "Email sudah terdaftar." : "Akun gagal dibuat, coba lagi." };
  const profileErr = await createParentProfile(data.user.id, { nama: input.nama, phone, email, rt: input.rt || null, inviteId: input.inviteId, consent: input.consent });
  if (profileErr) {
    await db.auth.admin.deleteUser(data.user.id);
    return { error: "Profil gagal disimpan, coba lagi." };
  }
  return { id: data.user.id, authEmail };
}

/** Metode masuk akun (dari app_metadata.providers, selalu terisi, termasuk akun buatan admin). */
export function loginMethods(user: { app_metadata?: { provider?: string; providers?: string[] } } | null | undefined) {
  const providers = user?.app_metadata?.providers ?? (user?.app_metadata?.provider ? [user.app_metadata.provider] : []);
  return { isGoogle: providers.includes("google"), hasPassword: providers.includes("email") };
}
