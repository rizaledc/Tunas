"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { audit } from "@/lib/audit";
import { tempPassword } from "@/lib/crypto";
import { readXlsx } from "@/lib/excel";
import { SURVEY_TEMPLATES } from "@/lib/survey";
import { DEFAULT_SETTINGS, type ScreenRef } from "@/lib/settings";
import { bool, int, normalizePhone, phoneToAuthEmail, randomCode, slugify, str } from "@/lib/utils";
import type { ActionState } from "@/components/ui";

const db = () => createAdminClient();

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
  return { ok: true, message: `Password sementara untuk ${target.nama}: ${pw} — sampaikan langsung dan minta segera diganti.` };
}

async function createParentAccount(input: { nama: string; phone: string | null; email: string | null; rt: string | null; password: string }) {
  const authEmail = input.email ?? phoneToAuthEmail(input.phone!);
  const { data, error } = await db().auth.admin.createUser({ email: authEmail, password: input.password, email_confirm: true, user_metadata: { nama: input.nama } });
  if (error || !data.user) throw new Error(error?.message ?? "gagal");
  const uid = data.user.id;
  const { error: e1 } = await db().from("users").insert({ id: uid, nama: input.nama, no_hp: input.phone, email: input.email, role: "parent" });
  // consent_version kosong → orang tua diminta menyetujui saat pertama masuk.
  const { error: e2 } = e1 ? { error: e1 } : await db().from("families").insert({ parent_id: uid, rt: input.rt });
  if (e1 || e2) {
    await db().auth.admin.deleteUser(uid);
    throw new Error("gagal menyimpan profil");
  }
  return uid;
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
    const phone = r.no_hp ? normalizePhone(r.no_hp) : null;
    const email = r.email?.includes("@") ? r.email.toLowerCase() : null;
    if (!nama || (!phone && !email)) {
      results.push({ baris: i + 2, nama, login: "", status: "Lewati: nama & no_hp/email wajib" });
      continue;
    }
    const pw = tempPassword();
    try {
      await createParentAccount({ nama, phone, email, rt: r.rt || null, password: pw });
      results.push({ baris: i + 2, nama, login: phone ? `0${phone.slice(2)}` : email!, password: pw, status: "Dibuat" });
    } catch (e) {
      results.push({ baris: i + 2, nama, login: phone ?? email ?? "", status: `Gagal: ${(e as Error).message.includes("already") ? "sudah terdaftar" : (e as Error).message}` });
    }
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
    .map((i) => ({ label: str(fd, `label_${i}`), before: str(fd, `before_${i}`), after: str(fd, `after_${i}`) }))
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
  await db()
    .from("gallery_photos")
    .update({ caption: str(fd, "caption") || null, category: str(fd, "category"), publish_consent: str(fd, "publish_consent") === "on", event_id: str(fd, "event_id") || null })
    .eq("id", id);
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
  const { error } = await db().from("surveys").insert({ name: `${tpl.name} — ${period === "pre" ? "Pre-test" : "Post-test"}`, kind, period, questions: tpl.questions, is_open: false });
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
  const maxPerDay = int(fd, "max_per_day", 3);
  const maxTokens = int(fd, "max_tokens", 800);
  if (!model || prompt.length < 50) return { error: "Model dan prompt sistem wajib diisi." };
  if (maxPerDay < 1 || maxPerDay > 10 || maxTokens < 200 || maxTokens > 2000) return { error: "Batas tidak wajar." };
  await Promise.all([
    setSetting("ai.model", model),
    setSetting("ai.system_prompt", prompt),
    setSetting("ai.max_per_day", maxPerDay),
    setSetting("ai.max_tokens", maxTokens),
    setSetting("ai.enabled", str(fd, "enabled") === "on"),
  ]);
  await audit(me.id, "settings.ai", model, { maxPerDay, maxTokens });
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
  const email = str(fd, "email").toLowerCase();
  const role = str(fd, "role") === "superadmin" ? "superadmin" : "admin";
  if (!nama || !email.includes("@")) return { error: "Nama dan email wajib." };
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
