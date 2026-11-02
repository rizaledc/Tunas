import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

// Batasi thread libvips: server hosting bersama membatasi jumlah thread per akun.
sharp.concurrency(2);

/** Ukuran standar pratinjau tautan (WhatsApp, Facebook, X, Telegram, LinkedIn). */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/jpeg";

const LEAF_PARENT = "M23.5 38C13.5 35 8 26 10 12c8.5.4 14.5 7 13.5 26z";
const LEAF_CHILD = "M24.6 38c.3-9.5 4.6-15 12.6-15.6.9 8.4-4.4 14.4-12.6 15.6z";

let fonts: Promise<Array<{ name: string; data: Buffer; weight: 400 | 800; style: "normal" }>> | null = null;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/plus-jakarta-sans-latin-400-normal.woff")),
    readFile(join(process.cwd(), "src/assets/fonts/plus-jakarta-sans-latin-800-normal.woff")),
  ]).then(([regular, bold]) => [
    { name: "Jakarta", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Jakarta", data: bold, weight: 800 as const, style: "normal" as const },
  ]);
  return fonts;
}

/** Foto (termasuk WebP) → JPEG data URL 1200×630 agar bisa dipakai di kartu. */
async function photoDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const jpg = await sharp(Buffer.from(await res.arrayBuffer())).resize(OG_SIZE.width, OG_SIZE.height, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer();
    return `data:image/jpeg;base64,${jpg.toString("base64")}`;
  } catch {
    return null;
  }
}

function Mark({ size, tile }: { size: number; tile?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {tile && <rect width="48" height="48" rx="11" fill="#940000" />}
      <path d={LEAF_PARENT} fill="#ffffff" transform="translate(0 -1)" />
      <path d={LEAF_CHILD} fill={tile ? "#ff5a5a" : "#ff3d3d"} transform="translate(0 -1)" />
    </svg>
  );
}

const clamp = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/**
 * Kartu pratinjau tautan bermerek. Hasil JPEG (±50–150 KB): format & ukuran
 * yang paling andal untuk WhatsApp (yang sering gagal memuat gambar besar/WebP).
 */
export async function shareImage(opts: { title: string; kicker?: string; subtitle?: string; photo?: string | null; fullPhoto?: string | null }) {
  const [f, photo, full] = await Promise.all([loadFonts(), photoDataUrl(opts.photo), photoDataUrl(opts.fullPhoto)]);

  const node = full ? (
    // Gambar khusus dari admin dipakai apa adanya.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={full} width={OG_SIZE.width} height={OG_SIZE.height} alt="" style={{ objectFit: "cover" }} />
  ) : photo ? (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", fontFamily: "Jakarta" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} width={OG_SIZE.width} height={OG_SIZE.height} alt="" style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: OG_SIZE.width, height: OG_SIZE.height, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(34,0,0,0.55) 55%, rgba(14,14,14,0.96) 100%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column", color: "white" }}>
        {opts.kicker && <div style={{ fontSize: 30, fontWeight: 800, color: "#ff3d3d", letterSpacing: 6 }}>{opts.kicker.toUpperCase()}</div>}
        <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.04, marginTop: 10, letterSpacing: -2 }}>{clamp(opts.title, 90)}</div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 24, fontSize: 28 }}>
          <Mark size={44} tile />
          <span style={{ marginLeft: 14, fontWeight: 800 }}>SAHABAT</span>
          <span style={{ marginLeft: 8, fontWeight: 800, color: "#ff3d3d" }}>ANAK</span>
        </div>
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#0e0e0e", fontFamily: "Jakarta", position: "relative", color: "white" }}>
      <div style={{ position: "absolute", right: -160, top: -200, width: 760, height: 760, borderRadius: 9999, display: "flex", backgroundImage: "radial-gradient(circle, rgba(176,0,0,0.75) 0%, rgba(118,0,0,0.25) 45%, rgba(14,14,14,0) 70%)" }} />
      <div style={{ position: "absolute", right: 90, top: 150, display: "flex", opacity: 0.95 }}>
        <Mark size={300} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px 0", width: 780 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 26, letterSpacing: 5 }}>
          <Mark size={50} tile />
          <span style={{ marginLeft: 16, fontWeight: 800 }}>SAHABAT</span>
          <span style={{ marginLeft: 10, fontWeight: 800, color: "#ff3d3d" }}>ANAK</span>
        </div>
        {opts.kicker && <div style={{ marginTop: 56, fontSize: 22, fontWeight: 800, color: "#ff3d3d", letterSpacing: 6 }}>{opts.kicker.toUpperCase()}</div>}
        <div style={{ marginTop: opts.kicker ? 14 : 64, fontSize: opts.title.length > 50 ? 58 : 70, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>{clamp(opts.title, 100)}</div>
        {opts.subtitle && <div style={{ marginTop: 24, fontSize: 27, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{clamp(opts.subtitle, 140)}</div>}
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 46, display: "flex", alignItems: "center", fontSize: 18, letterSpacing: 6, color: "rgba(255,255,255,0.55)", fontWeight: 800 }}>
        <div style={{ width: 56, height: 2, background: "#e60000", marginRight: 18, display: "flex" }} />
        TUMBUH SEIMBANG BERSAMA KELUARGA
      </div>
    </div>
  );

  const png = await new ImageResponse(node, { ...OG_SIZE, fonts: await f }).arrayBuffer();
  const jpg = await sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: { "Content-Type": OG_TYPE, "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
