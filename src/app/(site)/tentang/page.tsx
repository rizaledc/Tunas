import type { Metadata } from "next";
import Image from "next/image";
import { pageMeta } from "@/lib/seo";
import { LogoMark } from "@/components/logo";
import { getSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { ArrowLink, Eyebrow, Headline } from "@/components/site/parts";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/tentang", "Tentang Program", "Latar belakang, makna logo, dan alur program SAHABAT ANAK.");

const MEANING = [
  { title: "Sosok hijau yang merangkul", text: "Orang tua yang hadir mendampingi dan menjaga, bukan mengawasi dari jauh." },
  { title: "Sosok kuning yang bersorak", text: "Anak yang ceria, aktif, dan percaya diri, tumbuh di dunia nyata maupun digital." },
  { title: "Bintang di atasnya", text: "Harapan dan cita-cita anak: masa depan cerah yang dituju bersama keluarga." },
  { title: "Hijau dan kuning", text: "Hijau melambangkan tumbuh dan seimbang; kuning melambangkan keceriaan dan semangat." },
];

export default async function TentangPage() {
  const s = await getSettings(["public.tentang", "public.brand"]);
  const t = s["public.tentang"];
  const brand = s["public.brand"];
  return (
    <>
      <section className="sa-texture relative overflow-hidden text-ink">
        <div className="mx-auto max-w-6xl px-4 pt-32 pb-20 md:pt-40">
          <Eyebrow>Tentang program</Eyebrow>
          <Headline as="h1" text={t.title} className="mt-5 text-4xl md:text-7xl" />
          <div className="mt-8 max-w-2xl text-lg leading-relaxed text-ink/70 [&_strong]:text-ink" dangerouslySetInnerHTML={{ __html: renderMarkdown(t.intro) }} />
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <ArrowLink href="/daftar">Daftar sekarang</ArrowLink>
            <ArrowLink href="/panduan">Panduan pemakaian</ArrowLink>
          </div>
        </div>
      </section>

      {t.image && (
        <div className="bg-surface px-4 pb-4">
          <div className="relative mx-auto aspect-[21/9] max-w-6xl overflow-hidden rounded-3xl">
            <Image src={t.image} alt={t.title} fill sizes="(min-width:1152px) 1152px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      {t.show_logo && (
        <section className="bg-surface text-ink">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-[1fr_1.4fr]">
            <div className="relative flex justify-center">
              <div className="absolute inset-10 rounded-full bg-kuning-200/70 blur-3xl" aria-hidden />
              {brand.logo ? <LogoMark src={brand.logo} className="relative h-56 w-56" /> : <LogoMark auto className="relative h-64 w-64" />}
            </div>
            <div>
              <Eyebrow>Identitas</Eyebrow>
              <Headline text="Makna Logo" className="mt-5 text-4xl md:text-5xl" breakLine={false} />
              <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-ink/10 sm:grid-cols-2">
                {MEANING.map((m) => (
                  <div key={m.title} className="bg-surface p-6">
                    <dt className="eyebrow text-gold">{m.title}</dt>
                    <dd className="mt-3 text-sm leading-relaxed text-ink/65">{m.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="prose-sa prose-tentang rounded-3xl bg-paper p-8 text-lg md:p-14" dangerouslySetInnerHTML={{ __html: renderMarkdown(t.body) }} />
        </div>
      </section>
    </>
  );
}
