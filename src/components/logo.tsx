import { cn } from "@/lib/utils";

/**
 * Logo SAHABAT ANAK: dua daun dari satu titik tumbuh.
 * Daun besar (putih di latar gelap, marun di latar terang) = orang tua yang menaungi;
 * daun kecil (merah) = anak yang sedang tumbuh. Keduanya berangkat dari satu akar yang sama
 * (keluarga) dan bersama-sama membentuk tunas: pertumbuhan yang dirawat bersama hingga seimbang.
 */
const LEAF_PARENT = "M23.5 38C13.5 35 8 26 10 12c8.5.4 14.5 7 13.5 26z";
const LEAF_CHILD = "M24.6 38c.3-9.5 4.6-15 12.6-15.6.9 8.4-4.4 14.4-12.6 15.6z";
const VEIN_PARENT = "M23 35.5c-2.4-7-5.6-13.8-10.4-19.6";
const VEIN_CHILD = "M26 35.8c2.4-4.6 5.4-8.2 9.4-10.6";

/** Tanda logo. `tile` = ikon aplikasi berlatar marun; tanpa tile = daun berwarna di atas latar terang. */
export type Brand = { logo?: string; tagline?: string };

export function LogoMark({ className, tile = true, src, onDark = false }: { className?: string; tile?: boolean; src?: string; onDark?: boolean }) {
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={cn("h-10 w-10 shrink-0 rounded-xl bg-white object-contain", className)} />
    );
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("h-10 w-10 shrink-0", className)}>
      {tile && <rect width="48" height="48" rx="11" fill="#940000" />}
      <g transform="translate(0 -1)">
        <path d={LEAF_PARENT} fill={tile || onDark ? "#ffffff" : "#940000"} />
        <path d={LEAF_CHILD} fill={tile ? "#ff5a5a" : onDark ? "#ff3d3d" : "#e60000"} />
        <path d={VEIN_PARENT} stroke={tile ? "#940000" : "#ffffff"} strokeOpacity={tile ? 0.35 : 0.45} strokeWidth="1.1" strokeLinecap="round" fill="none" />
        <path d={VEIN_CHILD} stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/** Logo lengkap. Warna kata mengikuti daun: SAHABAT (marun, orang tua) + ANAK (merah, anak). */
export function Logo({ light = false, small = false, brand }: { light?: boolean; small?: boolean; brand?: Brand }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark src={brand?.logo || undefined} tile={!light} onDark={light} className={small ? "h-8 w-8" : "h-10 w-10"} />
      <span className="leading-none">
        <span className={cn("block font-extrabold tracking-[0.18em] whitespace-nowrap", small ? "text-[15px]" : "text-[17px]")}>
          <span className={light ? "text-white" : "text-marun-700"}>SAHABAT</span> <span className={light ? "text-aksen-400" : "text-aksen-500"}>ANAK</span>
        </span>
        {!small && (
          <span className={cn("mt-1 text-[9.5px] font-semibold tracking-[0.22em] whitespace-nowrap uppercase", light ? "hidden text-white/60 sm:block" : "block text-ink-soft")}>
            {brand?.tagline ?? "Tumbuh seimbang bersama keluarga"}
          </span>
        )}
      </span>
    </span>
  );
}
