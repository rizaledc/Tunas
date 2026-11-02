import { getArticle } from "@/lib/content";
import { excerpt } from "@/lib/markdown";
import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "Artikel SAHABAT ANAK";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  return shareImage({
    kicker: "Artikel & Tips",
    title: a?.title ?? "Artikel & Tips Digital Parenting",
    subtitle: a ? a.excerpt || excerpt(a.body, 130) : undefined,
    photo: a?.cover,
  });
}
