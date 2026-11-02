import { describe, expect, it } from "vitest";
import { balancePercent, computeIndicators, gcdRatio, parseInsight, ruleBasedInsight, type LogRow } from "../src/lib/indicators";

const cats = [
  { id: "g", type: "digital" as const, name: "Game", icon: "🎮" },
  { id: "b", type: "digital" as const, name: "Belajar", icon: "📚" },
  { id: "l", type: "positif" as const, name: "Merawat lele", icon: "🐟" },
  { id: "m", type: "positif" as const, name: "Membaca", icon: "📖" },
];

const log = (d: string, type: "digital" | "positif", cat: string, min: number, extra: Partial<LogRow> = {}): LogRow => ({
  log_date: d,
  type,
  category_id: cat,
  duration_min: min,
  accompanied: null,
  follows_agreement: null,
  start_at: null,
  end_at: null,
  ...extra,
});

describe("computeIndicators", () => {
  const base = {
    endDate: "2026-11-10",
    checkins: [],
    categories: cats,
    targetMin: 90,
    childAge: 9,
    schoolLevel: "SD kelas 4–6",
    reference: { max_min: 120, note: "draf" },
    lastReflection: null,
  };

  it("menghitung rata-rata per hari tercatat, kepatuhan, dan tren", () => {
    const logs = [
      log("2026-11-10", "digital", "g", 120, { accompanied: false }),
      log("2026-11-10", "positif", "l", 60),
      log("2026-11-09", "digital", "b", 60, { accompanied: true }),
      log("2026-11-09", "positif", "m", 30),
      // minggu lalu
      log("2026-11-02", "digital", "g", 200),
      log("2026-11-01", "positif", "m", 30),
    ];
    const ind = computeIndicators({ ...base, logs });
    expect(ind.hari_tercatat).toBe(2);
    expect(ind.total_digital_min).toBe(180);
    expect(ind.rata_screen_min_per_hari).toBe(90);
    expect(ind.total_positif_min).toBe(90);
    expect(ind.persen_positif).toBe(33);
    expect(ind.persen_didampingi).toBe(33);
    expect(ind.hari_patuh_kesepakatan).toBe(1); // 11-10 melebihi 90, 11-09 patuh
    expect(ind.variasi_aktivitas_positif).toBe(2);
    expect(ind.komposisi_tujuan_gawai[0]).toEqual({ tujuan: "Game", menit: 120, persen: 67 });
    expect(ind.tren.rata_screen_minggu_lalu).toBe(100);
    expect(ind.tren.perubahan_screen_persen).toBe(-10);
    expect(ind.periode).toEqual({ mulai: "2026-11-04", selesai: "2026-11-10" });
  });

  it("menandai hari tidak patuh jika ada catatan di luar kesepakatan", () => {
    const ind = computeIndicators({ ...base, logs: [log("2026-11-10", "digital", "g", 30, { follows_agreement: false })] });
    expect(ind.hari_patuh_kesepakatan).toBe(0);
  });

  it("menghitung gawai menjelang tidur dari check-in dan jam selesai", () => {
    const ind = computeIndicators({
      ...base,
      logs: [log("2026-11-08", "digital", "g", 30, { start_at: "2026-11-08T14:00:00Z", end_at: "2026-11-08T14:30:00Z" })], // 21.30 WIB
      checkins: [{ date: "2026-11-10", mood: "senang", stop_response: "menolak", sleep_time: "21:00", device_before_sleep: true }],
    });
    expect(ind.hari_gawai_menjelang_tidur).toBe(2);
    expect(ind.checkin.respons_berhenti).toEqual({ menolak: 1 });
  });
});

describe("ruleBasedInsight", () => {
  it("menghasilkan 5 bagian dan menyebut data sedikit", () => {
    const ind = computeIndicators({
      endDate: "2026-11-10",
      logs: [log("2026-11-10", "digital", "g", 300)],
      checkins: [],
      categories: cats,
      targetMin: 60,
      childAge: 8,
      schoolLevel: "SD",
      reference: { max_min: 120, note: "" },
      lastReflection: null,
    });
    const out = ruleBasedInsight(ind);
    expect(out.ringkasan).toContain("keputusan pendampingan tetap di tangan");
    expect(out.perlu_diperhatikan.length).toBeGreaterThan(0);
    expect(out.perlu_diperhatikan.length).toBeLessThanOrEqual(2);
    expect(out.saran.length).toBeGreaterThan(0);
    expect(out.saran.join(" ")).toContain("psikolog"); // 300 > 2 × 120
    expect(out.ide_obrolan.length).toBeGreaterThan(5);
    expect(JSON.stringify(out)).not.toMatch(/kecanduan/i);
  });
});

describe("helpers", () => {
  it("parseInsight menolak format tidak valid", () => {
    expect(parseInsight({ foo: 1 })).toBeNull();
    expect(parseInsight({ ringkasan: "a", ide_obrolan: "b", saran: ["x", 2] })?.saran).toEqual(["x"]);
  });
  it("rasio dan keseimbangan", () => {
    expect(gcdRatio(120, 60)).toBe("2 : 1");
    expect(gcdRatio(30, 90)).toBe("1 : 3");
    expect(balancePercent(0, 0)).toBe(0);
    expect(balancePercent(50, 50)).toBe(50);
  });
});

describe("parseInsight membersihkan tanda pisah panjang", () => {
  it("mengganti em dash dengan koma, rentang angka tetap", () => {
    const o = parseInsight({ ringkasan: "Minggu ini bagus — terus pertahankan", sudah_baik: ["Main 10–15 menit"], perlu_diperhatikan: [], saran: ["Coba ini — lalu itu"], ide_obrolan: "Apa kabar?" })!;
    expect(o.ringkasan).toBe("Minggu ini bagus, terus pertahankan");
    expect(o.saran[0]).toBe("Coba ini, lalu itu");
    expect(o.sudah_baik[0]).toBe("Main 10–15 menit");
  });
});
