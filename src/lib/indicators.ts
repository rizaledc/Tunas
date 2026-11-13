/**
 * Perhitungan indikator: murni (tanpa I/O) supaya mudah diuji.
 * AI hanya membaca hasil fungsi ini, tidak menghitung sendiri.
 */
import { addDays, dateRange, wibHour } from "./date";

export type LogRow = {
  id?: string;
  log_date: string;
  type: ActivityType;
  category_id: string | null;
  duration_min: number;
  accompanied: boolean | null;
  follows_agreement: boolean | null;
  start_at: string | null;
  end_at: string | null;
  input_by?: string;
};

export type CheckinRow = {
  date: string;
  mood: string | null;
  stop_response: string | null;
  sleep_time: string | null;
  device_before_sleep: boolean | null;
};

export type ActivityType = "digital" | "positif" | "rutin";
export type CategoryRow = { id: string; type: ActivityType; name: string; icon: string };

export type Indicators = {
  periode: { mulai: string; selesai: string };
  usia_anak: number;
  jenjang: string;
  hari_tercatat: number;
  target_screen_min: number;
  acuan_screen_time: { maks_menit: number; catatan: string } | null;
  rata_screen_min_per_hari: number;
  total_digital_min: number;
  total_positif_min: number;
  rasio_digital_positif: string;
  persen_positif: number;
  komposisi_tujuan_gawai: Array<{ tujuan: string; menit: number; persen: number }>;
  persen_didampingi: number;
  hari_gawai_menjelang_tidur: number;
  hari_patuh_kesepakatan: number;
  variasi_aktivitas_positif: number;
  aktivitas_positif_teratas: Array<{ kategori: string; menit: number }>;
  tren: {
    rata_screen_minggu_lalu: number;
    perubahan_screen_persen: number | null;
    positif_minggu_lalu: number;
    perubahan_positif_persen: number | null;
  };
  checkin: {
    jumlah: number;
    suasana_hati: Record<string, number>;
    respons_berhenti: Record<string, number>;
  };
  tindak_lanjut_sebelumnya: { rencana: string; hasil: string | null } | null;
};

export function sumBy<T>(rows: T[], f: (r: T) => number): number {
  return rows.reduce((a, r) => a + f(r), 0);
}

export function dailyTotals(logs: LogRow[], dates: string[]) {
  return dates.map((d) => {
    const day = logs.filter((l) => l.log_date === d);
    return {
      date: d,
      digital: sumBy(day.filter((l) => l.type === "digital"), (l) => l.duration_min),
      positif: sumBy(day.filter((l) => l.type === "positif"), (l) => l.duration_min),
      count: day.length,
    };
  });
}

export function balancePercent(digital: number, positif: number): number {
  const t = digital + positif;
  return t > 0 ? Math.round((positif / t) * 100) : 0;
}

export function composition(logs: LogRow[], cats: CategoryRow[], type: "digital" | "positif") {
  const map = new Map<string, number>();
  for (const l of logs.filter((x) => x.type === type)) {
    const name = cats.find((c) => c.id === l.category_id)?.name ?? "Lainnya";
    map.set(name, (map.get(name) ?? 0) + l.duration_min);
  }
  const total = sumBy([...map.values()], (v) => v);
  return [...map.entries()]
    .map(([name, minutes]) => ({ name, minutes, percent: total ? Math.round((minutes / total) * 100) : 0 }))
    .sort((a, b) => b.minutes - a.minutes);
}

function lateNight(l: LogRow): boolean {
  const ts = l.end_at ?? l.start_at;
  if (!ts) return false;
  const h = wibHour(ts);
  return h >= 21 || h < 4;
}

function changePct(now: number, before: number): number | null {
  if (before <= 0) return null;
  return Math.round(((now - before) / before) * 100);
}

