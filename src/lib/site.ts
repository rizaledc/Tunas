/**
 * URL publik situs (wajib absolut agar gambar pratinjau WhatsApp/medsos bisa diambil).
 * Urutan: NEXT_PUBLIC_SITE_URL → domain produksi Vercel → URL deployment Vercel → localhost.
 */
function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;
  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolve().replace(/\/$/, "");

const LOCAL_HOST = /^(0\.0\.0\.0|127\.0\.0\.1|localhost|\[::\]|\[::1\])(:\d+)?$/;

/**
 * Origin publik untuk redirect di route handler/proxy. Di hosting Node (mis. Hostinger)
 * aplikasi berjalan di belakang reverse proxy sehingga request.url berisi 0.0.0.0:3000.
 * Urutan: header x-forwarded-host → header host → SITE_URL.
 */
export function publicOrigin(request: Request): string {
  const h = request.headers;
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim();
  if (host && !LOCAL_HOST.test(host)) {
    const proto = (h.get("x-forwarded-proto") ?? "").split(",")[0].trim() || (SITE_URL.startsWith("https") ? "https" : new URL(request.url).protocol.replace(":", ""));
    return `${proto}://${host}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) return SITE_URL;
  return new URL(request.url).origin;
}

/** URL absolut di situs publik untuk path tertentu. */
export function publicUrl(path: string, request: Request): URL {
  return new URL(path, publicOrigin(request) + "/");
}
