/**
 * Aturan validasi bersama (dipakai di browser untuk panduan langsung dan di server
 * sebagai penjaga akhir). Jangan import modul server di sini.
 */

export const PASSWORD_MIN = 10;

/** Password yang terlalu umum / mudah ditebak (dicek tanpa membedakan huruf besar-kecil). */
const COMMON = [
  "password", "passw0rd", "qwerty", "123456", "12345678", "123456789", "1234567890", "abc123", "admin", "iloveyou",
  "sahabat", "sahabatanak", "anakku", "bismillah", "indonesia", "rahasia", "sayang", "cinta", "welcome", "letmein",
];

export type PasswordCheck = { id: string; label: string; ok: boolean };

export function passwordChecks(pw: string, ctx: { name?: string; phone?: string; email?: string } = {}): PasswordCheck[] {
  const lower = pw.toLowerCase();
  const personal = [ctx.name, ctx.email?.split("@")[0], ctx.phone?.replace(/\D/g, "").slice(-6)]
    .flatMap((v) => (v ?? "").toLowerCase().split(/\s+/))
    .filter((v) => v.length >= 4);
  return [
    { id: "len", label: `Minimal ${PASSWORD_MIN} karakter`, ok: pw.length >= PASSWORD_MIN },
    { id: "upper", label: "Ada huruf besar (A–Z)", ok: /[A-Z]/.test(pw) },
    { id: "lower", label: "Ada huruf kecil (a–z)", ok: /[a-z]/.test(pw) },
    { id: "digit", label: "Ada angka (0–9)", ok: /\d/.test(pw) },
    { id: "symbol", label: "Ada simbol (mis. ! @ # $ % & *)", ok: /[^A-Za-z0-9\s]/.test(pw) },
    {
      id: "safe",
      label: "Bukan kata umum, nama, atau nomor HP Anda",
      ok: pw.length > 0 && !COMMON.some((c) => lower.includes(c)) && !personal.some((p) => lower.includes(p)) && !/(.)\1{3,}/.test(pw) && !/\s/.test(pw),
    },
  ];
}

export function passwordScore(pw: string, ctx?: Parameters<typeof passwordChecks>[1]): number {
  if (!pw) return 0;
  const passed = passwordChecks(pw, ctx).filter((c) => c.ok).length;
  return Math.min(4, Math.floor((passed / 6) * 4 + (pw.length >= 14 ? 0.5 : 0)));
}

/** null jika kuat; selain itu pesan kesalahan pertama. */
export function validatePassword(pw: string, ctx?: Parameters<typeof passwordChecks>[1]): string | null {
  if (pw.length > 72) return "Password maksimal 72 karakter.";
  const fail = passwordChecks(pw, ctx).find((c) => !c.ok);
  return fail ? `Password belum kuat: ${fail.label.charAt(0).toLowerCase()}${fail.label.slice(1)}.` : null;
}

/** Contoh password kuat yang mudah diketik di HP (untuk tombol "Buatkan password"). */
export function generateStrongPassword(): string {
  const words = ["Lele", "Pelangi", "Kelapa", "Mangga", "Bintang", "Sawah", "Merpati", "Rambutan", "Kancil", "Gunung", "Pantai", "Melati"];
  const symbols = "!@#$%&*?";
  const rnd = (n: number) => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % n;
  };
  let w1 = words[rnd(words.length)];
  let w2 = words[rnd(words.length)];
  while (w2 === w1) w2 = words[rnd(words.length)];
  w1 = w1.toLowerCase();
  return `${w2}${symbols[rnd(symbols.length)]}${w1}${10 + rnd(90)}`;
}

/** Nomor HP Indonesia → 62xxxxxxxxxx. Hanya angka (boleh spasi, tanda -, dan + di depan). */
export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  if (!raw || !/^\+?[\d\s-]+$/.test(raw)) return null;
  let d = raw.replace(/[\s-]/g, "").replace(/^\+/, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  // Seluler Indonesia: 62 8xx, total 10–13 digit setelah 62.
  if (!/^628[1-9]\d{6,10}$/.test(d)) return null;
  return d;
}

export function phoneError(input: string): string | null {
  if (!input.trim()) return "Nomor HP wajib diisi.";
  if (/[^\d\s+-]/.test(input)) return "Nomor HP hanya boleh berisi angka.";
  return normalizePhone(input) ? null : "Nomor HP tidak valid. Gunakan nomor seluler Indonesia, contoh 081234567890.";
}

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

export function normalizeEmail(input: string): string | null {
  const e = input.trim().toLowerCase();
  if (e.length > 254 || !EMAIL_RE.test(e) || e.includes("..")) return null;
  return e;
}

export function emailError(input: string): string | null {
  if (!input.trim()) return "Email wajib diisi.";
  return normalizeEmail(input) ? null : "Format email tidak valid, contoh nama@gmail.com.";
}

/** Pembetulan salah ketik domain email yang umum. */
export function emailTypoHint(input: string): string | null {
  const m = input.trim().toLowerCase().match(/@(.+)$/);
  if (!m) return null;
  const fixes: Record<string, string> = { "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmail.co": "gmail.com", "gamil.com": "gmail.com", "gmail.con": "gmail.com", "yaho.com": "yahoo.com", "yahoo.co": "yahoo.com", "yahooo.com": "yahoo.com", "hotmial.com": "hotmail.com" };
  return fixes[m[1]] ? input.trim().replace(/@.+$/, `@${fixes[m[1]]}`) : null;
}
