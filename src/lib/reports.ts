import "server-only";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createAdminClient } from "./supabase/admin";
import { groupStats, loadBase, filterChildren } from "./stats";
import { addDays, dateRange, formatTanggal } from "./date";
import { MIN_GROUP_FAMILIES } from "./privacy";
import { sha256 } from "./crypto";
import { LEVEL_GROUPS, schoolLevelLabel } from "./utils";
import { label as leleLabel } from "./lele";
import type { Sheet } from "./excel";

export type Report = { title: string; sheets: Sheet[] };

export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const from = `${month}-01`;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from, to: `${month}-${String(last).padStart(2, "0")}` };
}

export async function monthlyReport(month: string): Promise<Report> {
  const { from, to } = monthRange(month);
  const base = await loadBase(from, to);
  const all = filterChildren(base, {});
  const g = groupStats(base, all, { source: "app" });
  const hide = (v: string | number) => (g.suppressed ? `disembunyikan (<${MIN_GROUP_FAMILIES} keluarga)` : v);
  const db = createAdminClient();
  const [{ count: insights }, { count: newFamilies }] = await Promise.all([
    db.from("ai_insights").select("id", { count: "exact", head: true }).gte("created_at", `${from}T00:00:00+07:00`).lte("created_at", `${to}T23:59:59+07:00`),
    db.from("families").select("id", { count: "exact", head: true }).gte("created_at", `${from}T00:00:00+07:00`).lte("created_at", `${to}T23:59:59+07:00`),
  ]);
  const summary = [
    { indikator: "Periode", nilai: `${formatTanggal(from)} – ${formatTanggal(to)}` },
    { indikator: "Keluarga terdaftar", nilai: base.families.length },
    { indikator: "Keluarga baru bulan ini", nilai: newFamilies ?? 0 },
    { indikator: "Anak terdaftar", nilai: base.children.length },
    { indikator: "Jumlah catatan (aplikasi)", nilai: base.logs.filter((l) => l.source === "app").length },
    { indikator: "Hari-anak tercatat", nilai: g.childDays },
    { indikator: "Rata-rata screen time / hari (mnt)", nilai: hide(g.avgScreen) },
    { indikator: "Rata-rata target kesepakatan (mnt)", nilai: hide(g.avgTarget ?? "-") },
    { indikator: "Rata-rata aktivitas positif / hari (mnt)", nilai: hide(g.avgPositive) },
    { indikator: "Kepatuhan kesepakatan (%)", nilai: hide(g.compliancePct) },
    { indikator: "Gawai didampingi (%)", nilai: hide(g.accompaniedPct) },
    { indikator: "Penggunaan malam 21.00–04.00 (%)", nilai: hide(g.nightPct) },
    { indikator: "Insight AI dibuat", nilai: insights ?? 0 },
  ];
  const weeks: Array<Record<string, unknown>> = [];
  for (let w = from; w <= to; w = addDays(w, 7)) {
    const end = addDays(w, 6) > to ? to : addDays(w, 6);
    const days = new Set(dateRange(w, end));
    const ids = new Set(base.logs.filter((l) => days.has(l.log_date)).map((l) => l.child_id));
    const sub = { ...base, logs: base.logs.filter((l) => days.has(l.log_date)) };
    const gw = groupStats(sub, ids, { source: "app" });
    weeks.push({
      minggu: `${formatTanggal(w, { day: "numeric", month: "short" })} – ${formatTanggal(end, { day: "numeric", month: "short" })}`,
      keluarga_mencatat: new Set([...ids].map((id) => base.children.find((c) => c.id === id)?.family_id)).size,
      screen_time_mnt: gw.suppressed ? "disembunyikan" : gw.avgScreen,
      positif_mnt: gw.suppressed ? "disembunyikan" : gw.avgPositive,
      patuh_persen: gw.suppressed ? "disembunyikan" : gw.compliancePct,
    });
  }
  const levels = Object.entries(LEVEL_GROUPS).map(([k, { label: v }]) => {
    const gl = groupStats(base, filterChildren(base, { level: k }), { source: "app" });
    return { jenjang: v, keluarga: gl.families, screen_time_mnt: gl.suppressed ? "disembunyikan" : gl.avgScreen, positif_mnt: gl.suppressed ? "disembunyikan" : gl.avgPositive, patuh_persen: gl.suppressed ? "disembunyikan" : gl.compliancePct };
  });
  const purposes = g.suppressed ? [] : g.purposes.map((p) => ({ tujuan_gawai: p.name, total_menit: p.value }));
  const positives = g.suppressed ? [] : g.positives.map((p) => ({ aktivitas_positif: p.name, total_menit: p.value }));
  return {
    title: `Rekap Bulanan Komunitas ${formatTanggal(from, { month: "long", year: "numeric" })}`,
    sheets: [
      { name: "Ringkasan", rows: summary },
      { name: "Per minggu", rows: weeks },
      { name: "Per jenjang", rows: levels },
      { name: "Tujuan gawai", rows: purposes },
      { name: "Aktivitas positif", rows: positives },
    ],
  };
}

