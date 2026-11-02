import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";

export const revalidate = 300;
export const metadata: Metadata = { title: "Panduan", description: "Cara memakai SAHABAT ANAK dan unduhan modul PDF." };

export default async function PanduanPage() {
  const p = await getSetting("public.panduan");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-tunas-900">Panduan Pemakaian</h1>
      <div className="prose-sa mt-6 text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
      <div className="card mt-8 flex flex-col gap-3 bg-tunas-50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-extrabold">📘 {p.module_name}</p>
          <p className="text-sm text-ink-soft">Modul pendamping program untuk dibaca dan dicetak.</p>
        </div>
        {p.module_url ? (
          <a href={p.module_url} className="btn-primary" download target="_blank" rel="noopener noreferrer">
            Unduh PDF
          </a>
        ) : (
          <span className="text-sm font-semibold text-ink-soft">Modul segera tersedia</span>
        )}
      </div>
    </div>
  );
}
