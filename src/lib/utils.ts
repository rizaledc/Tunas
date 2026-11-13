export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export { normalizePhone } from "./validation";

/** Domain email sintetis (tidak pernah dikirimi email) untuk akun yang mendaftar hanya dengan nomor HP. */
const PHONE_EMAIL_DOMAIN = "hp.sahabat-anak.internal";

export function phoneToAuthEmail(phone: string): string {
  return `${phone}@${PHONE_EMAIL_DOMAIN}`;
}

export function isSyntheticEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith(`@${PHONE_EMAIL_DOMAIN}`);
}

export function randomCode(len = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function bool(fd: FormData, key: string): boolean | null {
  const v = str(fd, key);
  if (v === "ya" || v === "true" || v === "on") return true;
  if (v === "tidak" || v === "false") return false;
  return null;
}

export function int(fd: FormData, key: string, fallback = 0): number {
  const n = Number.parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/** Pilihan jenjang yang bisa dipilih orang tua (urut dari kecil ke besar). */
export const SCHOOL_LEVELS: Record<string, string> = {
  paud: "PAUD",
  tk: "TK",
  sd1: "SD kelas 1",
  sd2: "SD kelas 2",
  sd3: "SD kelas 3",
  sd4: "SD kelas 4",
  sd5: "SD kelas 5",
  sd6: "SD kelas 6",
  smp1: "SMP kelas 1 (7)",
  smp2: "SMP kelas 2 (8)",
  smp3: "SMP kelas 3 (9)",
  sma1: "SMA/SMK kelas 1 (10)",
  sma2: "SMA/SMK kelas 2 (11)",
  sma3: "SMA/SMK kelas 3 (12)",
  lainnya: "Lainnya",
};

/** Nilai lama (sebelum pilihan per kelas) tetap dikenali untuk data yang sudah tersimpan. */
const LEGACY_LEVELS: Record<string, string> = { sd_awal: "SD kelas 1–3", sd_akhir: "SD kelas 4–6", smp: "SMP" };

export const SCHOOL_LEVEL_KEYS = Object.keys(SCHOOL_LEVELS) as [string, ...string[]];

export function schoolLevelLabel(level: string | null | undefined): string {
  if (!level) return "";
  return SCHOOL_LEVELS[level] ?? LEGACY_LEVELS[level] ?? level;
}

/** Semua kelas untuk statistik (lengkap per kelas), ditambah nilai lama yang masih ada di data. */
export function levelKeysInData(present: string[]): string[] {
  const legacy = [...new Set(present)].filter((k) => !SCHOOL_LEVELS[k] && LEGACY_LEVELS[k]);
  return [...Object.keys(SCHOOL_LEVELS), ...legacy];
}

export const GALLERY_CATEGORIES: Record<string, string> = {
  anak: "Anak",
  orang_tua: "Orang Tua",
  pembinaan: "Pembinaan",
  lele: "Lele",
};

export const MOODS: Record<string, { label: string; icon: "face-happy" | "face-smile" | "face-sad" | "face-angry" }> = {
  senang: { label: "Senang", icon: "face-happy" },
  biasa: { label: "Biasa", icon: "face-smile" },
  sedih: { label: "Sedih", icon: "face-sad" },
  marah: { label: "Marah", icon: "face-angry" },
};

export const STOP_RESPONSES: Record<string, string> = {
  mudah: "Berhenti dengan mudah",
  diingatkan: "Perlu diingatkan",
  menolak: "Menolak berhenti",
};

export const WITH_WHOM = ["Sendiri", "Ayah/Ibu", "Saudara", "Teman", "Guru/Ustaz", "Kakek/Nenek"];
