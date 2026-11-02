import { Icon } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { getArticles, getEvents, getPhotos, countActiveFamilies } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { formatTanggal } from "@/lib/date";
import { EventSlider } from "@/components/site/slider";
import { GalleryGrid } from "@/components/site/gallery";
import { PhoneMockup } from "@/components/site/phone-mockup";
import { Placeholder } from "@/components/blocks";
import { excerpt } from "@/lib/markdown";

export const revalidate = 300;

const FEATURES = [
  { icon: "pencil" as const, title: "Catat Aktivitas", text: "Catat waktu gawai dan kegiatan positif anak kurang dari 1 menit." },
  { icon: "chart" as const, title: "Grafik Keseimbangan", text: "Lihat perbandingan digital dan non-digital dalam grafik yang mudah dibaca." },
  { icon: "sparkle" as const, title: "Insight AI", text: "Ringkasan mingguan dan saran pendampingan — bukan perintah." },
  { icon: "agreement" as const, title: "Kesepakatan Keluarga", text: "Tetapkan target waktu layar dan jam bebas gawai, lalu cetak posternya." },
  { icon: "star" as const, title: "Mode Anak", text: "Anak mencatat kegiatannya sendiri dan mengumpulkan bintang." },
  { icon: "community" as const, title: "Pantau Komunitas", text: "Pengurus TUNAS melihat data gabungan untuk merencanakan kegiatan." },
];

const ROADMAP = [
  { year: "2025", title: "Literasi Digital Ibu Rumah Tangga", text: "Pelatihan keterampilan digital untuk ibu-ibu anggota TUNAS." },
  { year: "2025", title: "Literasi Digital Keluarga", text: "Pendampingan keluarga dalam penggunaan gawai yang sehat." },
  { year: "2026", title: "Ternak Lele & Logbook", text: "Aktivitas alternatif anak merawat lele dan pencatatan di logbook kertas." },
  { year: "2026–2027", title: "SAHABAT ANAK", text: "Logbook berpindah ke aplikasi dengan grafik dan insight AI." },
];

