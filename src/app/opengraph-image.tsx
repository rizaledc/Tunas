import { getSettings } from "@/lib/settings";
import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "SAHABAT ANAK: dampingi aktivitas anak, seimbangkan dunia digitalnya";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const revalidate = 3600;

export default async function Image() {
  const s = await getSettings(["public.hero", "public.share"]);
  return shareImage({
    title: s["public.hero"].title,
    subtitle: s["public.share"].description || "Catat aktivitas digital dan non-digital anak, lihat keseimbangannya, dan dapatkan saran pendampingan.",
    fullPhoto: s["public.share"].image || null,
  });
}
