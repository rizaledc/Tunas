"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { audit } from "@/lib/audit";
import { encryptSecret, tempPassword } from "@/lib/crypto";
import { chatCompletion, extractJson, fetchKeyInfo, fetchModels, maskKey, resolveOpenRouterKey } from "@/lib/openrouter";
import { parseInsight, type InsightOutput } from "@/lib/indicators";
import { readXlsx } from "@/lib/excel";
import { SURVEY_TEMPLATES } from "@/lib/survey";
import { DEFAULT_SETTINGS, getSettings, type ScreenRef } from "@/lib/settings";
import { bool, int, phoneToAuthEmail, randomCode, slugify, str } from "@/lib/utils";
import { emailError, normalizeEmail, normalizePhone, phoneError } from "@/lib/validation";
import { createParent, emailTaken, phoneTaken, validateName, validateRt, loginMethods } from "@/lib/accounts";
import { googleProviderStatus } from "@/lib/auth-providers";
import type { ActionState } from "@/components/ui";

const db = () => createAdminClient();

/** "…/storage/v1/object/public/media/<path>" → "<path>" */
function storagePathFromUrl(url: string): string | null {
  const m = url.match(/\/object\/public\/media\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Membuat slug unik: tambahkan akhiran angka jika sudah dipakai baris lain. */
async function uniqueSlug(table: "events" | "articles", base: string, exceptId?: string) {
  const root = base || "konten";
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? root : `${root}-${i + 1}`;
    let q = db().from(table).select("id").eq("slug", slug);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
  }
  return `${root}-${Date.now()}`;
}

async function setSetting(key: string, value: unknown) {
  await db().from("settings").upsert({ key, value, updated_at: new Date().toISOString() });
}

// =============== Anggota & undangan ===============
export async function createInvites(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const count = Math.min(Math.max(int(fd, "count", 1), 1), 200);
  const maxUses = Math.min(Math.max(int(fd, "max_uses", 1), 1), 500);
  const days = int(fd, "expires_days", 30);
  const expires = days > 0 ? new Date(Date.now() + days * 86400_000).toISOString() : null;
  const rows = Array.from({ length: count }, () => ({ code: randomCode(8), created_by: me.id, max_uses: maxUses, expires_at: expires, note: str(fd, "note") || null }));
  const { error } = await db().from("invite_codes").insert(rows);
  if (error) return { error: "Gagal membuat kode." };
  await audit(me.id, "invite.create", `${count} kode`, { max_uses: maxUses, expires });
  revalidatePath("/admin/anggota");
  return { ok: true, message: `${count} kode undangan dibuat: ${rows.map((r) => r.code).join(", ")}` };
}

export async function deleteInvite(fd: FormData) {
  const me = await requireAdmin();
  const id = str(fd, "id");
  await db().from("invite_codes").delete().eq("id", id);
  await audit(me.id, "invite.delete", id);
  revalidatePath("/admin/anggota");
}

export async function setUserStatus(fd: FormData) {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status") === "inactive" ? "inactive" : "active";
  const { data: target } = await db().from("users").select("role").eq("id", id).maybeSingle();
  if (!target || (target.role !== "parent" && me.role !== "superadmin")) return;
  await db().from("users").update({ status }).eq("id", id);
  if (status === "inactive") await db().auth.admin.signOut(id).catch(() => {});
  await audit(me.id, status === "inactive" ? "user.deactivate" : "user.activate", id);
  revalidatePath("/admin/anggota");
}

export async function resetPassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const { data: target } = await db().from("users").select("role,nama").eq("id", id).maybeSingle();
  if (!target) return { error: "Akun tidak ditemukan." };
  if (target.role !== "parent" && me.role !== "superadmin") return { error: "Tidak diizinkan." };
  const pw = tempPassword();
  const { error } = await db().auth.admin.updateUserById(id, { password: pw });
  if (error) return { error: "Gagal mereset password." };
  await audit(me.id, "user.reset_password", id);
  return { ok: true, message: `Password sementara untuk ${target.nama}: ${pw}. Sampaikan langsung dan minta segera diganti.` };
}

/** Admin membuat satu akun orang tua. Orang tua diminta menyetujui consent saat pertama masuk. */
export async function createMember(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const manual = str(fd, "pw_mode") === "manual";
  const password = manual ? str(fd, "password") : tempPassword();
  if (manual && password !== str(fd, "password2")) return { error: "Konfirmasi password tidak sama." };
  const res = await createParent(
    { nama: str(fd, "nama"), phone: str(fd, "no_hp"), email: str(fd, "email"), rt: str(fd, "rt"), password, inviteId: null, consent: false },
    { requireBoth: false },
  );
  if (res.error || !res.id) return { error: res.error };
  const phone = normalizePhone(str(fd, "no_hp"));
  const login = phone ? `0${phone.slice(2)}` : (normalizeEmail(str(fd, "email")) ?? "");
  await audit(me.id, "member.create", res.id, { login });
  revalidatePath("/admin/anggota");
  return { ok: true, message: `Akun untuk ${str(fd, "nama")} berhasil dibuat.`, data: { nama: str(fd, "nama"), login, password, phone: phone ?? "", manual } };
}

