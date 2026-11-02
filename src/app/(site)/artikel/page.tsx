import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticles } from "@/lib/content";
import { formatTanggal } from "@/lib/date";
import { excerpt } from "@/lib/markdown";
import { Empty, Placeholder } from "@/components/blocks";

export const revalidate = 300;
export const metadata: Metadata = { title: "Artikel & Tips", description: "Tips digital parenting dan kabar Komunitas TUNAS." };

export default async function ArtikelPage() {
  const articles = await getArticles();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-extrabold text-tunas-900">Artikel & Tips</h1>
      {articles.length === 0 ? (
        <Empty icon="📚" title="Belum ada artikel" text="Tips digital parenting akan segera hadir." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/artikel/${a.slug}`} className="card overflow-hidden p-0 hover:ring-2 hover:ring-tunas-200">
              <div className="relative aspect-[16/9]">
                {a.cover ? <Image src={a.cover} alt="" fill sizes="33vw" className="object-cover" /> : <Placeholder label="Tips" icon="💡" className="h-full w-full" />}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-ink-soft">{a.published_at && formatTanggal(a.published_at)}</p>
                <p className="mt-1 font-extrabold">{a.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{a.excerpt || excerpt(a.body)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
