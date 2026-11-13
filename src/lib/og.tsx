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

import { BRAND_GREEN, BRAND_YELLOW, FULL_VIEWBOX, MARK_GREEN, MARK_VIEWBOX, MARK_YELLOW, TEXT_GREEN, TEXT_YELLOW } from "./logo-paths";

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

function Mark({ size, onDark }: { size: number; onDark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox={MARK_VIEWBOX}>
      <path d={MARK_GREEN} fill={onDark ? "#ffffff" : BRAND_GREEN} />
      <path d={MARK_YELLOW} fill={BRAND_YELLOW} />
    </svg>
  );
}

function FullLogo({ height, onDark }: { height: number; onDark?: boolean }) {
  const [, , w, h] = FULL_VIEWBOX.split(" ").map(Number);
  return (
    <svg width={Math.round((height * w) / h)} height={height} viewBox={FULL_VIEWBOX}>
      <path d={MARK_GREEN + TEXT_GREEN} fill={onDark ? "#ffffff" : BRAND_GREEN} />
      <path d={MARK_YELLOW + TEXT_YELLOW} fill={BRAND_YELLOW} />
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
      <div style={{ position: "absolute", top: 0, left: 0, width: OG_SIZE.width, height: OG_SIZE.height, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(4,40,24,0.6) 55%, rgba(6,38,23,0.97) 100%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column", color: "white" }}>
        {opts.kicker && <div style={{ fontSize: 30, fontWeight: 800, color: BRAND_YELLOW, letterSpacing: 6 }}>{opts.kicker.toUpperCase()}</div>}
        <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.04, marginTop: 10, letterSpacing: -2 }}>{clamp(opts.title, 90)}</div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 26 }}>
          <FullLogo height={58} onDark />
        </div>
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff", fontFamily: "Jakarta", position: "relative", color: "#10231a" }}>
      <div style={{ position: "absolute", right: -180, top: -180, width: 760, height: 760, borderRadius: 9999, display: "flex", background: "#fff4dc" }} />
      <div style={{ position: "absolute", right: 70, top: 130, display: "flex" }}>
        <Mark size={360} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "60px 72px 0", width: 760 }}>
        <div style={{ display: "flex" }}>
          <FullLogo height={74} />
        </div>
        {opts.kicker && <div style={{ marginTop: 52, fontSize: 22, fontWeight: 800, color: "#b06f00", letterSpacing: 6 }}>{opts.kicker.toUpperCase()}</div>}
        <div style={{ marginTop: opts.kicker ? 14 : 58, fontSize: opts.title.length > 50 ? 56 : 68, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2, color: BRAND_GREEN }}>{clamp(opts.title, 100)}</div>
        {opts.subtitle && <div style={{ marginTop: 22, fontSize: 27, color: "#4b5a52", lineHeight: 1.4 }}>{clamp(opts.subtitle, 140)}</div>}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, display: "flex" }}>
        <div style={{ flex: 3, background: BRAND_GREEN, display: "flex" }} />
        <div style={{ flex: 1, background: BRAND_YELLOW, display: "flex" }} />
      </div>
    </div>
  );

  const png = await new ImageResponse(node, { ...OG_SIZE, fonts: await f }).arrayBuffer();
  const jpg = await sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: { "Content-Type": OG_TYPE, "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