export async function importMembers(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file Excel (.xlsx)." };
  if (file.size > 3_000_000) return { error: "File terlalu besar (maks. 3 MB)." };
  let rows: Array<Record<string, string>>;
  try {
    rows = await readXlsx(await file.arrayBuffer());
  } catch {
    return { error: "File tidak bisa dibaca. Pastikan format .xlsx." };
  }
  const results: Array<{ baris: number; nama: string; login: string; password?: string; status: string }> = [];
  for (const [i, r] of rows.slice(0, 300).entries()) {
    const nama = r.nama ?? r.nama_orang_tua ?? "";
    const pw = tempPassword();
    const res = await createParent({ nama, phone: r.no_hp ?? "", email: r.email ?? "", rt: r.rt ?? "", password: pw, inviteId: null, consent: false }, { requireBoth: false });
    const phone = normalizePhone(r.no_hp ?? "");
    const login = phone ? `0${phone.slice(2)}` : (normalizeEmail(r.email ?? "") ?? r.email ?? "");
    results.push(res.id ? { baris: i + 2, nama, login, password: pw, status: "Dibuat" } : { baris: i + 2, nama, login, status: `Gagal: ${res.error}` });
  }
  await audit(me.id, "member.import", `${results.filter((r) => r.status === "Dibuat").length} akun`);
  revalidatePath("/admin/anggota");
  return { ok: true, message: `Selesai memproses ${results.length} baris.`, data: { results } };
}

// =============== Konten ===============
export async function saveHero(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  await setSetting("public.hero", { title: str(fd, "title"), subtitle: str(fd, "subtitle"), image: str(fd, "image") });
  await audit(me.id, "content.hero");
  revalidatePath("/", "layout");
  return { ok: true, message: "Hero tersimpan." };
}

export async function saveStats(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const stats = [0, 1, 2, 3, 4, 5]
    .map((i) => ({ label: str(fd, `label_${i}`), before: str(fd, `before_${i}`), after: str(fd, `after_${i}`), note: str(fd, `note_${i}`).slice(0, 160) }))
    .filter((s) => s.label && s.after);
  await setSetting("public.stats", stats);
  await audit(me.id, "content.stats");
  revalidatePath("/", "layout");
  return { ok: true, message: "Angka capaian tersimpan." };
}

export async function saveContact(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const wa = normalizePhone(str(fd, "whatsapp")) ?? str(fd, "whatsapp");
  await setSetting("public.contact", { address: str(fd, "address"), whatsapp: wa, email: str(fd, "email") });
  await audit(me.id, "content.contact");
  revalidatePath("/", "layout");
  return { ok: true, message: "Kontak tersimpan." };
}

export async function savePanduan(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  await setSetting("public.panduan", { body: str(fd, "body"), module_url: str(fd, "module_url"), module_name: str(fd, "module_name") || DEFAULT_SETTINGS["public.panduan"].module_name });
  await audit(me.id, "content.panduan");
  revalidatePath("/panduan");
  return { ok: true, message: "Panduan tersimpan." };
}

export async function saveArticle(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (title.length < 3) return { error: "Judul terlalu pendek." };
  const publish = str(fd, "publish") === "on";
  const row = {
    title,
    slug: await uniqueSlug("articles", slugify(str(fd, "slug") || title), id || undefined),
    excerpt: str(fd, "excerpt") || null,
    body: str(fd, "body"),
    cover: str(fd, "cover") || null,
    published_at: publish ? (str(fd, "published_at") ? new Date(str(fd, "published_at")).toISOString() : new Date().toISOString()) : null,
    author_id: me.id,
  };
  const { error } = id ? await db().from("articles").update(row).eq("id", id) : await db().from("articles").insert(row);
  if (error) return { error: error.code === "23505" ? "Slug sudah dipakai artikel lain." : "Gagal menyimpan artikel." };
  await audit(me.id, id ? "article.update" : "article.create", row.slug);
  revalidatePath("/", "layout");
  redirect("/admin/konten?tab=artikel");
}

export async function deleteArticle(fd: FormData) {
  const me = await requireAdmin();
  await db().from("articles").delete().eq("id", str(fd, "id"));
  await audit(me.id, "article.delete", str(fd, "id"));
  revalidatePath("/", "layout");
}

