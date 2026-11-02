import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";
import { getArticles, getEvents } from "@/lib/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const [events, articles] = await Promise.all([getEvents(), getArticles()]);
  const pages = ["", "/tentang", "/kegiatan", "/galeri", "/artikel", "/panduan", "/daftar", "/privasi"].map((p) => ({ url: `${base}${p}` }));
  return [
    ...pages,
    ...events.map((e) => ({ url: `${base}/kegiatan/${e.slug}` })),
    ...articles.map((a) => ({ url: `${base}/artikel/${a.slug}`, lastModified: a.published_at ?? undefined })),
  ];
}
