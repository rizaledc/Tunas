import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "../forms";

export const metadata: Metadata = { title: "Masuk" };

const REASONS: Record<string, string> = {
  nonaktif: "Akun Anda sedang dinonaktifkan. Hubungi pengurus TUNAS.",
  keluarga: "Data keluarga tidak ditemukan. Hubungi pengurus TUNAS.",
  dihapus: "Akun dan seluruh data Anda sudah dihapus. Terima kasih sudah ikut program.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; alasan?: string }> }) {
  const { next, alasan } = await searchParams;
  return (
    <div className="card mt-4 p-6">
      <h1 className="text-2xl font-extrabold text-tunas-900">Masuk</h1>
      <p className="mb-5 text-ink-soft">Untuk orang tua anggota TUNAS.</p>
      {alasan && REASONS[alasan] && <p className="mb-4 rounded-xl bg-orange-50 p-3 text-sm font-semibold text-oranye-600">{REASONS[alasan]}</p>}
      <LoginForm next={next} />
      <div className="mt-6 border-t pt-4 text-center text-sm">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-bold text-sky-brand">
          Daftar dengan kode undangan
        </Link>
      </div>
      <p className="mt-2 text-center text-xs text-ink-soft">
        Pengurus?{" "}
        <Link href="/login/admin" className="underline">
          Masuk panel admin
        </Link>
      </p>
    </div>
  );
}