export async function savePhotos(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  let items: Array<{ url: string; path: string }> = [];
  try {
    items = JSON.parse(str(fd, "uploaded") || "[]");
  } catch {
    return { error: "Data unggahan tidak valid." };
  }
  if (!items.length) return { error: "Unggah minimal satu foto." };
  const consent = str(fd, "publish_consent") === "on";
  const rows = items.map((it) => ({
    url: it.url,
    storage_path: it.path,
    caption: str(fd, "caption") || null,
    category: str(fd, "category") || "anak",
    publish_consent: consent,
    event_id: str(fd, "event_id") || null,
  }));
  const { error } = await db().from("gallery_photos").insert(rows);
  if (error) return { error: "Gagal menyimpan foto." };
  await audit(me.id, "gallery.upload", `${rows.length} foto`, { consent });
  revalidatePath("/", "layout");
  return { ok: true, message: `${rows.length} foto tersimpan${consent ? " dan tampil di galeri" : " (belum tampil: izin publikasi belum dicentang)"}.` };
}

export async function updatePhoto(fd: FormData) {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const update: Record<string, unknown> = { caption: str(fd, "caption") || null, category: str(fd, "category"), publish_consent: str(fd, "publish_consent") === "on", event_id: str(fd, "event_id") || null };
  const newUrl = str(fd, "url");
  const { data: old } = await db().from("gallery_photos").select("url,storage_path").eq("id", id).maybeSingle();
  if (newUrl && old && newUrl !== old.url) {
    update.url = newUrl;
    update.storage_path = storagePathFromUrl(newUrl);
    if (old.storage_path) await db().storage.from("media").remove([old.storage_path]);
  }
  await db().from("gallery_photos").update(update).eq("id", id);
  await audit(me.id, "gallery.update", id);
  revalidatePath("/", "layout");
}

export async function deletePhoto(fd: FormData) {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const { data } = await db().from("gallery_photos").select("storage_path").eq("id", id).maybeSingle();
  if (data?.storage_path) await db().storage.from("media").remove([data.storage_path]);
  await db().from("gallery_photos").delete().eq("id", id);
  await audit(me.id, "gallery.delete", id);
  revalidatePath("/", "layout");
}

// =============== Kegiatan ===============
export async function saveEvent(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  const date = str(fd, "date");
  if (title.length < 3 || !date) return { error: "Judul dan tanggal wajib diisi." };
  const row = {
    title,
    slug: await uniqueSlug("events", slugify(str(fd, "slug") || `${title}-${date.slice(0, 10)}`), id || undefined),
    date: new Date(`${date}:00+07:00`).toISOString(),
    location: str(fd, "location") || null,
    description: str(fd, "description") || null,
    cover_photo: str(fd, "cover_photo") || null,
    featured: str(fd, "featured") === "on",
    published: str(fd, "published") === "on",
  };
  const res = id ? await db().from("events").update(row).eq("id", id).select("id").single() : await db().from("events").insert(row).select("id").single();
  if (res.error) return { error: res.error.code === "23505" ? "Slug sudah dipakai." : "Gagal menyimpan kegiatan." };
  await audit(me.id, id ? "event.update" : "event.create", row.slug);
  revalidatePath("/", "layout");
  redirect(`/admin/kegiatan/${res.data.id}`);
}

export async function deleteEvent(fd: FormData) {
  const me = await requireAdmin();
  await db().from("events").delete().eq("id", str(fd, "id"));
  await audit(me.id, "event.delete", str(fd, "id"));
  revalidatePath("/", "layout");
  redirect("/admin/kegiatan");
}

export async function markAttendance(fd: FormData) {
  const me = await requireAdmin();
  const eventId = str(fd, "event_id");
  const userId = str(fd, "user_id");
  const attended = str(fd, "attended") === "1";
  await db().from("event_attendance").upsert({ event_id: eventId, user_id: userId, attended, updated_at: new Date().toISOString() }, { onConflict: "event_id,user_id" });
  await audit(me.id, "event.attendance", eventId, { userId, attended });
  revalidatePath(`/admin/kegiatan/${eventId}`);
}

// =============== Evaluasi ===============
export async function createSurvey(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const kind = str(fd, "kind") as keyof typeof SURVEY_TEMPLATES;
  const tpl = SURVEY_TEMPLATES[kind];
  if (!tpl) return { error: "Template tidak dikenal." };
  const period = str(fd, "period") === "post" ? "post" : "pre";
  const { error } = await db().from("surveys").insert({ name: `${tpl.name} (${period === "pre" ? "Pre-test" : "Post-test"})`, kind, period, questions: tpl.questions, is_open: false });
  if (error) return { error: "Gagal membuat kuesioner." };
  await audit(me.id, "survey.create", `${kind}/${period}`);
  revalidatePath("/admin/evaluasi");
  return { ok: true, message: "Kuesioner dibuat. Buka periodenya agar muncul di aplikasi orang tua." };
}

