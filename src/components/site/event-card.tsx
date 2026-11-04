import Link from "next/link";
import { Icon } from "@/components/icons";
import { DarkMedia } from "@/components/site/parts";
import { formatTanggal } from "@/lib/date";
import type { EventRow } from "@/lib/content";

/** Kartu kegiatan bergaya editorial (foto penuh + judul di atas gradasi gelap). */
export function EventCard({ e, tall = false }: { e: EventRow; tall?: boolean }) {
  return (
    <Link href={`/kegiatan/${e.slug}`} className={`theme-dark group relative block overflow-hidden rounded-3xl text-ink ${tall ? "aspect-[4/5]" : "aspect-[5/4]"}`}>
      <DarkMedia src={e.cover_photo} alt={e.title} sizes="(min-width:1024px) 33vw, 100vw" className="absolute inset-0 transition duration-700 group-hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/35 to-transparent" />
      </DarkMedia>
      <span className="absolute top-5 left-5 rounded-full border border-ink/20 bg-surface/50 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur">
        {formatTanggal(e.date, { day: "numeric", month: "short", year: "numeric" })}
      </span>
      <span className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-aksen-500 text-white transition group-hover:rotate-[-45deg]">
        <Icon name="arrow-right" className="h-4 w-4" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="display text-2xl">{e.title}</p>
        {e.location && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/65">
            <Icon name="pin" className="h-4 w-4 text-hl" /> {e.location}
          </p>
        )}
      </div>
    </Link>
  );
}
