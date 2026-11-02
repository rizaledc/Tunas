import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "Kegiatan Pendampingan";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return shareImage({ title: "Kegiatan Pendampingan", subtitle: "Jadwal dan dokumentasi kegiatan komunitas." });
}
