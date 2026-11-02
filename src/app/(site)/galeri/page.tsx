import type { Metadata } from "next";
import { getPhotos } from "@/lib/content";
import { GalleryGrid } from "@/components/site/gallery";

export const revalidate = 300;
export const metadata: Metadata = { title: "Galeri", description: "Foto kegiatan pendampingan anak dan orang tua." };

export default async function GaleriPage() {
  const photos = await getPhotos();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-daun-900">Galeri Kegiatan</h1>
      <p className="mt-2 mb-6 text-ink-soft">Foto hanya ditampilkan jika orang tua sudah memberi izin publikasi.</p>
      {photos.length ? <GalleryGrid photos={photos} /> : <p className="card text-center text-ink-soft">Belum ada foto yang dipublikasikan.</p>}
    </div>
  );
}
