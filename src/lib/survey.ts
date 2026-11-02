export type Question = { id: string; text: string; scale?: 5; positive?: boolean };

/** System Usability Scale (SUS): 10 butir, skala 1–5. */
export const SUS_QUESTIONS: Question[] = [
  { id: "q1", text: "Saya ingin sering memakai SAHABAT ANAK.", positive: true },
  { id: "q2", text: "SAHABAT ANAK terasa rumit tanpa perlu.", positive: false },
  { id: "q3", text: "SAHABAT ANAK mudah dipakai.", positive: true },
  { id: "q4", text: "Saya butuh bantuan orang lain untuk memakai SAHABAT ANAK.", positive: false },
  { id: "q5", text: "Fitur-fitur di SAHABAT ANAK saling terhubung dengan baik.", positive: true },
  { id: "q6", text: "Banyak hal yang tidak konsisten di SAHABAT ANAK.", positive: false },
  { id: "q7", text: "Kebanyakan orang akan cepat belajar memakai SAHABAT ANAK.", positive: true },
  { id: "q8", text: "SAHABAT ANAK membingungkan saat dipakai.", positive: false },
  { id: "q9", text: "Saya percaya diri memakai SAHABAT ANAK.", positive: true },
  { id: "q10", text: "Saya perlu belajar banyak hal dulu sebelum bisa memakai SAHABAT ANAK.", positive: false },
];

export const ACCEPTANCE_QUESTIONS: Question[] = [
  { id: "a1", text: "SAHABAT ANAK membantu saya memahami kebiasaan digital anak.", positive: true },
  { id: "a2", text: "Mencatat aktivitas anak di aplikasi tidak memakan waktu lama.", positive: true },
  { id: "a3", text: "Saya akan terus memakai SAHABAT ANAK setelah program selesai.", positive: true },
  { id: "a4", text: "Saya akan menyarankan SAHABAT ANAK kepada orang tua lain.", positive: true },
];

export const BENEFIT_QUESTIONS: Question[] = [
  { id: "m1", text: "Grafik keseimbangan membantu saya melihat pola aktivitas anak.", positive: true },
  { id: "m2", text: "Saran dari insight AI bisa saya terapkan di rumah.", positive: true },
  { id: "m3", text: "Kesepakatan keluarga lebih mudah dijalankan.", positive: true },
  { id: "m4", text: "Saya lebih sering mendampingi anak saat memakai gawai.", positive: true },
  { id: "m5", text: "Anak lebih sering melakukan aktivitas positif non-digital.", positive: true },
];

export const SURVEY_TEMPLATES = {
  sus: { name: "System Usability Scale (SUS)", questions: SUS_QUESTIONS },
  penerimaan: { name: "Penerimaan Aplikasi", questions: ACCEPTANCE_QUESTIONS },
  manfaat: { name: "Manfaat Program", questions: BENEFIT_QUESTIONS },
} as const;

/** Skor SUS 0–100. Butir ganjil: (x−1), genap: (5−x), jumlah × 2,5. */
export function susScore(answers: Record<string, number>): number | null {
  let sum = 0;
  for (let i = 1; i <= 10; i++) {
    const v = answers[`q${i}`];
    if (!v || v < 1 || v > 5) return null;
    sum += i % 2 === 1 ? v - 1 : 5 - v;
  }
  return sum * 2.5;
}

/** Skor rata-rata Likert (1–5) dengan butir negatif dibalik. */
export function likertScore(questions: Question[], answers: Record<string, number>): number | null {
  const vals: number[] = [];
  for (const q of questions) {
    const v = answers[q.id];
    if (!v || v < 1 || v > 5) return null;
    vals.push(q.positive === false ? 6 - v : v);
  }
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
}

export function scoreSurvey(kind: string, questions: Question[], answers: Record<string, number>): number | null {
  return kind === "sus" ? susScore(answers) : likertScore(questions, answers);
}

export function susGrade(score: number): string {
  if (score >= 85) return "Sangat baik";
  if (score >= 71) return "Baik";
  if (score >= 51) return "Cukup";
  return "Perlu perbaikan";
}
