import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "Galeri Kegiatan";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return shareImage({ title: "Galeri Kegiatan", subtitle: "Foto kegiatan pendampingan anak dan orang tua." });
}
