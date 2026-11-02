import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SECRET = process.env.APP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-secret-ganti-di-produksi";

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(pin, salt, 32);
  const ref = Buffer.from(hash, "hex");
  return ref.length === test.length && timingSafeEqual(ref, test);
}

export function sign(value: string): string {
  const mac = createHmac("sha256", SECRET).update(value).digest("base64url");
  return `${value}.${mac}`;
}

export function unsign(signed: string | undefined): string | null {
  if (!signed) return null;
  const i = signed.lastIndexOf(".");
  if (i < 0) return null;
  const value = signed.slice(0, i);
  const expected = sign(value);
  const a = Buffer.from(expected);
  const b = Buffer.from(signed);
  return a.length === b.length && timingSafeEqual(a, b) ? value : null;
}

export function sha256(s: string): string {
  return createHmac("sha256", "input-hash").update(s).digest("hex");
}

export function tempPassword(): string {
  return randomBytes(6).toString("base64url").replace(/[-_]/g, "x") + "9a";
}
