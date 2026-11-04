import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { PageHero } from "@/components/site/parts";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/privasi", "Kebijakan Privasi", "Bagaimana SAHABAT ANAK menyimpan dan melindungi data keluarga.");

export default async function PrivasiPage() {
  const s = await getSettings(["public.consent", "public.privasi"]);
  const consent = s["public.consent"];
  return (
    <>
      <PageHero eyebrow="Privasi" title="Kebijakan Privasi & Persetujuan Data" text="Mengacu pada Undang-Undang Pelindungan Data Pribadi (UU PDP)." />
      <div className="bg-surface">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-16">
          <section className="prose-sa rounded-3xl bg-paper p-8 md:p-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(s["public.privasi"].body) }} />
          <section className="rounded-3xl bg-surface p-8 text-ink md:p-10">
            <p className="eyebrow text-hl">Versi {consent.version}</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Teks Persetujuan</h2>
            <p className="mt-4 leading-relaxed whitespace-pre-line text-ink/75">{consent.text}</p>
          </section>
        </div>
      </div>
    </>
  );
}
