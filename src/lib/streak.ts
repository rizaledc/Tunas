import { addDays } from "./date";

/** Tonggak streak (hari berturut-turut) yang dirayakan. */
export const MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365] as const;

export type Streak = {
  current: number;
  best: number;
  /** Sudah melapor hari ini (api menyala). */
  doneToday: boolean;
  /** Streak masih bisa diselamatkan hari ini (kemarin melapor, hari ini belum). */
  atRisk: boolean;
  /** 7 hari terakhir, dari paling lama ke hari ini. */
  week: Array<{ date: string; done: boolean }>;
  nextMilestone: number | null;
};

/**
 * Hitung streak dari kumpulan tanggal WIB (YYYY-MM-DD) saat orang tua melapor.
 * Mirip Duolingo: streak bertambah 1 per hari ada laporan, tetap hidup sampai akhir
 * hari berikutnya, dan putus bila satu hari penuh terlewat.
 */
export function computeStreak(days: Iterable<string>, today: string): Streak {
  const set = new Set(days);
  const doneToday = set.has(today);
  let cursor = doneToday ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  const sorted = [...set].filter((d) => d <= today).sort();
  let best = 0;
  let run = 0;
  let prev = "";
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, done: set.has(date) };
  });
  return {
    current,
    best: Math.max(best, current),
    doneToday,
    atRisk: !doneToday && current > 0,
    week,
    nextMilestone: MILESTONES.find((m) => m > current) ?? null,
  };
}

export function streakMessage(current: number, before: number): string | null {
  if (current <= before) return null;
  if ((MILESTONES as readonly number[]).includes(current)) return `Luar biasa! Streak ${current} hari berturut-turut`;
  if (current === 1) return before === 0 ? "Api menyala! Streak hari pertama dimulai." : null;
  return `Streak ${current} hari! Pertahankan besok ya.`;
}