export async function toggleSurvey(fd: FormData) {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const open = str(fd, "open") === "1";
  await db().from("surveys").update({ is_open: open }).eq("id", id);
  await audit(me.id, open ? "survey.open" : "survey.close", id);
  revalidatePath("/admin/evaluasi");
}

export async function deleteSurvey(fd: FormData) {
  const me = await requireAdmin();
  await db().from("surveys").delete().eq("id", str(fd, "id"));
  await audit(me.id, "survey.delete", str(fd, "id"));
  revalidatePath("/admin/evaluasi");
}

// =============== Pengaturan (superadmin) ===============
export async function saveAiSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const model = str(fd, "model");
  const prompt = str(fd, "system_prompt");
  const coins = int(fd, "coins_per_day", 1);
  const maxTokens = int(fd, "max_tokens", 800);
  if (!model || prompt.length < 50) return { error: "Model dan prompt sistem wajib diisi." };
  if (coins < 1 || coins > 10 || maxTokens < 200 || maxTokens > 2000) return { error: "Batas tidak wajar." };
  await Promise.all([
    setSetting("ai.model", model),
    setSetting("ai.system_prompt", prompt),
    setSetting("ai.coins_per_day", coins),
    setSetting("ai.max_tokens", maxTokens),
    setSetting("ai.enabled", str(fd, "enabled") === "on"),
  ]);
  await audit(me.id, "settings.ai", model, { coins, maxTokens });
  return { ok: true, message: "Pengaturan AI tersimpan." };
}

export async function saveScreenRef(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const rows: ScreenRef[] = [];
  for (let i = 0; i < 8; i++) {
    const note = str(fd, `note_${i}`);
    const max = str(fd, `max_${i}`);
    if (!max) continue;
    rows.push({ min_age: int(fd, `min_${i}`), max_age: int(fd, `maxage_${i}`), max_min: Number(max), note });
  }
  if (!rows.length) return { error: "Isi minimal satu baris acuan." };
  await setSetting("screen_time.reference", rows.sort((a, b) => a.min_age - b.min_age));
  await audit(me.id, "settings.screen_reference");
  return { ok: true, message: "Acuan screen time tersimpan." };
}

export async function saveConsent(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const text = str(fd, "text");
  const version = str(fd, "version");
  if (text.length < 50 || !version) return { error: "Teks dan versi wajib diisi." };
  await setSetting("public.consent", { text, version });
  await audit(me.id, "settings.consent", version);
  revalidatePath("/", "layout");
  return { ok: true, message: `Teks consent versi ${version} tersimpan. Orang tua akan diminta menyetujui ulang jika versinya berubah.` };
}

export async function saveReminder(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  await setSetting("reminder.message", str(fd, "message") || DEFAULT_SETTINGS["reminder.message"]);
  await audit(me.id, "settings.reminder");
  return { ok: true, message: "Pesan pengingat tersimpan." };
}

export async function saveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const id = str(fd, "id");
  const row = { type: str(fd, "type") === "digital" ? "digital" : "positif", name: str(fd, "name"), icon: str(fd, "icon") || "star", sort: int(fd, "sort", 0), active: str(fd, "active") !== "off" };
  if (!row.name) return { error: "Nama kategori wajib." };
  const { error } = id ? await db().from("categories").update(row).eq("id", id) : await db().from("categories").insert(row);
  if (error) return { error: "Gagal menyimpan kategori." };
  await audit(me.id, id ? "category.update" : "category.create", row.name);
  revalidatePath("/admin/pengaturan");
  return { ok: true, message: "Kategori tersimpan." };
}

export async function toggleCategory(fd: FormData) {
  const me = await requireAdmin("superadmin");
  const id = str(fd, "id");
  await db().from("categories").update({ active: str(fd, "active") === "1" }).eq("id", id);
  await audit(me.id, "category.toggle", id);
  revalidatePath("/admin/pengaturan");
}

// =============== Akun admin (superadmin) ===============
export async function createAdminAccount(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const nama = str(fd, "nama");
  const email = normalizeEmail(str(fd, "email"));
  const role = str(fd, "role") === "superadmin" ? "superadmin" : "admin";
  if (nama.length < 2) return { error: "Nama wajib diisi." };
  if (!email) return { error: "Format email tidak valid." };
  const pw = tempPassword();
  const { data, error } = await db().auth.admin.createUser({ email, password: pw, email_confirm: true });
  if (error || !data.user) return { error: error?.message.includes("already") ? "Email sudah terdaftar." : "Gagal membuat akun." };
  const { error: e2 } = await db().from("users").insert({ id: data.user.id, nama, email, role });
  if (e2) {
    await db().auth.admin.deleteUser(data.user.id);
    return { error: "Gagal menyimpan profil admin." };
  }
  await audit(me.id, "admin.create", email, { role });
  revalidatePath("/admin/pengaturan");
  return { ok: true, message: `Akun ${role} dibuat. Email: ${email} · Password sementara: ${pw}` };
}

