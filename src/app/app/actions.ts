"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ACTIVE_CHILD_COOKIE, requireParent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPin, verifyPin } from "@/lib/crypto";
import { clearChildMode, getChildModeId, setChildMode } from "@/lib/child-mode";
import { addDays, todayStr, wibToIso } from "@/lib/date";
import { generateInsight } from "@/lib/insight";
import { scoreSurvey, type Question } from "@/lib/survey";
import { bool, int, normalizePhone, str } from "@/lib/utils";
import { getChildren } from "@/lib/parent";
import type { ActionState } from "@/components/ui";

async function assertChild(childId: string) {
  const p = await requireParent();
  const kids = await getChildren(p.familyId);
  const child = kids.find((c) => c.id === childId);
  if (!child) throw new Error("Anak tidak ditemukan");
  return { parent: p, child };
}

// ---------- anak ----------
export async function selectChild(childId: string) {
  await assertChild(childId);
  (await cookies()).set(ACTIVE_CHILD_COOKIE, childId, { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/app", "layout");
}

const childSchema = z.object({
  nickname: z.string().trim().min(1, "Nama panggilan wajib diisi").max(40),
  birth_year: z.coerce.number().int().min(2005).max(new Date().getFullYear()),
  school_level: z.enum(["paud", "tk", "sd_awal", "sd_akhir", "smp", "lainnya"]),
});

export async function saveChild(_: ActionState, fd: FormData): Promise<ActionState> {
  const p = await requireParent();
  const parsed = childSchema.safeParse({ nickname: str(fd, "nickname"), birth_year: str(fd, "birth_year"), school_level: str(fd, "school_level") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const id = str(fd, "id");
  const pin = str(fd, "pin");
  if (pin && !/^\d{4}$/.test(pin)) return { error: "PIN harus 4 angka." };
  const supabase = await createClient();
  const row: Record<string, unknown> = { ...parsed.data, family_id: p.familyId };
  if (pin) row.pin_hash = hashPin(pin);
  if (id) {
    await assertChild(id);
    const { error } = await supabase.from("children").update(row).eq("id", id);
    if (error) return { error: "Gagal menyimpan." };
  } else {
    const { data, error } = await supabase.from("children").insert(row).select("id").single();
    if (error || !data) return { error: "Gagal menambah anak." };
    (await cookies()).set(ACTIVE_CHILD_COOKIE, data.id, { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  }
  revalidatePath("/app", "layout");
  return { ok: true, message: "Profil anak tersimpan." };
}

export async function deleteChild(fd: FormData) {
  const id = str(fd, "id");
  await assertChild(id);
  const supabase = await createClient();
  await supabase.from("children").delete().eq("id", id);
  revalidatePath("/app", "layout");
}

// ---------- kesepakatan ----------
export async function saveAgreement(_: ActionState, fd: FormData): Promise<ActionState> {
  const childId = str(fd, "child_id");
  await assertChild(childId);
  const target = int(fd, "target_screen_min", -1);
  if (target < 0 || target > 1440) return { error: "Target waktu layar tidak valid." };
  const supabase = await createClient();
  const { error } = await supabase.from("agreements").upsert(
    { child_id: childId, target_screen_min: target, no_device_hours: str(fd, "no_device_hours") || null, notes: str(fd, "notes") || null, updated_at: new Date().toISOString() },
    { onConflict: "child_id" },
  );
  if (error) return { error: "Gagal menyimpan kesepakatan." };
  revalidatePath("/app", "layout");
  return { ok: true, message: "Kesepakatan keluarga tersimpan. 🎉" };
}

// ---------- catatan aktivitas ----------
export async function saveLog(_: ActionState, fd: FormData): Promise<ActionState> {
  const childId = str(fd, "child_id");
  await assertChild(childId);
  const type = str(fd, "type") as "digital" | "positif";
  if (type !== "digital" && type !== "positif") return { error: "Jenis aktivitas tidak valid." };
  const date = str(fd, "log_date");
  const today = todayStr();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today || date < addDays(today, -7)) {
    return { error: "Tanggal hanya bisa hari ini sampai 7 hari ke belakang." };
  }
  const categoryId = str(fd, "category_id");
  if (!categoryId) return { error: type === "digital" ? "Pilih tujuan memakai gawai." : "Pilih kategori aktivitas." };

  let duration = int(fd, "duration_min", 0);
  let startAt: string | null = null;
  let endAt: string | null = null;
  const start = str(fd, "start_time");
  const end = str(fd, "end_time");
  if (start && end) {
    startAt = wibToIso(date, start);
    endAt = wibToIso(date, end);
    let diff = Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000);
    if (diff <= 0) {
      // melewati tengah malam
      endAt = wibToIso(addDays(date, 1), end);
      diff = Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000);
    }
    duration = diff;
  } else if (start && duration > 0) {
    startAt = wibToIso(date, start);
    endAt = new Date(new Date(startAt).getTime() + duration * 60000).toISOString();
  }
  if (duration < 1 || duration > 1440) return { error: "Isi durasi atau jam mulai–selesai." };

  const row = {
    child_id: childId,
    type,
    category_id: categoryId,
    log_date: date,
    start_at: startAt,
    end_at: endAt,
    duration_min: duration,
    app_name: type === "digital" ? str(fd, "app_name") || null : null,
    accompanied: type === "digital" ? bool(fd, "accompanied") : null,
    follows_agreement: type === "digital" ? bool(fd, "follows_agreement") : null,
    with_whom: type === "positif" ? str(fd, "with_whom") || null : null,
    note: str(fd, "note").slice(0, 500) || null,
  };
  const supabase = await createClient();
  const id = str(fd, "id");
  const { error } = id ? await supabase.from("activity_logs").update(row).eq("id", id).eq("child_id", childId) : await supabase.from("activity_logs").insert(row);
  if (error) return { error: "Gagal menyimpan catatan." };
  revalidatePath("/app", "layout");
  if (id) redirect("/app/riwayat");
  return { ok: true, message: `Tersimpan: ${duration} menit ${type === "digital" ? "aktivitas digital" : "aktivitas positif"}. 👍` };
}

export async function deleteLog(fd: FormData) {
  const id = str(fd, "id");
  const childId = str(fd, "child_id");
  await assertChild(childId);
  const supabase = await createClient();
  await supabase.from("activity_logs").delete().eq("id", id).eq("child_id", childId);
  revalidatePath("/app", "layout");
}

// ---------- check-in ----------
export async function saveCheckin(_: ActionState, fd: FormData): Promise<ActionState> {
  const childId = str(fd, "child_id");
  await assertChild(childId);
  const date = str(fd, "date") || todayStr();
  if (date > todayStr() || date < addDays(todayStr(), -7)) return { error: "Tanggal tidak valid." };
  const mood = str(fd, "mood") || null;
  const stop = str(fd, "stop_response") || null;
  const sleep = str(fd, "sleep_time") || null;
  const supabase = await createClient();
  const { error } = await supabase.from("daily_checkins").upsert(
    { child_id: childId, date, mood, stop_response: stop, sleep_time: sleep, device_before_sleep: bool(fd, "device_before_sleep") },
    { onConflict: "child_id,date" },
  );
  if (error) return { error: "Gagal menyimpan check-in." };
  revalidatePath("/app", "layout");
  return { ok: true, message: "Check-in hari ini tersimpan. Terima kasih! 🌟" };
}

// ---------- insight ----------
export async function runInsight(_: ActionState, fd: FormData): Promise<ActionState> {
  const childId = str(fd, "child_id");
  await assertChild(childId);
  const res = await generateInsight(childId);
  if (!res.ok) return { error: res.error };
  revalidatePath("/app", "layout");
  return {
    ok: true,
    message: res.cached
      ? "Data belum berubah sejak analisis terakhir, jadi ini hasil yang sama."
      : res.fallback
        ? "Layanan AI sedang tidak tersedia. Ini ringkasan otomatis dari angka catatan."
        : "Insight baru sudah siap. ✨",
  };
}

export async function rateInsight(fd: FormData) {
  const id = str(fd, "id");
  const rating = int(fd, "rating", 0);
  if (rating !== 1 && rating !== -1) return;
  const supabase = await createClient();
  await supabase.from("ai_insights").update({ rating }).eq("id", id);
  revalidatePath("/app/insight");
}

export async function saveReflection(_: ActionState, fd: FormData): Promise<ActionState> {
  const childId = str(fd, "child_id");
  await assertChild(childId);
  const action = str(fd, "action_custom") || str(fd, "action_choice");
  if (action.length < 3) return { error: "Pilih atau tulis satu tindak lanjut." };
  const supabase = await createClient();
  const { error } = await supabase.from("reflections").insert({ child_id: childId, insight_id: str(fd, "insight_id") || null, action_text: action.slice(0, 300) });
  if (error) return { error: "Gagal menyimpan." };
  revalidatePath("/app", "layout");
  return { ok: true, message: "Tindak lanjut tersimpan. Minggu depan kami tanyakan hasilnya, ya." };
}

export async function saveReflectionOutcome(fd: FormData) {
  const id = str(fd, "id");
  const outcome = str(fd, "outcome");
  if (!["berhasil", "sebagian", "belum"].includes(outcome)) return;
  const supabase = await createClient();
  await supabase.from("reflections").update({ outcome, outcome_note: str(fd, "outcome_note") || null }).eq("id", id);
  revalidatePath("/app", "layout");
}

// ---------- kegiatan ----------
export async function rsvp(fd: FormData) {
  const p = await requireParent();
  const eventId = str(fd, "event_id");
  const value = str(fd, "rsvp") === "tidak" ? "tidak" : "hadir";
  const supabase = await createClient();
  await supabase.from("event_attendance").upsert({ event_id: eventId, user_id: p.id, rsvp: value, updated_at: new Date().toISOString() }, { onConflict: "event_id,user_id" });
  revalidatePath("/app/kegiatan");
}

// ---------- kuesioner ----------
export async function submitSurvey(_: ActionState, fd: FormData): Promise<ActionState> {
  const p = await requireParent();
  const surveyId = str(fd, "survey_id");
  const supabase = await createClient();
  const { data: survey } = await supabase.from("surveys").select("id,kind,questions,is_open").eq("id", surveyId).maybeSingle();
  if (!survey || !survey.is_open) return { error: "Kuesioner sudah ditutup." };
  const questions = survey.questions as Question[];
  const answers: Record<string, number> = {};
  for (const q of questions) {
    const v = int(fd, q.id, 0);
    if (v < 1 || v > 5) return { error: "Mohon jawab semua pertanyaan." };
    answers[q.id] = v;
  }
  const score = scoreSurvey(survey.kind, questions, answers);
  const { error } = await supabase.from("survey_responses").insert({ survey_id: surveyId, user_id: p.id, answers, score });
  if (error) return { error: error.code === "23505" ? "Anda sudah mengisi kuesioner ini." : "Gagal mengirim jawaban." };
  revalidatePath("/app", "layout");
  redirect("/app?terimakasih=1");
}

// ---------- profil ----------
export async function updateProfile(_: ActionState, fd: FormData): Promise<ActionState> {
  const p = await requireParent();
  const nama = str(fd, "nama");
  if (nama.length < 2) return { error: "Nama minimal 2 huruf." };
  const hp = str(fd, "no_hp");
  const phone = hp ? normalizePhone(hp) : null;
  if (hp && !phone) return { error: "Nomor HP tidak valid." };
  const db = createAdminClient();
  if (phone && phone !== p.no_hp) {
    const { data: taken } = await db.from("users").select("id").eq("no_hp", phone).neq("id", p.id).maybeSingle();
    if (taken) return { error: "Nomor HP sudah dipakai akun lain." };
  }
  const rt = str(fd, "rt");
  await db.from("users").update({ nama, no_hp: phone ?? p.no_hp }).eq("id", p.id);
  const supabase = await createClient();
  await supabase.from("families").update({ rt: rt || null }).eq("id", p.familyId);
  revalidatePath("/app", "layout");
  return { ok: true, message: "Profil tersimpan." };
}

export async function changePassword(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireParent();
  const pw = str(fd, "password");
  if (pw.length < 8) return { error: "Password minimal 8 karakter." };
  if (pw !== str(fd, "password2")) return { error: "Konfirmasi password tidak sama." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) return { error: "Gagal mengubah password." };
  return { ok: true, message: "Password berhasil diubah." };
}

export async function setReminder(enabled: boolean) {
  const p = await requireParent();
  await createAdminClient().from("users").update({ reminder_enabled: enabled }).eq("id", p.id);
  revalidatePath("/app/profil");
}

export async function savePushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const p = await requireParent();
  if (!sub?.endpoint?.startsWith("https://")) return;
  const supabase = await createClient();
  await supabase.from("push_subscriptions").upsert({ user_id: p.id, endpoint: sub.endpoint, keys: sub.keys }, { onConflict: "endpoint" });
}

export async function deleteAccount(_: ActionState, fd: FormData): Promise<ActionState> {
  const p = await requireParent();
  if (str(fd, "confirm").toUpperCase() !== "HAPUS") return { error: 'Ketik "HAPUS" untuk konfirmasi.' };
  const db = createAdminClient();
  // Menghapus auth user → cascade ke users, families, children, dan semua catatan.
  const { error } = await db.auth.admin.deleteUser(p.id);
  if (error) return { error: "Gagal menghapus akun. Hubungi pengurus." };
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?alasan=dihapus");
}

// ---------- mode anak ----------
export async function enterChildMode(_: ActionState, fd: FormData): Promise<ActionState> {
  const childId = str(fd, "child_id");
  const { child } = await assertChild(childId);
  if (!child.pin_hash) return { error: "PIN anak belum diatur. Atur dulu di menu Anak." };
  if (!verifyPin(str(fd, "pin"), child.pin_hash)) return { error: "PIN salah." };
  await setChildMode(childId);
  redirect("/app/mode-anak");
}

export async function exitChildMode(_: ActionState, fd: FormData): Promise<ActionState> {
  const p = await requireParent();
  const password = str(fd, "password");
  const { data: au } = await createAdminClient().auth.admin.getUserById(p.id);
  const email = au.user?.email;
  if (!email) return { error: "Akun tidak ditemukan." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Password orang tua salah." };
  await clearChildMode();
  redirect("/app");
}

export async function childLog(_: ActionState, fd: FormData): Promise<ActionState> {
  const childId = await getChildModeId();
  if (!childId) redirect("/app");
  await assertChild(childId);
  const categoryId = str(fd, "category_id");
  const duration = int(fd, "duration_min", 0);
  if (!categoryId || ![15, 30, 60].includes(duration)) return { error: "Pilih kegiatan dan lamanya." };
  const supabase = await createClient();
  const { error } = await supabase.from("activity_logs").insert({
    child_id: childId,
    type: "positif",
    category_id: categoryId,
    log_date: todayStr(),
    duration_min: duration,
    input_by: "child",
  });
  if (error) return { error: "Yah, gagal menyimpan. Coba lagi ya." };
  revalidatePath("/app/mode-anak");
  return { ok: true, message: "Hore! Kamu dapat 1 bintang ⭐" };
}

// ---------- persetujuan data ----------
export async function acceptConsent(_: ActionState, fd: FormData): Promise<ActionState> {
  const p = await requireParent();
  if (str(fd, "consent") !== "on") return { error: "Centang persetujuan untuk melanjutkan." };
  const supabase = await createClient();
  const { error } = await supabase.from("families").update({ consent_at: new Date().toISOString(), consent_version: str(fd, "version") }).eq("id", p.familyId);
  if (error) return { error: "Gagal menyimpan persetujuan." };
  redirect("/app");
}
