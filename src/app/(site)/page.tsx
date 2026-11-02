import { CategoryIcon, Icon } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { getArticles, getEvents, getPhotos, countActiveFamilies } from "@/lib/content";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import { formatTanggal } from "@/lib/date";
import { EventSlider } from "@/components/site/slider";
import { GalleryGrid } from "@/components/site/gallery";
import { PhoneMockup } from "@/components/site/phone-mockup";
import { Placeholder } from "@/components/blocks";
import { excerpt } from "@/lib/markdown";

export const revalidate = 300;

export default async function LandingPage() {
  const [settings, featured, upcoming, photos, articles, families] = await Promise.all([
    getSettings(["public.hero", "public.stats", "public.contact", "public.landing"]),
    getEvents({ featured: true, limit: 5 }),
    getEvents({ upcoming: true, limit: 3 }),
    getPhotos({ limit: 12 }),
    getArticles(3),
    countActiveFamilies(),
  ]);
  const hero = settings["public.hero"];
  const stats = settings["public.stats"];
  const contact = settings["public.contact"];
  const L = settings["public.landing"];
  const show = { ...DEFAULT_SETTINGS["public.landing"].show, ...(L.show ?? {}) };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-brand to-sky-brand-dark text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
              <Icon name="sprout" className="h-4 w-4" /> {L.badge}
            </p>
            <h1 className="text-3xl leading-tight font-extrabold md:text-5xl">{hero.title}</h1>
            <p className="mt-4 text-lg text-white/90">{hero.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/daftar" className="btn-primary text-lg">
                {L.cta_primary}
              </Link>
              <Link href="/tentang" className="btn border-2 border-white/70 text-lg text-white hover:bg-white/10">
                {L.cta_secondary}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/20">
            {hero.image ? (
              <Image src={hero.image} alt="Kegiatan anak bersama keluarga" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            ) : (
              <Placeholder label="Anak berkegiatan di luar layar" icon="fish" className="h-full w-full" />
            )}
          </div>
        </div>
      </section>

      {/* Angka capaian */}
      {show.stats && <section className="mx-auto -mt-8 max-w-6xl px-4" aria-label="Angka capaian program">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <p className="text-2xl font-extrabold text-daun-700">
                {s.before && <span className="text-base text-ink-soft line-through decoration-1">{s.before}</span>} {s.before && <Icon name="arrow-right" className="h-5 w-5 align-[-2px] text-oranye-500" />}{" "}
                {s.after}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink-soft">{s.label}</p>
            </div>
          ))}
          <div className="card bg-oranye-500 text-center text-white">
            <p className="text-2xl font-extrabold">{families ?? "–"}</p>
            <p className="mt-1 text-sm font-semibold">{L.stats_label}</p>
          </div>
        </div>
      </section>}

      {/* Kegiatan unggulan + agenda */}
      {show.events && <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-2xl font-extrabold text-daun-900">{L.events_title}</h2>
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <EventSlider items={featured.map((e) => ({ slug: e.slug, title: e.title, dateLabel: formatTanggal(e.date), cover: e.cover_photo }))} />
          </div>
          <div className="md:col-span-2">
            <h3 className="mb-3 text-lg font-extrabold">{L.agenda_title}</h3>
            {upcoming.length === 0 ? (
              <p className="card text-ink-soft">Agenda berikutnya akan segera diumumkan.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <Link href={`/kegiatan/${e.slug}`} className="card flex gap-3 hover:ring-2 hover:ring-daun-200">
                      <span className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-daun-600 py-2 text-white">
                        <span className="text-xl leading-none font-extrabold">{formatTanggal(e.date, { day: "numeric" })}</span>
                        <span className="text-xs">{formatTanggal(e.date, { month: "short" })}</span>
                      </span>
                      <span>
                        <span className="block font-bold">{e.title}</span>
                        <span className="block text-sm text-ink-soft">
                          <Icon name="clock" className="h-3.5 w-3.5 align-[-2px]" /> {formatTanggal(e.date, { hour: "2-digit", minute: "2-digit" })} WIB · {e.location}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/kegiatan" className="mt-3 inline-flex items-center gap-1 font-bold text-sky-brand">
              Semua kegiatan <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>}

      {/* Fitur */}
      {show.features && <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-daun-900">{L.features_title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-ink-soft">{L.features_text}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {L.features.filter((f) => f.title).map((f) => (
              <div key={f.title} className="card flex gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-daun-50 text-daun-600">
                  <CategoryIcon icon={f.icon} className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-extrabold">{f.title}</p>
                  <p className="text-ink-soft">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* Cara kerja */}
      {show.steps && <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold text-daun-900">{L.steps_title}</h2>
          <ol className="mt-6 space-y-5">
            {[
              ["Daftar dengan kode undangan", "Minta kode undangan ke pengurus komunitas atau sekolah, lalu daftar dengan nomor HP."],
              ["Catat aktivitas harian", "Tekan tombol + Catat, pilih jenis aktivitas, selesai dalam satu menit."],
              ["Baca insight dan diskusikan dengan anak", "Setiap minggu dapatkan ringkasan dan ide obrolan untuk si kecil."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-oranye-500 text-xl font-extrabold text-white">{i + 1}</span>
                <span>
                  <span className="block text-lg font-extrabold">{t}</span>
                  <span className="text-ink-soft">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <Link href="/panduan" className="btn-outline mt-6">
            Lihat panduan lengkap
          </Link>
        </div>
        {L.steps_image ? (
          <div className="relative mx-auto aspect-[9/16] w-64 overflow-hidden rounded-[2rem] shadow-2xl">
            <Image src={L.steps_image} alt="Tampilan aplikasi SAHABAT ANAK" fill sizes="256px" className="object-cover" />
          </div>
        ) : (
          <PhoneMockup />
        )}
      </section>}

      {/* Roadmap */}
      {show.roadmap && <section className="bg-daun-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-extrabold text-daun-900">{L.roadmap_title}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {L.roadmap.filter((r) => r.title).map((r, i) => (
              <li key={r.title} className="card relative">
                <span className="text-sm font-extrabold text-oranye-600">{r.label}</span>
                <p className="mt-1 font-extrabold">
                  {i + 1}. {r.title}
                </p>
                <p className="text-sm text-ink-soft">{r.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>}

      {/* Galeri */}
      {show.gallery && <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-daun-900">{L.gallery_title}</h2>
          <Link href="/galeri" className="inline-flex items-center gap-1 font-bold text-sky-brand">
            Lihat semua <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
        {photos.length ? <GalleryGrid photos={photos} limit={8} /> : <p className="card text-center text-ink-soft">Foto kegiatan akan segera diunggah oleh pengurus.</p>}
      </section>}

      {/* Artikel */}
      {show.articles && <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-extrabold text-daun-900">{L.articles_title}</h2>
            <Link href="/artikel" className="inline-flex items-center gap-1 font-bold text-sky-brand">
              Semua artikel <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          {articles.length === 0 ? (
            <div className="card text-center">
              <Icon name="book-open" className="mx-auto h-10 w-10 text-daun-600" />
              <p className="font-bold">Artikel pertama sedang ditulis</p>
              <p className="text-ink-soft">Nantikan tips digital parenting untuk keluarga.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/artikel/${a.slug}`} className="card overflow-hidden p-0 hover:ring-2 hover:ring-daun-200">
                  <div className="relative aspect-[16/9]">
                    {a.cover ? <Image src={a.cover} alt="" fill sizes="33vw" className="object-cover" /> : <Placeholder label="Tips digital parenting" icon="bulb" className="h-full w-full" />}
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
      </section>}

      {/* CTA */}
      {show.cta && <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-oranye-500 to-oranye-400 p-8 text-white md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">{L.cta_title}</h2>
            <p className="mt-1 text-white/90">{L.cta_text}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
            <Link href="/daftar" className="btn bg-white text-oranye-600 hover:bg-orange-50">
              {L.cta_button}
            </Link>
            {contact.whatsapp && (
            <a href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent("Halo pengurus, saya ingin bergabung dengan SAHABAT ANAK.")}`} target="_blank" rel="noopener noreferrer" className="btn border-2 border-white text-white hover:bg-white/10">
              <Icon name="chat" className="h-5 w-5" /> WhatsApp Pengurus
            </a>
            )}
          </div>
        </div>
      </section>}
    </>
  );
}
