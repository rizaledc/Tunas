import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cn("h-10 w-10 shrink-0", className)}>
      <rect width="512" height="512" rx="112" fill="#23824a" />
      <path d="M256 404c-8 0-14-6-14-14V262c0-8 6-14 14-14s14 6 14 14v128c0 8-6 14-14 14z" fill="#fff" />
      <path d="M250 262c-70 4-124-34-132-108 74-8 128 30 132 108z" fill="#ade4c0" />
      <path d="M262 236c6-84 64-128 144-122-4 82-62 128-144 122z" fill="#fff" />
      <path d="M176 404h160" stroke="#f28c28" strokeWidth="28" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className={small ? "h-8 w-8" : undefined} />
      <span className="leading-tight">
        <span className={cn("block font-extrabold tracking-wide", small ? "text-base" : "text-lg", light ? "text-white" : "text-tunas-700")}>
          SAHABAT ANAK
        </span>
        {!small && (
          <span className={cn("block text-[11px] font-semibold", light ? "text-white/80" : "text-ink-soft")}>
            bersama Komunitas TUNAS
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
