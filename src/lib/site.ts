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
