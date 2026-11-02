import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getEvents } from "@/lib/content";
import { PageHero } from "@/components/site/parts";
import { EventCard } from "@/components/site/event-card";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/kegiatan", "Kegiatan", "Jadwal dan dokumentasi kegiatan pendampingan komunitas.");

export default async function KegiatanPage() {
  const [upcoming, past] = await Promise.all([getEvents({ upcoming: true }), getEvents({ past: true, limit: 30 })]);
  return (
    <>
      <PageHero eyebrow="Kegiatan komunitas" title="Kegiatan Pendampingan" text="Pertemuan, pelatihan, dan permainan bersama untuk keluarga. Anggota dapat mengonfirmasi kehadiran dari aplikasi." />
      <div className="bg-surface">
        <div className="mx-auto max-w-6xl space-y-16 px-4 py-20">
          <EventSection title="Agenda mendatang" items={upcoming} empty="Belum ada agenda mendatang." />
          <EventSection title="Kegiatan sebelumnya" items={past} empty="Belum ada dokumentasi kegiatan." />
        </div>
      </div>
    </>
  );
}

function EventSection({ title, items, empty }: { title: string; items: Awaited<ReturnType<typeof getEvents>>; empty: string }) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-4">
        <h2 className="eyebrow text-marun-600">{title}</h2>
        <span className="h-px flex-1 bg-black/10" />
        <span className="text-sm font-semibold text-ink-soft">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-3xl bg-white p-10 text-center text-ink-soft">{empty}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <EventCard key={e.id} e={e} />
          ))}
        </div>
      )}
    </section>
  );
}
