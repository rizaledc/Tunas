"use client";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

const STEPS = [
  { title: "Masukkan kode undangan", text: "Minta kode ke pengurus komunitas atau sekolah Anda." },
  { title: "Isi data & buat password", text: "Nomor HP, email, dan password kuat sesuai panduan." },
  { title: "Tambahkan profil anak", text: "Cukup nama panggilan, tahun lahir, dan jenjang sekolah." },
];

const PROMISES: Array<{ icon: IconName; text: string }> = [
  { icon: "shield", text: "Catatan harian hanya bisa dilihat keluarga Anda" },
  { icon: "lock", text: "Nama anak tidak pernah dikirim ke layanan AI" },
  { icon: "download", text: "Data bisa diunduh atau dihapus kapan saja" },
];

/** Isi tambahan panel merek khusus halaman pendaftaran. */
export function AuthAside() {
  const path = usePathname();
  if (!path.startsWith("/daftar")) return null;
  return (
    <div className="space-y-6">
      <ol className="space-y-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-5 bg-surface/70 px-5 py-4 backdrop-blur">
            <span className="display w-10 shrink-0 text-3xl text-hl">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="block font-bold text-ink">{s.title}</span>
              <span className="mt-1 block text-sm text-ink/60">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <ul className="space-y-2.5 [@media(max-height:820px)]:hidden">
        {PROMISES.map((p) => (
          <li key={p.text} className="flex items-center gap-3 text-sm text-ink/75">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emas-400/30 bg-emas-400/10 text-gold">
              <Icon name={p.icon} className="h-4 w-4" />
            </span>
            {p.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
