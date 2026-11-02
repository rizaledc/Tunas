import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getPhotos } from "@/lib/content";
import { GalleryGrid } from "@/components/site/gallery";
import { PageHero } from "@/components/site/parts";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/galeri", "Galeri", "Foto kegiatan pendampingan anak dan orang tua.");

export default async function GaleriPage() {
  const photos = await getPhotos();
  return (
    <>
      <PageHero eyebrow="Dokumentasi" title="Galeri Kegiatan" text="Foto hanya ditampilkan jika orang tua sudah memberi izin publikasi." />
      <div className="bg-gelap-950 text-white">
        <div className="mx-auto max-w-6xl px-4 pt-4 pb-24">
          {photos.length ? <GalleryGrid photos={photos} dark /> : <p className="rounded-3xl border border-white/10 p-12 text-center text-white/55">Belum ada foto yang dipublikasikan.</p>}
        </div>
      </div>
    </>
  );
}