export async function changeAdminRole(fd: FormData) {
  const me = await requireAdmin("superadmin");
  const id = str(fd, "id");
  if (id === me.id) return;
  const role = str(fd, "role") === "superadmin" ? "superadmin" : "admin";
  await db().from("users").update({ role }).eq("id", id).in("role", ["admin", "superadmin"]);
  await audit(me.id, "admin.role", id, { role });
  revalidatePath("/admin/pengaturan");
}

export async function deleteAdminAccount(fd: FormData) {
  const me = await requireAdmin("superadmin");
  const id = str(fd, "id");
  if (id === me.id) return;
  const { data } = await db().from("users").select("role").eq("id", id).maybeSingle();
  if (!data || data.role === "parent") return;
  await db().auth.admin.deleteUser(id);
  await audit(me.id, "admin.delete", id);
  revalidatePath("/admin/pengaturan");
}

// =============== Impor logbook (superadmin) ===============
type LogbookRow = { no_hp: string; anak: string; tanggal: string; jenis: string; kategori: string; durasi: string; didampingi?: string; catatan?: string };

async function insertLogbookRows(rows: LogbookRow[]) {
  const [{ data: users }, { data: fams }, { data: kids }, { data: cats }] = await Promise.all([
    db().from("users").select("id,no_hp").eq("role", "parent"),
    db().from("families").select("id,parent_id"),
    db().from("children").select("id,family_id,nickname"),
    db().from("categories").select("id,type,name"),
  ]);
  const results: Array<{ baris: number; status: string }> = [];
  const inserts: Record<string, unknown>[] = [];
  rows.forEach((r, i) => {
    const phone = normalizePhone(r.no_hp ?? "");
    const user = users?.find((u) => u.no_hp === phone);
    const fam = fams?.find((f) => f.parent_id === user?.id);
    const kid = kids?.find((k) => k.family_id === fam?.id && k.nickname.toLowerCase() === (r.anak ?? "").trim().toLowerCase());
    const type = (r.jenis ?? "").toLowerCase().startsWith("d") ? "digital" : "positif";
    const cat = cats?.find((c) => c.type === type && c.name.toLowerCase().includes((r.kategori ?? "").toLowerCase().trim())) ?? cats?.find((c) => c.type === type);
    const dur = Number.parseInt(r.durasi, 10);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(r.tanggal) ? r.tanggal : null;
    if (!kid) return results.push({ baris: i + 1, status: "Anak tidak ditemukan (cek no_hp & nama panggilan)" });
    if (!date) return results.push({ baris: i + 1, status: "Tanggal harus YYYY-MM-DD" });
    if (!(dur > 0 && dur <= 1440)) return results.push({ baris: i + 1, status: "Durasi tidak valid" });
    inserts.push({
      child_id: kid.id,
      type,
      category_id: cat?.id ?? null,
      log_date: date,
      duration_min: dur,
      accompanied: type === "digital" ? (r.didampingi ? /^(ya|y|1|true)$/i.test(r.didampingi) : null) : null,
      note: r.catatan || null,
      source: "logbook_import",
    });
    results.push({ baris: i + 1, status: "OK" });
  });
  for (let i = 0; i < inserts.length; i += 500) await db().from("activity_logs").insert(inserts.slice(i, i + 500));
  return { results, inserted: inserts.length };
}

export async function importLogbookFile(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file Excel (.xlsx)." };
  let rows: Array<Record<string, string>>;
  try {
    rows = await readXlsx(await file.arrayBuffer());
  } catch {
    return { error: "File tidak bisa dibaca." };
  }
  const { results, inserted } = await insertLogbookRows(rows.slice(0, 5000) as unknown as LogbookRow[]);
  await audit(me.id, "logbook.import_file", `${inserted} baris`);
  return { ok: true, message: `${inserted} dari ${results.length} baris berhasil diimpor sebagai baseline.`, data: { results: results.filter((r) => r.status !== "OK").map((r) => ({ ...r, baris: r.baris + 1 })) } };
}

