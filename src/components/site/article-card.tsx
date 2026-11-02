import Link from "next/link";
import { Icon } from "@/components/icons";
import { DarkMedia } from "@/components/site/parts";
import { formatTanggal } from "@/lib/date";
import { excerpt } from "@/lib/markdown";

export function ArticleCard({ a, accent }: { a: { slug: string; title: string; cover: string | null; excerpt: string | null; body: string; published_at: string | null }; accent?: boolean }) {
  return (
    <Link href={`/artikel/${a.slug}`} className={`group flex flex-col overflow-hidden rounded-3xl p-5 transition hover:-translate-y-1 ${accent ? "bg-marun-600 text-white" : "bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase ${accent ? "border-white/30 text-white/80" : "border-black/10 text-ink-soft"}`}>
          {a.published_at ? formatTanggal(a.published_at, { day: "numeric", month: "short", year: "numeric" }) : "Artikel"}
        </span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full transition group-hover:rotate-[-45deg] ${accent ? "bg-white text-marun-700" : "bg-surface text-ink"}`}>
          <Icon name="arrow-right" className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-5 text-xl font-extrabold tracking-tight">{a.title}</p>
      <p className={`mt-2 line-clamp-2 text-sm ${accent ? "text-white/75" : "text-ink-soft"}`}>{a.excerpt || excerpt(a.body)}</p>
      <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl">
        <DarkMedia src={a.cover} alt="" sizes="33vw" className="absolute inset-0 transition duration-700 group-hover:scale-105">
          {!a.cover && <Icon name="bulb" className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-emas-400/70" />}
        </DarkMedia>
      </div>
    </Link>
  );
}
