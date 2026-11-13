import { cn } from "@/lib/utils";
import { BRAND_GREEN, BRAND_YELLOW, FULL_VIEWBOX, MARK_GREEN, MARK_VIEWBOX, MARK_YELLOW, TEXT_GREEN, TEXT_YELLOW } from "@/lib/logo-paths";

/**
 * Logo SAHABAT ANAK: sosok orang tua (hijau) yang merangkul anak (kuning) yang bersorak,
 * dengan bintang harapan di atasnya. Teks SAHABAT hijau, ANAK kuning.
 */
export type Brand = { logo?: string; tagline?: string };

/**
 * Tanda logo (tanpa teks).
 * - bawaan: hijau + kuning di latar terang
 * - `tile`: ikon aplikasi (kotak putih bersudut membulat)
 * - `onDark`: sosok hijau menjadi putih, untuk latar hijau tua / foto
 */
export function LogoMark({ className, tile = false, src, onDark = false }: { className?: string; tile?: boolean; src?: string; onDark?: boolean; auto?: boolean }) {
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={cn("h-10 w-10 shrink-0 rounded-xl bg-white object-contain", className)} />
    );
  const [x, y, s] = MARK_VIEWBOX.split(" ").map(Number);
  return (
    <svg viewBox={MARK_VIEWBOX} aria-hidden className={cn("h-10 w-10 shrink-0", className)}>
      {tile && <rect x={x - s * 0.1} y={y - s * 0.1} width={s * 1.2} height={s * 1.2} rx={s * 0.26} fill="#ffffff" />}
      <path d={MARK_GREEN} fill={onDark ? "#ffffff" : BRAND_GREEN} />
      <path d={MARK_YELLOW} fill={BRAND_YELLOW} />
    </svg>
  );
}

/** Logo lengkap (tanda + tulisan SAHABAT ANAK seperti file resmi). `light` = versi untuk latar gelap. */
export function Logo({ light = false, small = false, brand, className }: { light?: boolean; auto?: boolean; small?: boolean; brand?: Brand; className?: string }) {
  if (brand?.logo)
    return (
      <span className={cn("flex items-center gap-2.5", className)}>
        <LogoMark src={brand.logo} className={small ? "h-8 w-8" : "h-10 w-10"} />
        <span className={cn("font-display text-lg leading-none font-bold", light ? "text-white" : "text-hijau-800")}>
          SAHABAT <span className="text-kuning-500">ANAK</span>
        </span>
      </span>
    );
  return (
    <svg viewBox={FULL_VIEWBOX} role="img" aria-label="SAHABAT ANAK" className={cn("w-auto shrink-0", small ? "h-9" : "h-11", className)}>
      <path d={MARK_GREEN + TEXT_GREEN} fill={light ? "#ffffff" : BRAND_GREEN} />
      <path d={MARK_YELLOW + TEXT_YELLOW} fill={BRAND_YELLOW} />
    </svg>
  );
}