export async function importLogbookForm(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const rows: LogbookRow[] = [];
  for (let i = 0; i < 20; i++) {
    const tanggal = str(fd, `tanggal_${i}`);
    if (!tanggal) continue;
    rows.push({ no_hp: str(fd, "no_hp"), anak: str(fd, "anak"), tanggal, jenis: str(fd, `jenis_${i}`), kategori: str(fd, `kategori_${i}`), durasi: str(fd, `durasi_${i}`), didampingi: bool(fd, `didampingi_${i}`) ? "ya" : "", catatan: str(fd, `catatan_${i}`) });
  }
  if (!rows.length) return { error: "Isi minimal satu baris." };
  const { results, inserted } = await insertLogbookRows(rows);
  await audit(me.id, "logbook.import_form", `${inserted} baris`);
  const failed = results.filter((r) => r.status !== "OK");
  return failed.length ? { error: `${inserted} tersimpan. Gagal: ${failed.map((f) => `baris ${f.baris} (${f.status})`).join("; ")}` } : { ok: true, message: `${inserted} baris logbook tersimpan.` };
}

// =============== OpenRouter (superadmin) ===============
export async function saveOpenRouterKey(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const key = str(fd, "api_key").replace(/\s/g, "");
  if (!key) return { error: "Tempelkan API key dari openrouter.ai/keys." };
  if (!key.startsWith("sk-or-") || key.length < 20) return { error: 'Format API key OpenRouter diawali "sk-or-". Periksa kembali.' };
  try {
    // Pastikan kunci benar-benar valid sebelum disimpan.
    await fetchKeyInfo(key);
  } catch (e) {
    return { error: `Kunci tidak bisa dipakai: ${(e as Error).message}` };
  }
  await setSetting("ai.openrouter_key", encryptSecret(key));
  await audit(me.id, "settings.openrouter_key", maskKey(key));
  revalidatePath("/admin/pengaturan");
  revalidatePath("/admin/insight");
  return { ok: true, message: `API key ${maskKey(key)} tersimpan (terenkripsi) dan sudah terverifikasi.` };
}

export async function deleteOpenRouterKey(fd: FormData) {
  void fd;
  const me = await requireAdmin("superadmin");
  await setSetting("ai.openrouter_key", "");
  await audit(me.id, "settings.openrouter_key_deleted");
  revalidatePath("/admin/pengaturan");
  revalidatePath("/admin/insight");
}

export type AiTestResult = {
  steps: Array<{ label: string; ok: boolean; detail: string }>;
  sample?: { output: InsightOutput; model: string; tokensIn: number; tokensOut: number; cost: number; ms: number };
};

export async function testOpenRouter(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin("superadmin");
  const steps: AiTestResult["steps"] = [];
  const cfg = await getSettings(["ai.model", "ai.system_prompt", "ai.max_tokens"]);
  const model = str(fd, "model") || String(cfg["ai.model"]);
  const { key, source } = await resolveOpenRouterKey();
  if (!key) {
    steps.push({ label: "API key", ok: false, detail: source === "broken" ? "Kunci tersimpan tidak bisa dibuka (APP_SECRET berubah?). Simpan ulang API key." : "Belum ada API key. Isi di formulir di atas." });
    return { ok: false, data: { steps } };
  }
  try {
    const info = await fetchKeyInfo(key);
    steps.push({
      label: "API key",
      ok: true,
      detail: `Valid (${source === "panel" ? "dari Panel Admin" : "dari env server"})${info.label ? ` · ${info.label}` : ""} · terpakai $${info.usage.toFixed(4)}${info.limit !== null ? ` dari limit $${info.limit}` : " · tanpa limit (disarankan pasang limit kredit)"}${info.isFreeTier ? " · akun gratis" : ""}`,
    });
    if (info.remaining !== null && info.remaining <= 0) steps.push({ label: "Saldo", ok: false, detail: "Limit/saldo habis, insight akan memakai ringkasan cadangan." });
  } catch (e) {
    steps.push({ label: "API key", ok: false, detail: (e as Error).message });
    return { ok: false, data: { steps } };
  }
  const models = await fetchModels();
  if (models.length) {
    const m = models.find((x) => x.id === model);
    steps.push(
      m
        ? { label: "Model", ok: true, detail: `${m.name} · input $${m.promptPerM.toFixed(2)}/1 jt token · output $${m.completionPerM.toFixed(2)}/1 jt token` }
        : { label: "Model", ok: false, detail: `"${model}" tidak ada di katalog OpenRouter. Pilih dari daftar model.` },
    );
  } else {
    steps.push({ label: "Model", ok: true, detail: "Katalog model tidak bisa diambil; dilewati." });
  }
  const t0 = Date.now();
  try {
    const r = await chatCompletion(key, {
      model,
      system: String(cfg["ai.system_prompt"]),
      user: `Ringkasan angka 7 hari terakhir (JSON):\n${JSON.stringify(SAMPLE_INDICATORS)}`,
      maxTokens: Number(cfg["ai.max_tokens"]),
      json: true,
      timeoutMs: 45_000,
    });
    const output = parseInsight(extractJson(r.content));
    if (!output) throw new Error("Model menjawab, tetapi formatnya bukan 5 bagian insight. Periksa prompt sistem.");
    steps.push({ label: "Uji insight", ok: true, detail: `Berhasil dalam ${((Date.now() - t0) / 1000).toFixed(1)} detik` });
    return { ok: true, data: { steps, sample: { output, model: r.model, tokensIn: r.tokensIn, tokensOut: r.tokensOut, cost: r.cost, ms: Date.now() - t0 } } };
  } catch (e) {
    steps.push({ label: "Uji insight", ok: false, detail: (e as Error).message });
    return { ok: false, data: { steps } };
  }
}

