import { Icon } from "@/components/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/content";
import { formatTanggal } from "@/lib/date";
import { excerpt, renderMarkdown } from "@/lib/markdown";
import { og } from "@/lib/seo";
import { ShareButtons } from "@/components/site/share";
import { DarkMedia, Eyebrow } from "@/components/site/parts";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return { title: "Artikel" };
  const description = a.excerpt || excerpt(a.body);
  const path = `/artikel/${a.slug}`;
  return { title: a.title, description, alternates: { canonical: path }, openGraph: og(path, { type: "article", title: `${a.title} · SAHABAT ANAK`, description, publishedTime: a.published_at ?? undefined }) };
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  return (
    <article>
      <DarkMedia src={a.cover} alt="" priority className="text-white">
        <div className="absolute inset-0 bg-gradient-to-t from-gelap-950 via-gelap-950/75 to-gelap-950/45" />
        <div className="relative mx-auto max-w-4xl px-4 pt-36 pb-16 md:pt-48">
          <Link href="/artikel" className="eyebrow inline-flex items-center gap-2 text-white/60 hover:text-white">
            <Icon name="arrow-left" className="h-4 w-4" /> Semua artikel
          </Link>
          <Eyebrow className="mt-8">{a.published_at ? formatTanggal(a.published_at) : "Artikel"}</Eyebrow>
          <h1 className="display mt-5 text-4xl md:text-6xl">{a.title}</h1>
          {a.excerpt && <p className="mt-6 max-w-2xl text-lg text-white/70">{a.excerpt}</p>}
        </div>
      </DarkMedia>
      <div className="bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="prose-sa text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.body) }} />
          <ShareButtons path={`/artikel/${a.slug}`} title={a.title} />
        </div>
      </div>
    </article>
  );
}
