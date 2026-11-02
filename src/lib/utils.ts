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

export const SCHOOL_LEVELS: Record<string, string> = {
  paud: "PAUD",
  tk: "TK",
  sd_awal: "SD kelas 1–3",
  sd_akhir: "SD kelas 4–6",
  smp: "SMP",
  lainnya: "Lainnya",
};

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
