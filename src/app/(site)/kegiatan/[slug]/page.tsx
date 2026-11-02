import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getPhotos } from "@/lib/content";
import { formatTanggal } from "@/lib/date";
import { GalleryGrid } from "@/components/site/gallery";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEvent((await params).slug);
  return e ? { title: e.title, description: e.description?.slice(0, 150) } : { title: "Kegiatan" };
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) notFound();
  const photos = await getPhotos({ eventId: e.id });
  const upcoming = new Date(e.date) > new Date();
  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/kegiatan" className="text-sm font-bold text-sky-brand">
        ← Semua kegiatan
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold text-tunas-900">{e.title}</h1>
      <p className="mt-2 font-semibold text-oranye-600">
        🗓️ {formatTanggal(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
      </p>
      {e.location && <p className="text-ink-soft">📍 {e.location}</p>}
      {e.cover_photo && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={e.cover_photo} alt={e.title} fill sizes="(min-width:896px) 896px, 100vw" className="object-cover" />
        </div>
      )}
      {e.description && <div className="mt-6 text-lg leading-relaxed whitespace-pre-line">{e.description}</div>}
      {upcoming && (
        <div className="card mt-6 bg-tunas-50">
          <p className="font-bold">Anggota TUNAS bisa konfirmasi kehadiran lewat aplikasi.</p>
          <Link href="/app/kegiatan" className="btn-green mt-2">
            Konfirmasi Hadir
          </Link>
        </div>
      )}
      {photos.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-extrabold">Dokumentasi</h2>
          <GalleryGrid photos={photos} />
        </section>
      )}
    </article>
  );
}