/** Data contoh anonim untuk uji coba (tidak terkait keluarga mana pun). */
const SAMPLE_INDICATORS = {
  periode: { mulai: "contoh", selesai: "contoh" },
  usia_anak: 9,
  jenjang: "SD kelas 4–6",
  hari_tercatat: 6,
  target_screen_min: 90,
  acuan_screen_time: { maks_menit: 120, catatan: "contoh acuan" },
  rata_screen_min_per_hari: 115,
  total_digital_min: 690,
  total_positif_min: 420,
  rasio_digital_positif: "1,6 : 1",
  persen_positif: 38,
  komposisi_tujuan_gawai: [
    { tujuan: "Game", menit: 360, persen: 52 },
    { tujuan: "Hiburan (video)", menit: 240, persen: 35 },
    { tujuan: "Belajar", menit: 90, persen: 13 },
  ],
  persen_didampingi: 25,
  hari_gawai_menjelang_tidur: 3,
  hari_patuh_kesepakatan: 2,
  variasi_aktivitas_positif: 3,
  aktivitas_positif_teratas: [
    { kategori: "Menggambar/Mewarnai", menit: 180 },
    { kategori: "Olahraga/Bermain di luar", menit: 150 },
  ],
  tren: { rata_screen_minggu_lalu: 130, perubahan_screen_persen: -12, positif_minggu_lalu: 300, perubahan_positif_persen: 40 },
  checkin: { jumlah: 5, suasana_hati: { senang: 3, biasa: 2 }, respons_berhenti: { diingatkan: 3, mudah: 2 } },
  tindak_lanjut_sebelumnya: { rencana: "Memberi tanda 5 menit sebelum waktu gawai habis", hasil: "sebagian" },
};

export async function resetSystemPrompt(fd: FormData) {
  void fd;
  const me = await requireAdmin("superadmin");
  await setSetting("ai.system_prompt", DEFAULT_SETTINGS["ai.system_prompt"]);
  await audit(me.id, "settings.ai_prompt_reset");
  revalidatePath("/admin/pengaturan");
}

export async function saveShare(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  await setSetting("public.share", { image: str(fd, "image"), description: str(fd, "description").slice(0, 200) });
  await audit(me.id, "content.share");
  revalidatePath("/", "layout");
  return { ok: true, message: "Tampilan saat dibagikan tersimpan. WhatsApp bisa menyimpan pratinjau lama hingga beberapa jam." };
}

export async function saveAuthSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("superadmin");
  const google = str(fd, "google") === "on";
  if (google) {
    const status = await googleProviderStatus();
    if (status === false) return { error: "Provider Google belum aktif di Supabase. Ikuti langkah 1–3 di atas dulu, lalu coba lagi." };
  }
  await setSetting("public.auth", { google });
  await audit(me.id, "settings.auth", google ? "google_on" : "google_off");
  revalidatePath("/", "layout");
  return { ok: true, message: google ? "Tombol Google ditampilkan di halaman Masuk dan Daftar." : "Tombol Google disembunyikan." };
}

// =============== Konten lain (semua bisa diubah admin) ===============
export async function saveBrand(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  await setSetting("public.brand", { logo: str(fd, "logo"), tagline: str(fd, "tagline").slice(0, 60) || DEFAULT_SETTINGS["public.brand"].tagline });
  await audit(me.id, "content.brand");
  revalidatePath("/", "layout");
  return { ok: true, message: "Identitas situs tersimpan." };
}