export default async function LandingPage() {
  const [settings, featured, upcoming, photos, articles, families] = await Promise.all([
    getSettings(["public.hero", "public.stats", "public.contact"]),
    getEvents({ featured: true, limit: 5 }),
    getEvents({ upcoming: true, limit: 3 }),
    getPhotos({ limit: 12 }),
    getArticles(3),
    countActiveFamilies(),
  ]);
  const hero = settings["public.hero"];
  const stats = settings["public.stats"];
  const contact = settings["public.contact"];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-brand to-sky-brand-dark text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-bold">Komunitas TUNAS × PKM Telkom University</p>
            <h1 className="text-3xl leading-tight font-extrabold md:text-5xl">{hero.title}</h1>
            <p className="mt-4 text-lg text-white/90">{hero.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/daftar" className="btn-primary text-lg">
                Mulai Mencatat
              </Link>
              <Link href="/tentang" className="btn border-2 border-white/70 text-lg text-white hover:bg-white/10">
                Pelajari Program
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/20">
            {hero.image ? (
              <Image src={hero.image} alt="Kegiatan anak-anak Komunitas TUNAS" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            ) : (
              <Placeholder label="Anak-anak TUNAS merawat lele" icon="fish" className="h-full w-full" />
            )}
          </div>
        </div>
      </section>

      {/* Angka capaian */}
      <section className="mx-auto -mt-8 max-w-6xl px-4" aria-label="Angka capaian program">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <p className="text-2xl font-extrabold text-tunas-700">
                {s.before && <span className="text-base text-ink-soft line-through decoration-1">{s.before}</span>} {s.before && <Icon name="arrow-right" className="h-5 w-5 align-[-2px] text-oranye-500" />}{" "}
                {s.after}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink-soft">{s.label}</p>
            </div>
          ))}
          <div className="card bg-oranye-500 text-center text-white">
            <p className="text-2xl font-extrabold">{families ?? "–"}</p>
            <p className="mt-1 text-sm font-semibold">Keluarga aktif mencatat</p>
          </div>
        </div>
      </section>

      {/* Kegiatan unggulan + agenda */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-2xl font-extrabold text-tunas-900">Kegiatan Pendampingan</h2>
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <EventSlider items={featured.map((e) => ({ slug: e.slug, title: e.title, dateLabel: formatTanggal(e.date), cover: e.cover_photo }))} />
          </div>
          <div className="md:col-span-2">
            <h3 className="mb-3 text-lg font-extrabold">Agenda Mendatang</h3>
            {upcoming.length === 0 ? (
              <p className="card text-ink-soft">Agenda berikutnya akan segera diumumkan.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <Link href={`/kegiatan/${e.slug}`} className="card flex gap-3 hover:ring-2 hover:ring-tunas-200">
                      <span className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-tunas-600 py-2 text-white">
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
      </section>

      {/* Fitur */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-tunas-900">Fitur Aplikasi</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-ink-soft">Dirancang untuk HP Android, tombol besar, bahasa sederhana. Bukan aplikasi pemblokir — semua dicatat oleh Ayah dan Bunda.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card flex gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tunas-50 text-tunas-600">
                  <Icon name={f.icon} className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-extrabold">{f.title}</p>
                  <p className="text-ink-soft">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold text-tunas-900">Cara Kerja</h2>
          <ol className="mt-6 space-y-5">
            {[
              ["Daftar dengan kode TUNAS", "Minta kode undangan ke pengurus komunitas, lalu daftar dengan nomor HP."],
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
        <PhoneMockup />
      </section>

      {/* Roadmap */}
      <section className="bg-tunas-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-extrabold text-tunas-900">Perjalanan Program</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {ROADMAP.map((r, i) => (
              <li key={r.title} className="card relative">
                <span className="text-sm font-extrabold text-oranye-600">{r.year}</span>
                <p className="mt-1 font-extrabold">
                  {i + 1}. {r.title}
                </p>
                <p className="text-sm text-ink-soft">{r.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Galeri */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-tunas-900">Galeri Kegiatan</h2>
          <Link href="/galeri" className="inline-flex items-center gap-1 font-bold text-sky-brand">
            Lihat semua <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
        {photos.length ? <GalleryGrid photos={photos} limit={8} /> : <p className="card text-center text-ink-soft">Foto kegiatan akan segera diunggah oleh pengurus.</p>}
      </section>

      {/* Artikel */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-extrabold text-tunas-900">Artikel & Tips</h2>
            <Link href="/artikel" className="inline-flex items-center gap-1 font-bold text-sky-brand">
              Semua artikel <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          {articles.length === 0 ? (
            <div className="card text-center">
              <Icon name="book-open" className="mx-auto h-10 w-10 text-tunas-600" />
              <p className="font-bold">Artikel pertama sedang ditulis</p>
              <p className="text-ink-soft">Nantikan tips digital parenting dari tim TUNAS dan Telkom University.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/artikel/${a.slug}`} className="card overflow-hidden p-0 hover:ring-2 hover:ring-tunas-200">
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
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-oranye-500 to-oranye-400 p-8 text-white md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Bergabung dengan Komunitas TUNAS</h2>
            <p className="mt-1 text-white/90">Dampingi tumbuh kembang anak bersama keluarga-keluarga lain di Desa Banteran.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
            <Link href="/daftar" className="btn bg-white text-oranye-600 hover:bg-orange-50">
              Daftar Sekarang
            </Link>
            <a href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent("Halo pengurus TUNAS, saya ingin bergabung dengan SAHABAT ANAK.")}`} target="_blank" rel="noopener noreferrer" className="btn border-2 border-white text-white hover:bg-white/10">
              <Icon name="chat" className="h-5 w-5" /> WhatsApp Pengurus
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
