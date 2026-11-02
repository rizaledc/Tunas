import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/privasi", "Kebijakan Privasi", "Bagaimana SAHABAT ANAK menyimpan dan melindungi data keluarga.");

export default async function PrivasiPage() {
  const s = await getSettings(["public.consent", "public.privasi"]);
  const consent = s["public.consent"];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-daun-900">Kebijakan Privasi & Persetujuan Data</h1>
      <p className="mt-2 text-ink-soft">Mengacu pada Undang-Undang Pelindungan Data Pribadi (UU PDP).</p>
      <section className="card prose-sa mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(s["public.privasi"].body) }} />
      <section className="card mt-6">
        <h2 className="text-xl font-extrabold">Teks Persetujuan (versi {consent.version})</h2>
        <p className="mt-3 whitespace-pre-line">{consent.text}</p>
      </section>
    </div>
  );
}