export async function saveLanding(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const d = DEFAULT_SETTINGS["public.landing"];
  const t = (k: string, max = 300) => str(fd, k).slice(0, max);
  const list = <T,>(n: number, f: (i: number) => T) => Array.from({ length: n }, (_, i) => f(i));
  const value = {
    badge: t("badge", 80),
    cta_primary: t("cta_primary", 40) || d.cta_primary,
    cta_secondary: t("cta_secondary", 40) || d.cta_secondary,
    stats_label: t("stats_label", 60),
    stats_eyebrow: t("stats_eyebrow", 40),
    stats_title: t("stats_title", 80),
    stats_text: t("stats_text", 240),
    events_title: t("events_title", 80),
    agenda_title: t("agenda_title", 80),
    features_title: t("features_title", 80),
    features_text: t("features_text"),
    features: list(6, (i) => ({ icon: t(`f_icon_${i}`, 30) || "star", title: t(`f_title_${i}`, 60), text: t(`f_text_${i}`, 200) })),
    steps_title: t("steps_title", 80),
    steps: list(3, (i) => ({ title: t(`s_title_${i}`, 80), text: t(`s_text_${i}`, 200) })),
    steps_image: t("steps_image", 500),
    roadmap_title: t("roadmap_title", 80),
    roadmap: list(6, (i) => ({ label: t(`r_label_${i}`, 30), title: t(`r_title_${i}`, 80), text: t(`r_text_${i}`, 200) })),
    gallery_title: t("gallery_title", 80),
    articles_title: t("articles_title", 80),
    cta_title: t("cta_title", 100),
    cta_text: t("cta_text"),
    cta_button: t("cta_button", 40) || d.cta_button,
    footer_text: t("footer_text"),
    show: Object.fromEntries(Object.keys(d.show).map((k) => [k, str(fd, `show_${k}`) === "on"])),
  };
  await setSetting("public.landing", value);
  await audit(me.id, "content.landing");
  revalidatePath("/", "layout");
  return { ok: true, message: "Isi beranda tersimpan." };
}

export async function saveTentang(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  await setSetting("public.tentang", { title: str(fd, "title") || "Tentang", intro: str(fd, "intro"), body: str(fd, "body"), image: str(fd, "image"), show_logo: str(fd, "show_logo") === "on" });
  await audit(me.id, "content.tentang");
  revalidatePath("/tentang");
  return { ok: true, message: "Halaman Tentang tersimpan." };
}

export async function savePrivasi(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  await setSetting("public.privasi", { body: str(fd, "body") });
  await audit(me.id, "content.privasi");
  revalidatePath("/privasi");
  return { ok: true, message: "Halaman Privasi tersimpan." };
}

export async function resetContent(key: string, fd?: FormData) {
  void fd;
  const me = await requireAdmin();
  const allowed = ["public.landing", "public.tentang", "public.privasi", "public.brand", "public.hero", "public.stats", "public.panduan", "public.share"];
  if (!allowed.includes(key)) return;
  await db().from("settings").delete().eq("key", key);
  await audit(me.id, "content.reset", key);
  revalidatePath("/", "layout");
}

export async function updateMember(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const { data: target } = await db().from("users").select("role,email,no_hp").eq("id", id).maybeSingle();
  if (!target || target.role !== "parent") return { error: "Akun tidak ditemukan." };
  const nama = str(fd, "nama");
  const nameErr = validateName(nama);
  if (nameErr) return { error: nameErr };
  const phoneRaw = str(fd, "no_hp");
  const emailRaw = str(fd, "email");
  let phone: string | null = null;
  let email: string | null = null;
  if (phoneRaw) {
    const e = phoneError(phoneRaw);
    if (e) return { error: e };
    phone = normalizePhone(phoneRaw);
    if (await phoneTaken(phone!, id)) return { error: "Nomor HP sudah dipakai akun lain." };
  }
  if (emailRaw) {
    const e = emailError(emailRaw);
    if (e) return { error: e };
    email = normalizeEmail(emailRaw);
    if (await emailTaken(email!, id)) return { error: "Email sudah dipakai akun lain." };
  }
  if (!phone && !email) return { error: "Isi nomor HP atau email." };
  const rt = str(fd, "rt");
  const rtErr = validateRt(rt);
  if (rtErr) return { error: rtErr };

  const { data: au } = await db().auth.admin.getUserById(id);
  const { isGoogle } = loginMethods(au.user);
  if (!isGoogle && email !== target.email) {
    const authEmail = email ?? phoneToAuthEmail(phone!);
    const { error } = await db().auth.admin.updateUserById(id, { email: authEmail, email_confirm: true });
    if (error) return { error: "Email login gagal diubah." };
  }
  await db().from("users").update({ nama: nama.trim(), no_hp: phone, email: isGoogle ? target.email : email }).eq("id", id);
  await db().from("families").update({ rt: rt || null }).eq("parent_id", id);
  await audit(me.id, "member.update", id);
  revalidatePath("/admin/anggota");
  return { ok: true, message: "Data anggota tersimpan." };
}
