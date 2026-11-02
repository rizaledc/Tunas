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
  { title: "Daun besar putih", text: "Orang tua yang menaungi dan menjaga, memberi ruang aman bagi anak untuk tumbuh. Di latar terang, daun ini berwarna marun." },
  { title: "Daun kecil merah", text: "Anak yang sedang tumbuh: hangat, ceria, dan penuh rasa ingin tahu." },
  { title: "Satu titik tumbuh", text: "Keduanya berangkat dari akar yang sama, yaitu keluarga dan komunitas tempat anak tumbuh." },
  { title: "Bersama membentuk tunas", text: "Dua daun yang tumbuh berdampingan membentuk tunas: awal pertumbuhan yang dirawat bersama hingga seimbang." },
];

export default async function TentangPage() {
  const s = await getSettings(["public.tentang", "public.brand"]);
  const t = s["public.tentang"];
  const brand = s["public.brand"];
  return (
    <>
      <section className="sa-dark-texture relative overflow-hidden text-white">
        <div className="mx-auto max-w-6xl px-4 pt-32 pb-20 md:pt-40">
          <Eyebrow>Tentang program</Eyebrow>
          <Headline as="h1" text={t.title} className="mt-5 text-4xl md:text-7xl" />
          <div className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70 [&_strong]:text-white" dangerouslySetInnerHTML={{ __html: renderMarkdown(t.intro) }} />
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <ArrowLink href="/daftar">Daftar sekarang</ArrowLink>
            <ArrowLink href="/panduan">Panduan pemakaian</ArrowLink>
          </div>
        </div>
      </section>

      {t.image && (
        <div className="bg-gelap-950 px-4 pb-4">
          <div className="relative mx-auto aspect-[21/9] max-w-6xl overflow-hidden rounded-3xl">
            <Image src={t.image} alt={t.title} fill sizes="(min-width:1152px) 1152px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      {t.show_logo && (
        <section className="bg-gelap-950 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-[1fr_1.4fr]">
            <div className="relative flex justify-center">
              <div className="absolute inset-10 rounded-full bg-marun-600/40 blur-3xl" aria-hidden />
              {brand.logo ? <LogoMark src={brand.logo} className="relative h-56 w-56" /> : <LogoMark tile={false} onDark className="relative h-64 w-64" />}
            </div>
            <div>
              <Eyebrow>Identitas</Eyebrow>
              <Headline text="Makna Logo" className="mt-5 text-4xl md:text-5xl" breakLine={false} />
              <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2">
                {MEANING.map((m) => (
                  <div key={m.title} className="bg-gelap-950 p-6">
                    <dt className="eyebrow text-emas-400">{m.title}</dt>
                    <dd className="mt-3 text-sm leading-relaxed text-white/65">{m.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="prose-sa prose-tentang rounded-3xl bg-white p-8 text-lg md:p-14" dangerouslySetInnerHTML={{ __html: renderMarkdown(t.body) }} />
        </div>
      </section>
    </>
  );
}
