import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { getEvent, getPhotos } from "@/lib/content";
import { formatTanggal } from "@/lib/date";
import { GalleryGrid } from "@/components/site/gallery";
import { og } from "@/lib/seo";
import { ShareButtons } from "@/components/site/share";
import { DarkMedia, Eyebrow } from "@/components/site/parts";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEvent((await params).slug);
  if (!e) return { title: "Kegiatan" };
  const description = `${formatTanggal(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${e.location ? ` · ${e.location}` : ""}${e.description ? `. ${e.description.slice(0, 120)}` : ""}`;
  const path = `/kegiatan/${e.slug}`;
  return { title: e.title, description, alternates: { canonical: path }, openGraph: og(path, { title: `${e.title} · SAHABAT ANAK`, description }) };
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) notFound();
  const photos = await getPhotos({ eventId: e.id });
  const upcoming = new Date(e.date) > new Date();
  return (
    <article>
      <DarkMedia src={e.cover_photo} alt={e.title} priority className="text-ink">
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/40" />
        <div className="relative mx-auto max-w-6xl px-4 pt-36 pb-16 md:pt-48">
          <Link href="/kegiatan" className="eyebrow inline-flex items-center gap-2 text-ink/60 hover:text-ink">
            <Icon name="arrow-left" className="h-4 w-4" /> Semua kegiatan
          </Link>
          <Eyebrow className="mt-8">{upcoming ? "Agenda mendatang" : "Kegiatan"}</Eyebrow>
          <h1 className="display mt-5 max-w-4xl text-4xl md:text-6xl">{e.title}</h1>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-2 rounded-full border border-ink/20 bg-ink/5 px-4 py-2 backdrop-blur">
              <Icon name="calendar" className="h-4 w-4 text-hl" /> {formatTanggal(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-ink/20 bg-ink/5 px-4 py-2 backdrop-blur">
              <Icon name="clock" className="h-4 w-4 text-hl" /> {formatTanggal(e.date, { hour: "2-digit", minute: "2-digit" })} WIB
            </span>
            {e.location && (
              <span className="flex items-center gap-2 rounded-full border border-ink/20 bg-ink/5 px-4 py-2 backdrop-blur">
                <Icon name="pin" className="h-4 w-4 text-hl" /> {e.location}
              </span>
            )}
          </div>
        </div>
      </DarkMedia>
      <div className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {e.description ? <div className="text-lg leading-relaxed whitespace-pre-line text-ink">{e.description}</div> : <p className="text-ink-soft">Keterangan kegiatan akan segera dilengkapi.</p>}
            <ShareButtons path={`/kegiatan/${e.slug}`} title={e.title} />
          </div>
          {upcoming && (
            <aside className="h-fit rounded-3xl bg-surface p-7 text-ink">
              <p className="eyebrow text-hl">Untuk anggota</p>
              <p className="mt-3 text-xl font-extrabold tracking-tight">Konfirmasi kehadiran lewat aplikasi.</p>
              <Link href="/app/kegiatan" className="btn-primary mt-6 w-full">
                Konfirmasi Hadir <Icon name="arrow-right" className="h-5 w-5" />
              </Link>
            </aside>
          )}
        </div>
        {photos.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-20">
            <h2 className="eyebrow mb-6 text-marun-600">Dokumentasi</h2>
            <GalleryGrid photos={photos} />
          </section>
        )}
      </div>
    </article>
  );
}
