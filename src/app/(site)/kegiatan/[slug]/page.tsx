import { Icon } from "@/components/icons";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getPhotos } from "@/lib/content";
import { formatTanggal } from "@/lib/date";
import { GalleryGrid } from "@/components/site/gallery";
import { og } from "@/lib/seo";
import { ShareButtons } from "@/components/site/share";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEvent((await params).slug);
  if (!e) return { title: "Kegiatan" };
  const description = `${formatTanggal(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${e.location ? ` · ${e.location}` : ""}${e.description ? ` — ${e.description.slice(0, 120)}` : ""}`;
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
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/kegiatan" className="inline-flex items-center gap-1 text-sm font-bold text-sky-brand">
        <Icon name="arrow-left" className="h-4 w-4" /> Semua kegiatan
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold text-daun-900">{e.title}</h1>
      <p className="mt-2 flex items-center gap-2 font-semibold text-oranye-600">
        <Icon name="calendar" className="h-5 w-5" /> {formatTanggal(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
      </p>
      {e.location && <p className="flex items-center gap-2 text-ink-soft"><Icon name="pin" className="h-5 w-5" /> {e.location}</p>}
      {e.cover_photo && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={e.cover_photo} alt={e.title} fill sizes="(min-width:896px) 896px, 100vw" className="object-cover" />
        </div>
      )}
      {e.description && <div className="mt-6 text-lg leading-relaxed whitespace-pre-line">{e.description}</div>}
      {upcoming && (
        <div className="card mt-6 bg-daun-50">
          <p className="font-bold">Anggota bisa konfirmasi kehadiran lewat aplikasi.</p>
          <Link href="/app/kegiatan" className="btn-green mt-2">
            Konfirmasi Hadir
          </Link>
        </div>
      )}
      <ShareButtons path={`/kegiatan/${e.slug}`} title={e.title} />
      {photos.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-extrabold">Dokumentasi</h2>
          <GalleryGrid photos={photos} />
        </section>
      )}
    </article>
  );
}
