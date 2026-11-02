import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getSetting } from "@/lib/settings";

export const revalidate = 300;
export const metadata: Metadata = pageMeta("/privasi", "Kebijakan Privasi", "Bagaimana SAHABAT ANAK menyimpan dan melindungi data keluarga.");

export default async function PrivasiPage() {
  const consent = await getSetting("public.consent");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-daun-900">Kebijakan Privasi & Persetujuan Data</h1>
      <p className="mt-2 text-ink-soft">Mengacu pada Undang-Undang Pelindungan Data Pribadi (UU PDP).</p>

      <section className="card mt-6 space-y-3">
        <h2 className="text-xl font-extrabold">Data apa yang disimpan?</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Orang tua: nama, nomor HP atau email, RT, password (tersimpan dalam bentuk hash).</li>
          <li>Anak: hanya nama panggilan, tahun lahir, dan jenjang sekolah — tanpa NIK, alamat, atau foto.</li>
          <li>Catatan aktivitas, check-in harian, kesepakatan keluarga, insight, dan refleksi.</li>
        </ul>
        <h2 className="text-xl font-extrabold">Siapa yang bisa melihat?</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Hanya orang tua yang bersangkutan yang bisa melihat catatan harian anaknya.</li>
          <li>Pengurus komunitas hanya melihat angka gabungan, dan hanya untuk kelompok berisi minimal 5 keluarga.</li>
          <li>Layanan AI hanya menerima ringkasan angka, tanpa nama atau identitas anak.</li>
        </ul>
        <h2 className="text-xl font-extrabold">Hak Anda</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Mengunduh seluruh data Anda di menu Profil.</li>
          <li>Menghapus akun beserta seluruh data anak kapan saja.</li>
          <li>Foto anak hanya dipublikasikan jika orang tua memberi izin; izin dicatat per foto.</li>
        </ul>
      </section>

      <section className="card mt-6">
        <h2 className="text-xl font-extrabold">Teks Persetujuan (versi {consent.version})</h2>
        <p className="mt-3 whitespace-pre-line">{consent.text}</p>
      </section>
    </div>
  );
}
