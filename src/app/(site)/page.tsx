import Image from "next/image";
import Link from "next/link";
import { CategoryIcon, Icon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { getArticles, getEvents, getPhotos, countActiveFamilies } from "@/lib/content";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import { formatTanggal } from "@/lib/date";
import { GalleryGrid } from "@/components/site/gallery";
import { PhoneMockup } from "@/components/site/phone-mockup";
import { ArrowLink, DarkMedia, Eyebrow, Headline, splitHighlight } from "@/components/site/parts";
import { ArticleCard } from "@/components/site/article-card";

export const revalidate = 300;

export default async function LandingPage() {
  const [settings, featured, upcoming, photos, articles, families] = await Promise.all([
    getSettings(["public.hero", "public.stats", "public.contact", "public.landing", "public.brand"]),
    getEvents({ featured: true, limit: 3 }),
    getEvents({ upcoming: true, limit: 3 }),
    getPhotos({ limit: 12 }),
    getArticles(3),
    countActiveFamilies(),
  ]);
  const hero = settings["public.hero"];
  const stats = settings["public.stats"];
  const contact = settings["public.contact"];
  const brand = settings["public.brand"];
  const L = settings["public.landing"];
  const show = { ...DEFAULT_SETTINGS["public.landing"].show, ...(L.show ?? {}) };
  const features = L.features.filter((f) => f.title);
  const [heroA, heroB] = splitHighlight(hero.title);
  const heroLines = heroA ? [heroA] : [];
  const marquee = [brand.tagline, ...features.map((f) => f.title)].filter(Boolean);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-gelap-950 text-white">
        <DarkMedia src={hero.image} alt="Kegiatan anak bersama keluarga" priority className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-gelap-950 via-gelap-950/80 to-gelap-950/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-gelap-950 via-transparent to-gelap-950/60" />
        </DarkMedia>
        {!hero.image && <LogoMark tile={false} onDark className="pointer-events-none absolute right-[-9rem] bottom-[-7rem] -z-10 h-[30rem] w-[30rem] opacity-[0.09] md:right-[-6rem] md:bottom-[-9rem] md:h-[42rem] md:w-[42rem]" />}

        <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pt-32 pb-28">
          <Eyebrow>{L.badge}</Eyebrow>
          <h1 className="display mt-6 max-w-4xl text-[2.9rem] sm:text-6xl md:text-7xl lg:text-[5.6rem]">
            {heroLines.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
            <span className="block text-aksen-400">{heroB}</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-white/70 md:text-lg">{hero.subtitle}</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <ArrowLink href="/daftar">{L.cta_primary}</ArrowLink>
            <Link href="/tentang" className="btn-ghost-light btn-sm px-5 text-xs tracking-[0.2em] uppercase">
              {L.cta_secondary}
            </Link>
          </div>
        </div>

        {/* Label vertikal kanan */}
        {features.length > 0 && (
          <ul className="absolute top-1/3 right-6 hidden space-y-3 text-right lg:block xl:right-[max(1.5rem,calc((100vw-72rem)/2))]">
            {features.slice(0, 3).map((f) => (
              <li key={f.title} className="eyebrow text-white/50">
                {f.title}
              </li>
            ))}
            <li aria-hidden className="ml-auto h-px w-10 bg-aksen-400" />
          </ul>
        )}

        {/* Kartu angka melayang */}
        {show.stats && (
          <div className="absolute right-4 bottom-8 hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl md:block xl:right-[max(1rem,calc((100vw-72rem)/2))]">
            <p className="eyebrow text-white/50">{L.stats_label}</p>
            <div className="mt-3 flex items-end gap-8">
              <p className="display text-5xl text-white">{families ?? 0}</p>
              {stats[0] && (
                <div className="border-l border-white/15 pl-6">
                  <p className="display text-3xl text-aksen-400">{stats[0].after}</p>
                  <p className="mt-1 max-w-[9rem] text-[11px] leading-snug text-white/60">{stats[0].label}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* PITA BERJALAN */}
      {marquee.length > 0 && (
        <div className="overflow-hidden border-y border-white/10 bg-marun-700 py-4 text-white" aria-hidden>
          <div className="sa-marquee flex w-max gap-10 whitespace-nowrap">
            {[...marquee, ...marquee, ...marquee, ...marquee].map((t, i) => (
              <span key={i} className="eyebrow flex items-center gap-10 text-[13px] text-white/90">
                {t}
                <Icon name="star-solid" className="h-3 w-3 text-emas-400" />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ANGKA CAPAIAN */}
      {show.stats && stats.length > 0 && (
        <section className="bg-gelap-950 text-white" aria-label="Angka capaian program">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-gelap-950 px-4 py-10 md:px-8">
                <p className="display text-4xl md:text-5xl">
                  {s.before && <span className="mr-2 align-middle text-lg font-semibold text-white/35 line-through">{s.before}</span>}
                  <span className="text-white">{s.after}</span>
                </p>
                <p className="mt-3 max-w-[14rem] text-sm text-white/55">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FITUR */}
      {show.features && features.length > 0 && (
        <section className="sa-dark-texture text-white">
          <div className="mx-auto grid max-w-6xl gap-14 px-4 py-24 lg:grid-cols-[0.9fr_1.6fr] lg:items-center">
            <div>
              <Eyebrow>Mengapa SAHABAT ANAK</Eyebrow>
              <Headline text={L.features_title} className="mt-5 text-5xl md:text-6xl" />
              <p className="mt-6 max-w-sm text-white/65">{L.features_text}</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="group bg-gelap-950/90 p-7 transition hover:bg-marun-900/60">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emas-400/30 bg-emas-400/10 text-emas-400 transition group-hover:border-aksen-400 group-hover:text-aksen-400">
                    <CategoryIcon icon={f.icon} className="h-6 w-6" />
                  </span>
                  <p className="eyebrow mt-6 text-white">{f.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KEGIATAN */}
      {show.events && (
        <section className="bg-gelap-950 py-24 text-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow>Kegiatan komunitas</Eyebrow>
                <Headline text={L.events_title} className="mt-5 text-4xl md:text-6xl" />
              </div>
              <ArrowLink href="/kegiatan">Semua kegiatan</ArrowLink>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="grid gap-6 sm:grid-cols-2">
                {featured.length === 0 && (
                  <div className="sa-dark-texture flex aspect-[4/5] flex-col justify-end rounded-3xl border border-white/10 p-7 sm:col-span-2 sm:aspect-[16/9]">
                    <p className="eyebrow text-aksen-400">Segera hadir</p>
                    <p className="display mt-3 text-3xl">Kegiatan unggulan akan tampil di sini</p>
                  </div>
                )}
                {featured.slice(0, 2).map((e, i) => (
                  <Link key={e.id} href={`/kegiatan/${e.slug}`} className={`group relative block overflow-hidden rounded-3xl border border-white/10 ${featured.length === 1 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/5]"} ${i === 1 ? "sm:mt-12" : ""}`}>
                    <DarkMedia src={e.cover_photo} alt={e.title} sizes="(min-width:1024px) 30vw, 100vw" className="absolute inset-0 transition duration-700 group-hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-t from-gelap-950 via-gelap-950/30 to-transparent" />
                    </DarkMedia>
                    <span className="absolute top-5 left-5 rounded-full border border-white/20 bg-gelap-950/50 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur">
                      {formatTanggal(e.date, { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-aksen-500 text-white transition group-hover:rotate-[-45deg]">
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="display text-2xl md:text-3xl">{e.title}</p>
                      {e.location && <p className="mt-2 flex items-center gap-1.5 text-sm text-white/60"><Icon name="pin" className="h-4 w-4 text-aksen-400" /> {e.location}</p>}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="eyebrow text-white/50">{L.agenda_title}</p>
                {upcoming.length === 0 ? (
                  <p className="mt-6 text-white/60">Agenda berikutnya akan segera diumumkan.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-white/10">
                    {upcoming.map((e) => (
                      <li key={e.id}>
                        <Link href={`/kegiatan/${e.slug}`} className="group flex items-center gap-5 py-5">
                          <span className="flex w-16 shrink-0 flex-col items-center rounded-2xl bg-marun-600 py-3">
                            <span className="display text-2xl">{formatTanggal(e.date, { day: "numeric" })}</span>
                            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80">{formatTanggal(e.date, { month: "short" })}</span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold group-hover:text-aksen-400">{e.title}</span>
                            <span className="mt-1 block text-sm text-white/55">
                              {formatTanggal(e.date, { hour: "2-digit", minute: "2-digit" })} WIB{e.location ? ` · ${e.location}` : ""}
                            </span>
                          </span>
                          <Icon name="chevron-right" className="h-5 w-5 text-white/40 group-hover:text-aksen-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CARA KERJA */}
      {show.steps && (
        <section className="relative overflow-hidden bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 py-24 md:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow light={false}>Mulai dalam {L.steps.filter((s) => s.title).length} langkah</Eyebrow>
              <Headline text={L.steps_title} light={false} className="mt-5 text-5xl md:text-6xl" />
              <ol className="mt-12 space-y-0 border-t border-black/10">
                {L.steps.filter((s) => s.title).map((st, i) => (
                  <li key={i} className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-black/10 py-7">
                    <span className="display text-4xl text-marun-600">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block text-xl font-extrabold tracking-tight">{st.title}</span>
                      <span className="mt-1.5 block text-ink-soft">{st.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <ArrowLink href="/panduan" light={false} className="mt-10">
                Lihat panduan lengkap
              </ArrowLink>
            </div>
            <div className="relative">
              <div className="absolute inset-8 -z-0 rounded-full bg-marun-500/20 blur-3xl" aria-hidden />
              {L.steps_image ? (
                <div className="relative mx-auto aspect-[9/16] w-64 overflow-hidden rounded-[2.5rem] border-[10px] border-gelap-900 shadow-2xl">
                  <Image src={L.steps_image} alt="Tampilan aplikasi SAHABAT ANAK" fill sizes="256px" className="object-cover" />
                </div>
              ) : (
                <PhoneMockup />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ALUR PROGRAM */}
      {show.roadmap && (
        <section className="bg-gradient-to-br from-marun-800 via-marun-700 to-marun-900 py-24 text-white">
          <div className="mx-auto max-w-6xl px-4">
            <Eyebrow>Perjalanan</Eyebrow>
            <Headline text={L.roadmap_title} className="mt-5 text-4xl md:text-6xl" breakLine={false} />
            <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/15 md:grid-cols-2 lg:grid-cols-4">
              {L.roadmap.filter((r) => r.title).map((r, i) => (
                <li key={i} className="relative bg-marun-800/90 p-7">
                  <span className="display absolute top-5 right-6 text-6xl text-emas-300">{String(i + 1).padStart(2, "0")}</span>
                  <p className="eyebrow text-emas-300">{r.label}</p>
                  <p className="mt-10 text-xl font-extrabold tracking-tight">{r.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{r.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* GALERI */}
      {show.gallery && (
        <section className="bg-gelap-950 py-24 text-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow>Dokumentasi</Eyebrow>
                <Headline text={L.gallery_title} className="mt-5 text-4xl md:text-6xl" breakLine={false} />
              </div>
              <ArrowLink href="/galeri">Lihat semua</ArrowLink>
            </div>
            {photos.length ? <GalleryGrid photos={photos} limit={8} dark /> : <p className="rounded-3xl border border-white/10 p-10 text-center text-white/55">Foto kegiatan akan segera diunggah oleh pengurus.</p>}
          </div>
        </section>
      )}

      {/* ARTIKEL */}
      {show.articles && (
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow light={false}>Bacaan keluarga</Eyebrow>
                <Headline text={L.articles_title} light={false} className="mt-5 text-4xl md:text-6xl" breakLine={false} />
              </div>
              <ArrowLink href="/artikel" light={false}>Semua artikel</ArrowLink>
            </div>
            {articles.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center">
                <Icon name="book-open" className="mx-auto h-10 w-10 text-marun-600" />
                <p className="mt-3 font-bold">Artikel pertama sedang ditulis</p>
                <p className="text-ink-soft">Nantikan tips digital parenting untuk keluarga.</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                {articles.map((a, i) => (
                  <ArticleCard key={a.id} a={a} accent={i === 1} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* AJAKAN */}
      {show.cta && (
        <section className="relative isolate overflow-hidden bg-gelap-950 text-white">
          <DarkMedia src={hero.image} className="absolute inset-0 -z-10 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-r from-gelap-950 via-gelap-950/70 to-marun-900/60" />
          </DarkMedia>
          <div className="mx-auto grid max-w-6xl items-end gap-10 px-4 py-28 md:grid-cols-[1.4fr_1fr]">
            <div>
              <Eyebrow>Langkah berikutnya</Eyebrow>
              <Headline text={L.cta_title} className="mt-5 text-5xl md:text-7xl" />
            </div>
            <div className="md:justify-self-end">
              <p className="max-w-xs text-white/70">{L.cta_text}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/daftar" className="btn-primary px-7">
                  {L.cta_button} <Icon name="arrow-right" className="h-5 w-5" />
                </Link>
                {contact.whatsapp && (
                  <a href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent("Halo pengurus, saya ingin bergabung dengan SAHABAT ANAK.")}`} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
                    <Icon name="chat" className="h-5 w-5" /> WhatsApp Pengurus
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

