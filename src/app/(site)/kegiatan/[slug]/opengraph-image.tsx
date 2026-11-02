import { getEvent } from "@/lib/content";
import { formatTanggal } from "@/lib/date";
import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "Kegiatan SAHABAT ANAK";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEvent((await params).slug);
  return shareImage({
    kicker: e ? formatTanggal(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Kegiatan",
    title: e?.title ?? "Kegiatan Pendampingan",
    subtitle: e?.location ? `Lokasi: ${e.location}` : undefined,
    photo: e?.cover_photo,
  });
}
