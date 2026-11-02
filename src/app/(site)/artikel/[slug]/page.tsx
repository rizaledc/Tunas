import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/content";
import { formatTanggal } from "@/lib/date";
import { excerpt, renderMarkdown } from "@/lib/markdown";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  return a ? { title: a.title, description: a.excerpt || excerpt(a.body) } : { title: "Artikel" };
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/artikel" className="text-sm font-bold text-sky-brand">
        ← Semua artikel
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold text-tunas-900">{a.title}</h1>
      {a.published_at && <p className="mt-1 text-sm text-ink-soft">{formatTanggal(a.published_at)}</p>}
      {a.cover && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={a.cover} alt="" fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="prose-sa mt-6 text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.body) }} />
    </article>
  );
}