export function computeIndicators(input: {
  endDate: string;
  logs: LogRow[]; // minimal 14 hari terakhir
  checkins: CheckinRow[];
  categories: CategoryRow[];
  targetMin: number;
  childAge: number;
  schoolLevel: string;
  reference: { max_min: number; note: string } | null;
  lastReflection: { action_text: string; outcome: string | null } | null;
}): Indicators {
  const start = addDays(input.endDate, -6);
  const prevStart = addDays(input.endDate, -13);
  const prevEnd = addDays(input.endDate, -7);
  const days = dateRange(start, input.endDate);

  const cur = input.logs.filter((l) => l.log_date >= start && l.log_date <= input.endDate);
  const prev = input.logs.filter((l) => l.log_date >= prevStart && l.log_date <= prevEnd);
  const ck = input.checkins.filter((c) => c.date >= start && c.date <= input.endDate);

  const recordedDays = new Set([...cur.map((l) => l.log_date), ...ck.map((c) => c.date)]);
  const hariTercatat = recordedDays.size;
  const prevDays = new Set(prev.map((l) => l.log_date)).size;

  const digital = cur.filter((l) => l.type === "digital");
  const totalDigital = sumBy(digital, (l) => l.duration_min);
  const totalPositif = sumBy(cur.filter((l) => l.type === "positif"), (l) => l.duration_min);
  const avgScreen = hariTercatat ? Math.round(totalDigital / hariTercatat) : 0;

  const prevDigital = sumBy(prev.filter((l) => l.type === "digital"), (l) => l.duration_min);
  const prevPositif = sumBy(prev.filter((l) => l.type === "positif"), (l) => l.duration_min);
  const prevAvg = prevDays ? Math.round(prevDigital / prevDays) : 0;

  const accompanied = sumBy(digital.filter((l) => l.accompanied), (l) => l.duration_min);

  const beforeSleep = new Set<string>();
  for (const c of ck) if (c.device_before_sleep) beforeSleep.add(c.date);
  for (const l of digital) if (lateNight(l)) beforeSleep.add(l.log_date);

  let compliant = 0;
  for (const d of days) {
    if (!recordedDays.has(d)) continue;
    const dayDigital = digital.filter((l) => l.log_date === d);
    const total = sumBy(dayDigital, (l) => l.duration_min);
    const broke = dayDigital.some((l) => l.follows_agreement === false);
    if (total <= input.targetMin && !broke) compliant++;
  }

  const posComp = composition(cur, input.categories, "positif");
  const digComp = composition(cur, input.categories, "digital");

  const count = (vals: Array<string | null>) => {
    const r: Record<string, number> = {};
    for (const v of vals) if (v) r[v] = (r[v] ?? 0) + 1;
    return r;
  };

  const g = gcdRatio(totalDigital, totalPositif);

  return {
    periode: { mulai: start, selesai: input.endDate },
    usia_anak: input.childAge,
    jenjang: input.schoolLevel,
    hari_tercatat: hariTercatat,
    target_screen_min: input.targetMin,
    acuan_screen_time: input.reference ? { maks_menit: input.reference.max_min, catatan: input.reference.note } : null,
    rata_screen_min_per_hari: avgScreen,
    total_digital_min: totalDigital,
    total_positif_min: totalPositif,
    rasio_digital_positif: g,
    persen_positif: balancePercent(totalDigital, totalPositif),
    komposisi_tujuan_gawai: digComp.map((c) => ({ tujuan: c.name, menit: c.minutes, persen: c.percent })),
    persen_didampingi: totalDigital ? Math.round((accompanied / totalDigital) * 100) : 0,
    hari_gawai_menjelang_tidur: beforeSleep.size,
    hari_patuh_kesepakatan: compliant,
    variasi_aktivitas_positif: posComp.length,
    aktivitas_positif_teratas: posComp.slice(0, 3).map((c) => ({ kategori: c.name, menit: c.minutes })),
    tren: {
      rata_screen_minggu_lalu: prevAvg,
      perubahan_screen_persen: changePct(avgScreen, prevAvg),
      positif_minggu_lalu: prevPositif,
      perubahan_positif_persen: changePct(totalPositif, prevPositif),
    },
    checkin: {
      jumlah: ck.length,
      suasana_hati: count(ck.map((c) => c.mood)),
      respons_berhenti: count(ck.map((c) => c.stop_response)),
    },
    tindak_lanjut_sebelumnya: input.lastReflection
      ? { rencana: input.lastReflection.action_text, hasil: input.lastReflection.outcome }
      : null,
  };
}

/** Rasio sederhana "digital : positif", misalnya "2 : 1". */
export function gcdRatio(a: number, b: number): string {
  if (a === 0 && b === 0) return "0 : 0";
  if (b === 0) return "1 : 0";
  if (a === 0) return "0 : 1";
  const r = a / b;
  if (r >= 1) return `${Math.round(r * 10) / 10} : 1`.replace(".", ",");
  return `1 : ${Math.round((1 / r) * 10) / 10}`.replace(".", ",");
}

export type InsightOutput = {
  ringkasan: string;
  sudah_baik: string[];
  perlu_diperhatikan: string[];
  saran: string[];
  ide_obrolan: string;
};

