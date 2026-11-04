import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Icon } from "@/components/icons";
import { getSetting } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { PageHero } from "@/components/site/parts";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/panduan", "Panduan", "Cara memakai SAHABAT ANAK dan unduhan modul PDF.");

export default async function PanduanPage() {
  const p = await getSetting("public.panduan");
  return (
    <>
      <PageHero eyebrow="Panduan" title="Panduan Pemakaian" text="Langkah demi langkah memakai SAHABAT ANAK, dari mendaftar sampai membaca insight mingguan." />
      <div className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.7fr_1fr]">
          <div className="prose-sa rounded-3xl bg-paper p-8 text-lg md:p-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
          <aside className="h-fit rounded-3xl bg-surface p-7 text-ink lg:sticky lg:top-28">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emas-400/30 bg-emas-400/10 text-gold">
              <Icon name="book" className="h-6 w-6" />
            </span>
            <p className="mt-5 text-xl font-extrabold tracking-tight">{p.module_name}</p>
            <p className="mt-2 text-sm text-ink/60">Modul pendamping program untuk dibaca dan dicetak.</p>
            {p.module_url ? (
              <a href={p.module_url} className="btn-primary mt-6 w-full" download target="_blank" rel="noopener noreferrer">
                <Icon name="download" className="h-5 w-5" /> Unduh PDF
              </a>
            ) : (
              <p className="eyebrow mt-6 text-ink/60">Modul segera tersedia</p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
