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
    readFile(join(process.cwd(), "src/assets/fonts/nunito-latin-400-normal.woff")),
    readFile(join(process.cwd(), "src/assets/fonts/nunito-latin-800-normal.woff")),
  ]).then(([regular, bold]) => [
    { name: "Nunito", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Nunito", data: bold, weight: 800 as const, style: "normal" as const },
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
      {tile && <rect width="48" height="48" rx="11" fill="#23824a" />}
      <path d={LEAF_PARENT} fill={tile ? "#ffffff" : "#23824a"} transform="translate(0 -1)" />
      <path d={LEAF_CHILD} fill={tile ? "#ffa94d" : "#f28c28"} transform="translate(0 -1)" />
    </svg>
  );
}

const clamp = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/**
 * Kartu pratinjau tautan bermerek. Hasil JPEG (±50–150 KB) — format & ukuran
 * yang paling andal untuk WhatsApp (yang sering gagal memuat gambar besar/WebP).
 */
export async function shareImage(opts: { title: string; kicker?: string; subtitle?: string; photo?: string | null; fullPhoto?: string | null }) {
  const [f, photo, full] = await Promise.all([loadFonts(), photoDataUrl(opts.photo), photoDataUrl(opts.fullPhoto)]);

  const node = full ? (
    // Gambar khusus dari admin dipakai apa adanya.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={full} width={OG_SIZE.width} height={OG_SIZE.height} alt="" style={{ objectFit: "cover" }} />
  ) : photo ? (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", fontFamily: "Nunito" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} width={OG_SIZE.width} height={OG_SIZE.height} alt="" style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: OG_SIZE.width, height: OG_SIZE.height, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(18,61,37,0.55) 55%, rgba(18,61,37,0.95) 100%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column", color: "white" }}>
        {opts.kicker && <div style={{ fontSize: 30, fontWeight: 800, color: "#ffa94d", letterSpacing: 1 }}>{opts.kicker.toUpperCase()}</div>}
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1, marginTop: 8 }}>{clamp(opts.title, 90)}</div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 24, fontSize: 28 }}>
          <Mark size={44} tile />
          <span style={{ marginLeft: 14, fontWeight: 800 }}>SAHABAT</span>
          <span style={{ marginLeft: 8, fontWeight: 800, color: "#ffa94d" }}>ANAK</span>
        </div>
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#f6f8f7", fontFamily: "Nunito", position: "relative" }}>
      <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 9999, background: "#d5f2de", display: "flex" }} />
      <div style={{ position: "absolute", right: 80, bottom: 120, display: "flex" }}>
        <Mark size={300} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "70px 64px 0", width: 760 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 34 }}>
          <Mark size={56} tile />
          <span style={{ marginLeft: 16, fontWeight: 800, color: "#1d6a3e" }}>SAHABAT</span>
          <span style={{ marginLeft: 10, fontWeight: 800, color: "#f28c28" }}>ANAK</span>
        </div>
        {opts.kicker && <div style={{ marginTop: 44, fontSize: 28, fontWeight: 800, color: "#d9741a", letterSpacing: 1 }}>{opts.kicker.toUpperCase()}</div>}
        <div style={{ marginTop: opts.kicker ? 8 : 48, fontSize: opts.title.length > 50 ? 54 : 64, fontWeight: 800, lineHeight: 1.1, color: "#123d25" }}>{clamp(opts.title, 100)}</div>
        {opts.subtitle && <div style={{ marginTop: 20, fontSize: 30, color: "#4b5563", lineHeight: 1.35 }}>{clamp(opts.subtitle, 140)}</div>}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, background: "#23824a", display: "flex", alignItems: "center", padding: "0 64px", color: "white", fontSize: 26, fontWeight: 800 }}>
        Tumbuh seimbang bersama keluarga
      </div>
    </div>
  );

  const png = await new ImageResponse(node, { ...OG_SIZE, fonts: await f }).arrayBuffer();
  const jpg = await sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: { "Content-Type": OG_TYPE, "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
