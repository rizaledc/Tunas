import { Icon } from "@/components/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Tentang Program", description: "Latar belakang, tim, mitra, dan roadmap program SAHABAT ANAK." };

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-tunas-900">Tentang SAHABAT ANAK</h1>
      <p className="mt-3 text-lg text-ink-soft">
        <strong>SAHABAT ANAK</strong> (Sistem Aplikasi Harmoni Aktivitas dan Perilaku Anak) membantu orang tua mencatat aktivitas digital dan non-digital anak, melihat keseimbangannya, lalu mendapatkan saran pendampingan. Keputusan pendampingan tetap di tangan orang tua.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-extrabold">Latar Belakang</h2>
          <p className="mt-2 text-ink-soft">
            Pada program sebelumnya, aktivitas anak dicatat di logbook kertas. Datanya tersebar di lembar setiap peserta, perlu direkap manual, dan sulit divisualisasikan. SAHABAT ANAK memindahkan logbook itu ke HP agar orang tua dan komunitas lebih mudah melihat perkembangan.
          </p>
        </div>
        <div className="card">
          <h2 className="text-xl font-extrabold">Bukan Parental Control</h2>
          <p className="mt-2 text-ink-soft">
            SAHABAT ANAK tidak memblokir aplikasi, tidak membaca isi HP anak, dan tidak melacak lokasi. Screen time dicatat manual oleh orang tua, seperti logbook.
          </p>
        </div>
      </section>

      <section className="card mt-8 grid items-center gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex justify-center gap-4">
          <LogoMark tile={false} className="h-28 w-28" />
          <LogoMark className="h-28 w-28" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Makna Logo</h2>
          <ul className="mt-3 space-y-2 text-ink-soft">
            <li>
              <strong className="text-tunas-700">Daun besar hijau</strong> — orang tua yang menaungi, sekaligus dunia nyata dan alam tempat anak bermain.
            </li>
            <li>
              <strong className="text-oranye-600">Daun kecil oranye</strong> — anak yang sedang tumbuh: hangat, ceria, dan penuh rasa ingin tahu.
            </li>
            <li>
              <strong className="text-ink">Satu titik tumbuh</strong> — keduanya berangkat dari akar yang sama, yaitu keluarga dan Komunitas TUNAS (tunas = awal kehidupan).
            </li>
            <li>
              <strong className="text-ink">Membentuk tanda ✓</strong> — keseimbangan digital yang dicapai berdua dan disepakati bersama, bukan diperintahkan.
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold">Tujuan</h2>
        <ul className="mt-3 space-y-2">
          {[
            "Orang tua mencatat aktivitas anak kurang dari 1 menit per catatan.",
            "Orang tua melihat keseimbangan aktivitas digital dan non-digital dalam grafik.",
            "Orang tua mendapat ringkasan dan saran pendampingan dari AI — bukan perintah.",
            "Komunitas TUNAS mendapat data gabungan untuk merencanakan kegiatan.",
            "Tim PKM mendapat data evaluasi untuk laporan dan artikel ilmiah.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <Icon name="check-circle" className="mt-0.5 h-5 w-5 text-tunas-600" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-extrabold">Komunitas TUNAS</h2>
          <p className="mt-2 text-ink-soft">
            TUNAS (Tunggu Anak Siap) adalah komunitas orang tua di Perum Bukit Lestari, Desa Banteran, Banyumas yang mendampingi anak agar siap dan bijak menggunakan gawai.
          </p>
        </div>
        <div className="card">
          <h2 className="text-xl font-extrabold">Tim PKM Telkom University</h2>
          <p className="mt-2 text-ink-soft">
            Program ini adalah luaran Teknologi Tepat Guna Pengabdian kepada Masyarakat (PKM) Telkom University yang bermitra dengan Komunitas TUNAS.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold">Roadmap 2025–2027</h2>
        <ol className="mt-4 border-l-4 border-tunas-200 pl-6">
          {[
            ["2025", "Literasi Digital Ibu Rumah Tangga"],
            ["2025", "Literasi Digital Keluarga"],
            ["2026", "Ternak Lele & Logbook Aktivitas Anak"],
            ["2026–2027", "SAHABAT ANAK: aplikasi pencatatan, grafik, dan insight AI"],
          ].map(([y, t]) => (
            <li key={t} className="relative mb-5">
              <span className="absolute top-1 -left-[34px] h-4 w-4 rounded-full bg-oranye-500 ring-4 ring-white" />
              <p className="text-sm font-extrabold text-oranye-600">{y}</p>
              <p className="font-bold">{t}</p>
            </li>
          ))}
        </ol>
      </section>

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
