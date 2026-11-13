/**
 * Logbook pemantauan harian lele (Instrumen I, Instrumen Evaluasi Program Pemeliharaan Lele Mandiri).
 * Satu isian per anak per hari; nilai disimpan di tabel lele_logs.
 */
export const LELE_OPTIONS = {
  pakan: [
    { value: "tepat", label: "Tepat waktu" },
    { value: "terlambat", label: "Terlambat" },
    { value: "tidak", label: "Tidak diberi" },
  ],
  air: [
    { value: "hijau", label: "Hijau (normal)" },
    { value: "keruh", label: "Coklat-hitam (keruh/bau)" },
    { value: "jernih", label: "Jernih" },
    { value: "berbusa", label: "Berbusa" },
  ],
  perilaku: [
    { value: "aktif", label: "Aktif/lahap" },
    { value: "pasif", label: "Pasif/sisa pakan banyak" },
    { value: "menggantung", label: "Menggantung di permukaan" },
    { value: "kematian", label: "Ada kematian ikan" },
  ],
  cuaca: [
    { value: "cerah", label: "Cerah/berawan" },
    { value: "hujan", label: "Hujan lebat" },
  ],
} as const;

export type LeleLog = {
  log_date: string;
  pakan_pagi: string | null;
  pakan_sore: string | null;
  air: string[];
  perilaku: string[];
  cuaca: string | null;
  didampingi: boolean;
  catatan: string | null;
};

const allowed = (k: keyof typeof LELE_OPTIONS) => new Set<string>(LELE_OPTIONS[k].map((o) => o.value));

/** Ambil isian lele dari FormData; null bila tidak ada satu pun yang diisi. */
export function parseLeleForm(fd: FormData): Omit<LeleLog, "log_date" | "catatan"> | null {
  const one = (name: string, k: keyof typeof LELE_OPTIONS) => {
    const v = String(fd.get(name) ?? "");
    return allowed(k).has(v) ? v : null;
  };
  const many = (name: string, k: keyof typeof LELE_OPTIONS) => fd.getAll(name).map(String).filter((v) => allowed(k).has(v));
  const row = {
    pakan_pagi: one("lele_pakan_pagi", "pakan"),
    pakan_sore: one("lele_pakan_sore", "pakan"),
    air: [...new Set(many("lele_air", "air"))],
    perilaku: [...new Set(many("lele_perilaku", "perilaku"))],
    cuaca: one("lele_cuaca", "cuaca"),
    didampingi: fd.get("lele_didampingi") === "on",
  };
  const any = row.pakan_pagi || row.pakan_sore || row.air.length || row.perilaku.length || row.cuaca || row.didampingi;
  return any ? row : null;
}

export const label = (k: keyof typeof LELE_OPTIONS, v: string | null | undefined) => LELE_OPTIONS[k].find((o) => o.value === v)?.label ?? "";

export function isLeleCategory(c: { name: string; icon: string }) {
  return c.icon === "fish" || /lele/i.test(c.name);
}

export function isOtherCategory(c: { name: string; icon?: string }) {
  return c.name.trim().toLowerCase() === "lainnya";
}
