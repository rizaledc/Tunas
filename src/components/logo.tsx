import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Logo SAHABAT ANAK — dua daun dari satu titik tumbuh.
 * Daun besar (hijau) = orang tua yang menaungi; daun kecil (oranye) = anak yang sedang tumbuh.
 * Keduanya berangkat dari satu akar yang sama (keluarga) dan bersama-sama membentuk tanda ✓:
 * keseimbangan yang dicapai berdua, bukan diperintahkan.
 */
const LEAF_PARENT = "M23.5 38C13.5 35 8 26 10 12c8.5.4 14.5 7 13.5 26z";
const LEAF_CHILD = "M24.6 38c.3-9.5 4.6-15 12.6-15.6.9 8.4-4.4 14.4-12.6 15.6z";
const VEIN_PARENT = "M23 35.5c-2.4-7-5.6-13.8-10.4-19.6";
const VEIN_CHILD = "M26 35.8c2.4-4.6 5.4-8.2 9.4-10.6";

/** Tanda logo. `tile` = ikon aplikasi berlatar hijau; tanpa tile = daun berwarna di atas latar terang. */
export function LogoMark({ className, tile = true }: { className?: string; tile?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("h-10 w-10 shrink-0", className)}>
      {tile && <rect width="48" height="48" rx="11" fill="#23824a" />}
      <g transform="translate(0 -1)">
        <path d={LEAF_PARENT} fill={tile ? "#ffffff" : "#23824a"} />
        <path d={LEAF_CHILD} fill={tile ? "#ffa94d" : "#f28c28"} />
        <path d={VEIN_PARENT} stroke={tile ? "#23824a" : "#ffffff"} strokeOpacity={tile ? 0.35 : 0.45} strokeWidth="1.1" strokeLinecap="round" fill="none" />
        <path d={VEIN_CHILD} stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/** Logo lengkap. Warna kata mengikuti daun: SAHABAT (hijau, orang tua) + ANAK (oranye, anak). */
export function Logo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark tile={light} className={small ? "h-8 w-8" : light ? "h-10 w-10" : "h-11 w-11"} />
      <span className="leading-tight">
        <span className={cn("block font-extrabold tracking-wide", small ? "text-base" : "text-lg")}>
          <span className={light ? "text-white" : "text-tunas-700"}>SAHABAT</span> <span className={light ? "text-oranye-400" : "text-oranye-500"}>ANAK</span>
        </span>
        {!small && (
          <span className={cn("block text-[11px] font-semibold", light ? "text-white/80" : "text-ink-soft")}>
            Tumbuh seimbang bersama keluarga
          </span>
        )}
      </span>
    </span>
  );
}

/** Lencana teks TUNAS (ganti dengan logo resmi lewat /public bila sudah tersedia). */
export function TunasBadge({ light = false }: { light?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-extrabold",
        light ? "border-white/40 text-white" : "border-tunas-200 text-tunas-700",
      )}
      title="Komunitas TUNAS (Tunggu Anak Siap)"
    >
      <Icon name="sprout" className="h-4 w-4" /> TUNAS
    </span>
  );
}
