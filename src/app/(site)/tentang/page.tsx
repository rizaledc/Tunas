import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { LogoMark } from "@/components/logo";
import { getSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/tentang", "Tentang Program", "Latar belakang, makna logo, dan alur program SAHABAT ANAK.");

export default async function TentangPage() {
  const s = await getSettings(["public.tentang", "public.brand"]);
  const t = s["public.tentang"];
  const brand = s["public.brand"];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-daun-900">{t.title}</h1>
      <div className="prose-sa mt-3 text-lg text-ink-soft" dangerouslySetInnerHTML={{ __html: renderMarkdown(t.intro) }} />

      {t.image && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={t.image} alt={t.title} fill sizes="(min-width:896px) 896px, 100vw" className="object-cover" />
        </div>
      )}

      {t.show_logo && (
        <section className="card mt-8 grid items-center gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center gap-4">
            {brand.logo ? (
              <LogoMark src={brand.logo} className="h-28 w-28" />
            ) : (
              <>
                <LogoMark tile={false} className="h-28 w-28" />
                <LogoMark className="h-28 w-28" />
              </>
            )}
          </div>
          <div>
            <h2 className="text-xl font-extrabold">Makna Logo</h2>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li>
                <strong className="text-daun-700">Daun besar hijau</strong> — orang tua yang menaungi, sekaligus dunia nyata dan alam tempat anak bermain.
              </li>
              <li>
                <strong className="text-oranye-600">Daun kecil oranye</strong> — anak yang sedang tumbuh: hangat, ceria, dan penuh rasa ingin tahu.
              </li>
              <li>
                <strong className="text-ink">Satu titik tumbuh</strong> — keduanya berangkat dari akar yang sama, yaitu keluarga dan komunitas tempat anak tumbuh.
              </li>
              <li>
                <strong className="text-ink">Membentuk tanda ✓</strong> — keseimbangan digital yang dicapai berdua dan disepakati bersama, bukan diperintahkan.
              </li>
            </ul>
          </div>
        </section>
      )}

      <div className="prose-sa mt-8 text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(t.body) }} />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/daftar" className="btn-primary">
          Daftar Sekarang
        </Link>
        <Link href="/panduan" className="btn-outline">
          Panduan Pemakaian
        </Link>
      </div>
    </div>
  );
}
