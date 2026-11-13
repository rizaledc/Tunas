import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getEvents } from "@/lib/content";
import { getSetting } from "@/lib/settings";
import { PageHero } from "@/components/site/parts";
import { EventCard } from "@/components/site/event-card";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/kegiatan", "Kegiatan", "Jadwal dan dokumentasi kegiatan pendampingan komunitas.");

export default async function KegiatanPage() {
  const [upcoming, past, landing] = await Promise.all([getEvents({ upcoming: true }), getEvents({ past: true, limit: 30 }), getSetting("public.landing")]);
  const photos = (landing.events_photos ?? []).map((p) => p.url).filter(Boolean);
  return (
    <>
      <PageHero eyebrow="Kegiatan komunitas" title="Kegiatan Pendampingan" text="Pertemuan, pelatihan, dan permainan bersama untuk keluarga. Anggota dapat mengonfirmasi kehadiran dari aplikasi." />
      <div className="bg-surface">
        <div className="mx-auto max-w-6xl space-y-16 px-4 py-20">
          <EventSection title="Agenda mendatang" items={upcoming} photos={photos} empty="Belum ada agenda mendatang." />
          <EventSection title="Kegiatan sebelumnya" items={past} photos={photos} offset={upcoming.length} empty="Belum ada dokumentasi kegiatan." />
        </div>
      </div>
    </>
  );
}

function EventSection({ title, items, empty, photos, offset = 0 }: { title: string; items: Awaited<ReturnType<typeof getEvents>>; empty: string; photos: string[]; offset?: number }) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-4">
        <h2 className="eyebrow text-hijau-600">{title}</h2>
        <span className="h-px flex-1 bg-ink/10" />
        <span className="text-sm font-semibold text-ink-soft">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-3xl bg-paper p-10 text-center text-ink-soft">{empty}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e, i) => (
            <EventCard key={e.id} e={e} fallbackPhoto={photos.length ? photos[(i + offset) % photos.length] : null} />
          ))}
        </div>
      )}
    </section>
  );
}