/** Data anonim (superadmin): ID anak diganti kode pseudonim, tanpa nama/RT. */
export async function anonymousReport(from: string, to: string): Promise<Report> {
  const base = await loadBase(from, to);
  const code = (id: string) => `A-${sha256(id).slice(0, 8)}`;
  const childInfo = new Map(base.children.map((c) => [c.id, c]));
  const rows = base.logs.map((l) => {
    const c = childInfo.get(l.child_id);
    return {
      kode_anak: code(l.child_id),
      usia: c ? Number(l.log_date.slice(0, 4)) - c.birth_year : "",
      jenjang: c ? schoolLevelLabel(c.school_level) : "",
      tanggal: l.log_date,
      jenis: l.type,
      kategori: base.cats.find((x) => x.id === l.category_id)?.name ?? "",
      durasi_menit: l.duration_min,
      didampingi: l.accompanied ?? "",
      sesuai_kesepakatan: l.follows_agreement ?? "",
      sumber: l.source,
    };
  });
  const db = createAdminClient();
  const { data: checkins } = await db.from("daily_checkins").select("child_id,date,mood,stop_response,sleep_time,device_before_sleep").gte("date", from).lte("date", to);
  const { data: surveys } = await db.from("survey_responses").select("survey_id,user_id,score,answers,surveys(name,kind,period)");
  const { data: lele } = await db.from("lele_logs").select("child_id,log_date,pakan_pagi,pakan_sore,air,perilaku,cuaca,didampingi,catatan").gte("log_date", from).lte("log_date", to).order("log_date");
  // Ringkasan 24 jam per anak per hari.
  const perDay = new Map<string, { child: string; date: string; digital: number; positif: number; rutin: number }>();
  for (const l of base.logs) {
    const k = `${l.child_id}|${l.log_date}`;
    const d = perDay.get(k) ?? { child: l.child_id, date: l.log_date, digital: 0, positif: 0, rutin: 0 };
    d[l.type as "digital" | "positif" | "rutin"] += l.duration_min;
    perDay.set(k, d);
  }
  const dayRows = [...perDay.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ kode_anak: code(d.child), tanggal: d.date, digital_mnt: d.digital, positif_mnt: d.positif, rutinitas_mnt: d.rutin, total_mnt: d.digital + d.positif + d.rutin, lengkap_24_jam: d.digital + d.positif + d.rutin >= 1440 ? "ya" : "tidak" }));
  const leleRows = (lele ?? []).map((r) => ({
    kode_anak: code(r.child_id),
    tanggal: r.log_date,
    pakan_pagi: leleLabel("pakan", r.pakan_pagi),
    pakan_sore: leleLabel("pakan", r.pakan_sore),
    kekeruhan_air: (r.air as string[]).map((v) => leleLabel("air", v)).join(", "),
    perilaku_ikan: (r.perilaku as string[]).map((v) => leleLabel("perilaku", v)).join(", "),
    cuaca: leleLabel("cuaca", r.cuaca),
    durasi_gawai_jam: Math.round(((perDay.get(`${r.child_id}|${r.log_date}`)?.digital ?? 0) / 60) * 10) / 10,
    paraf_orang_tua: r.didampingi ? "ya" : "tidak",
    catatan: r.catatan ?? "",
  }));
  return {
    title: `Data Anonim SAHABAT ANAK ${from} s.d. ${to}`,
    sheets: [
      { name: "Aktivitas", rows },
      { name: "Ringkasan 24 jam", rows: dayRows },
      { name: "Logbook lele harian", rows: leleRows },
      { name: "Check-in", rows: (checkins ?? []).map(({ child_id, ...r }) => ({ kode_anak: code(child_id), ...r })) },
      {
        name: "Kuesioner",
        rows: (surveys ?? []).map((s) => {
          const sv = s.surveys as unknown as { name: string; kind: string; period: string } | null;
          return { kode_responden: `R-${sha256(s.user_id).slice(0, 8)}`, kuesioner: sv?.name, jenis: sv?.kind, periode: sv?.period, skor: s.score, jawaban: s.answers };
        }),
      },
    ],
  };
}

export async function attendanceReport(): Promise<Report> {
  const db = createAdminClient();
  const [{ data: events }, { data: att }, { data: users }] = await Promise.all([
    db.from("events").select("id,title,date,location").order("date", { ascending: false }),
    db.from("event_attendance").select("event_id,user_id,rsvp,attended"),
    db.from("users").select("id,nama"),
  ]);
  const summary = (events ?? []).map((e) => {
    const a = (att ?? []).filter((x) => x.event_id === e.id);
    return { kegiatan: e.title, tanggal: formatTanggal(e.date), lokasi: e.location, konfirmasi_hadir: a.filter((x) => x.rsvp === "hadir").length, hadir: a.filter((x) => x.attended).length };
  });
  const detail = (att ?? []).map((a) => ({
    kegiatan: events?.find((e) => e.id === a.event_id)?.title,
    nama: users?.find((u) => u.id === a.user_id)?.nama,
    konfirmasi: a.rsvp,
    hadir: a.attended ? "ya" : "tidak",
  }));
  return { title: "Rekap Kehadiran Kegiatan", sheets: [{ name: "Ringkasan", rows: summary }, { name: "Detail", rows: detail }] };
}

export function toPdf(report: Report): Buffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text(report.title.replace(/[^\x20-\x7E–]/g, ""), 40, 40);
  doc.setFontSize(9);
  doc.text(`Dibuat ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} · SAHABAT ANAK`, 40, 56);
  let y = 72;
  for (const s of report.sheets) {
    if (!s.rows.length) continue;
    const cols = Object.keys(s.rows[0]);
    doc.setFontSize(12);
    doc.text(s.name, 40, y + 14);
    autoTable(doc, {
      startY: y + 20,
      head: [cols.map((c) => c.replace(/_/g, " "))],
      body: s.rows.map((r) => cols.map((c) => String(r[c] ?? ""))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [35, 130, 74] },
      margin: { left: 40, right: 40 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16;
  }
  return Buffer.from(doc.output("arraybuffer"));
}