/** Cadangan berbasis aturan jika AI gagal / saldo habis. */
export function ruleBasedInsight(ind: Indicators): InsightOutput {
  const baik: string[] = [];
  const perhatian: string[] = [];
  const saran: string[] = [];
  const target = ind.target_screen_min;
  const acuan = ind.acuan_screen_time?.maks_menit;

  if (ind.hari_tercatat < 4) {
    perhatian.push(`Baru ${ind.hari_tercatat} hari tercatat minggu ini, jadi gambarannya belum lengkap.`);
    saran.push("Coba catat setiap hari, cukup 1 menit sebelum tidur.");
  }
  if (ind.rata_screen_min_per_hari <= target) {
    baik.push(`Rata-rata waktu layar ${ind.rata_screen_min_per_hari} menit per hari, masih di bawah target ${target} menit.`);
  } else {
    perhatian.push(`Rata-rata waktu layar ${ind.rata_screen_min_per_hari} menit per hari, di atas target ${target} menit.`);
    saran.push("Beri tanda 5 menit sebelum waktu gawai habis agar anak siap berhenti.");
  }
  if (ind.persen_positif >= 50) baik.push(`Aktivitas positif mengisi ${ind.persen_positif}% dari waktu yang tercatat.`);
  else saran.push("Siapkan satu kegiatan pengganti yang disukai anak, misalnya menggambar atau merawat lele.");
  if (ind.persen_didampingi >= 50) baik.push(`${ind.persen_didampingi}% waktu gawai sudah didampingi.`);
  else saran.push("Luangkan 10–15 menit untuk ikut melihat apa yang ditonton atau dimainkan anak.");
  if (ind.hari_gawai_menjelang_tidur >= 3) {
    perhatian.push(`Ada ${ind.hari_gawai_menjelang_tidur} hari anak memakai gawai menjelang tidur.`);
    saran.push("Sepakati jam bebas gawai satu jam sebelum tidur, dan simpan HP di luar kamar.");
  }
  if (ind.variasi_aktivitas_positif >= 3) baik.push(`Anak mencoba ${ind.variasi_aktivitas_positif} jenis aktivitas positif.`);
  const menolak = ind.checkin.respons_berhenti["menolak"] ?? 0;
  if (menolak >= 3) perhatian.push(`Anak menolak berhenti memakai gawai pada ${menolak} hari.`);

  const ekstrem = (acuan !== undefined && ind.rata_screen_min_per_hari > acuan * 2) || menolak >= 5;
  const konsultasi = "Jika pola ini berlanjut, tidak ada salahnya berbincang dengan guru, psikolog, atau tenaga kesehatan.";
  if (baik.length === 0) baik.push("Ayah/Bunda sudah meluangkan waktu untuk mencatat. Itu langkah awal yang baik.");

  const top = ind.aktivitas_positif_teratas[0]?.kategori;
  return {
    ringkasan: `Minggu ini tercatat ${ind.hari_tercatat} hari dengan rata-rata waktu layar ${ind.rata_screen_min_per_hari} menit per hari dan ${ind.total_positif_min} menit aktivitas positif. Ringkasan ini dibuat otomatis dari angka catatan; keputusan pendampingan tetap di tangan Ayah dan Bunda.`,
    sudah_baik: baik.slice(0, 3),
    perlu_diperhatikan: perhatian.slice(0, 2),
    // Saran konsultasi selalu ikut (tidak terpotong) jika polanya ekstrem.
    saran: ekstrem ? [...saran.slice(0, 2), konsultasi] : saran.length ? saran.slice(0, 3) : ["Pertahankan kebiasaan baik minggu ini dan terus catat setiap hari."],
    ide_obrolan: top
      ? `"Kemarin kamu senang ${top.toLowerCase()}, bagian mana yang paling seru?"`
      : `"Kalau HP-nya istirahat sebentar, kamu ingin main apa bersama Ibu/Ayah?"`,
  };
}

export function parseInsight(raw: unknown): InsightOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  // Rapikan tanda pisah panjang dari keluaran AI menjadi koma.
  const clean = (t: string) => t.replace(/\s*—\s*/g, ", ").replace(/,\s*,/g, ",").trim();
  const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 4).map(clean) : []);
  if (typeof o.ringkasan !== "string" || typeof o.ide_obrolan !== "string") return null;
  return {
    ringkasan: clean(o.ringkasan),
    sudah_baik: arr(o.sudah_baik),
    perlu_diperhatikan: arr(o.perlu_diperhatikan),
    saran: arr(o.saran),
    ide_obrolan: clean(o.ide_obrolan),
  };
}
