import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Icon } from "@/components/icons";
import { getArticles } from "@/lib/content";
import { PageHero } from "@/components/site/parts";
import { ArticleCard } from "@/components/site/article-card";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/artikel", "Artikel & Tips", "Tips digital parenting dan kabar seputar pendampingan anak.");

export default async function ArtikelPage() {
  const articles = await getArticles();
  return (
    <>
      <PageHero eyebrow="Bacaan keluarga" title="Artikel & Tips" text="Tips digital parenting yang ringan, praktis, dan bisa langsung dicoba di rumah." />
      <div className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          {articles.length === 0 ? (
            <div className="rounded-3xl bg-paper p-12 text-center">
              <Icon name="book-open" className="mx-auto h-10 w-10 text-hijau-600" />
              <p className="mt-3 text-lg font-bold">Belum ada artikel</p>
              <p className="text-ink-soft">Tips digital parenting akan segera hadir.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {articles.map((a, i) => (
                <ArticleCard key={a.id} a={a} accent={i % 4 === 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
