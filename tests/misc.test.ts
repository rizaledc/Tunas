import { describe, expect, it } from "vitest";
import { likertScore, susScore, SUS_QUESTIONS } from "../src/lib/survey";
import { canShowGroup, suppress } from "../src/lib/privacy";
import { renderMarkdown } from "../src/lib/markdown";
import { normalizePhone, slugify } from "../src/lib/utils";
import { addDays, formatMenit, startOfWeek, wibToIso, isoToWibTime } from "../src/lib/date";
import { computeBadges } from "../src/lib/badges";

describe("SUS", () => {
  it("skor maksimal 100 dan minimal 0", () => {
    const best: Record<string, number> = {};
    const worst: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      best[`q${i}`] = i % 2 ? 5 : 1;
      worst[`q${i}`] = i % 2 ? 1 : 5;
    }
    expect(susScore(best)).toBe(100);
    expect(susScore(worst)).toBe(0);
    expect(susScore({ q1: 3 })).toBeNull();
  });
  it("likert membalik butir negatif", () => {
    const a = Object.fromEntries(SUS_QUESTIONS.map((q) => [q.id, q.positive ? 5 : 1]));
    expect(likertScore(SUS_QUESTIONS, a)).toBe(5);
  });
});

describe("privasi statistik", () => {
  it("menyembunyikan kelompok < 5 keluarga", () => {
    expect(canShowGroup(4)).toBe(false);
    expect(canShowGroup(5)).toBe(true);
    expect(suppress(3, 10)).toBeNull();
  });
});

describe("markdown", () => {
  it("escape HTML dan render dasar", () => {
    const html = renderMarkdown("## Judul\n\n**tebal** <script>alert(1)</script>\n\n- a\n- b\n\n[x](javascript:alert(1))");
    expect(html).toContain("<h2>Judul</h2>");
    expect(html).toContain("<strong>tebal</strong>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("<ul>");
    expect(html).not.toContain('href="javascript');
  });
});

describe("utils", () => {
  it("normalisasi nomor HP", () => {
    expect(normalizePhone("0812-3456-7890")).toBe("6281234567890");
    expect(normalizePhone("+62 812 3456 7890")).toBe("6281234567890");
    expect(normalizePhone("81234567890")).toBe("6281234567890");
    expect(normalizePhone("123")).toBeNull();
  });
  it("slugify", () => {
    expect(slugify("Games Tanya Jawab Anak!")).toBe("games-tanya-jawab-anak");
  });
  it("tanggal WIB", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(startOfWeek("2026-11-08")).toBe("2026-11-02"); // Minggu → Senin
    expect(isoToWibTime(wibToIso("2026-11-02", "19:30"))).toBe("19:30");
    expect(formatMenit(135)).toBe("2 j 15 mnt");
  });
  it("lencana mode anak", () => {
    const logs = Array.from({ length: 5 }, (_, i) => ({ log_date: addDays("2026-11-10", -i), category_id: String(i % 3) }));
    const { stars, badges } = computeBadges(logs, "2026-11-10");
    expect(stars).toBe(5);
    expect(badges.filter((b) => b.earned).map((b) => b.name)).toEqual(["Bintang Pertama", "Rajin", "Penjelajah", "Seminggu Hebat"]);
  });
});

import { tempPassword } from "../src/lib/crypto";
describe("password sementara admin", () => {
  it("selalu memenuhi aturan password kuat", async () => {
    const { validatePassword } = await import("../src/lib/validation");
    for (let i = 0; i < 200; i++) expect(validatePassword(tempPassword())).toBeNull();
  });
});

describe("koin AI & angka capaian", () => {
  it("periode koin berganti pukul 07.00 WIB (00.00 UTC)", async () => {
    const { coinPeriod } = await import("../src/lib/date");
    // 06.59 WIB tanggal 3 = 23.59 UTC tanggal 2 → masih periode tanggal 2
    expect(coinPeriod(new Date("2026-11-02T23:59:00Z")).start.toISOString()).toBe("2026-11-02T00:00:00.000Z");
    // 07.00 WIB tanggal 3 → periode baru
    const p = coinPeriod(new Date("2026-11-03T00:00:00Z"));
    expect(p.start.toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(p.next.toISOString()).toBe("2026-11-04T00:00:00.000Z");
  });
  it("membaca angka persen dan skor", async () => {
    const { parseStat } = await import("../src/lib/stat-value");
    expect(parseStat("91,8%")).toEqual({ value: 91.8, percent: true });
    expect(parseStat("4,14")).toEqual({ value: 4.14, percent: false });
    expect(parseStat("")).toBeNull();
  });
});
