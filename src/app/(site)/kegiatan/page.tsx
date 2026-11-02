import { Icon } from "@/components/icons";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { getEvents } from "@/lib/content";
import { formatTanggal } from "@/lib/date";
import { Placeholder } from "@/components/blocks";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/kegiatan", "Kegiatan", "Jadwal dan dokumentasi kegiatan pendampingan komunitas.");

export default async function KegiatanPage() {
  const [upcoming, past] = await Promise.all([getEvents({ upcoming: true }), getEvents({ past: true, limit: 30 })]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-daun-900">Kegiatan Pendampingan</h1>
      <h2 className="mt-8 mb-3 text-xl font-extrabold">Agenda Mendatang</h2>
      <EventList items={upcoming} empty="Belum ada agenda mendatang." />
      <h2 className="mt-10 mb-3 text-xl font-extrabold">Kegiatan Sebelumnya</h2>
      <EventList items={past} empty="Belum ada dokumentasi kegiatan." />
    </div>
  );
}

function EventList({ items, empty }: { items: Awaited<ReturnType<typeof getEvents>>; empty: string }) {
  if (!items.length) return <p className="card text-ink-soft">{empty}</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((e) => (
        <Link key={e.id} href={`/kegiatan/${e.slug}`} className="card overflow-hidden p-0 hover:ring-2 hover:ring-daun-200">
          <div className="relative aspect-[16/9]">
            {e.cover_photo ? <Image src={e.cover_photo} alt="" fill sizes="33vw" className="object-cover" /> : <Placeholder label="Kegiatan komunitas" icon="balloon" className="h-full w-full" />}
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-oranye-600">{formatTanggal(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            <p className="font-extrabold">{e.title}</p>
            {e.location && <p className="flex items-center gap-1 text-sm text-ink-soft"><Icon name="pin" className="h-4 w-4" /> {e.location}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
