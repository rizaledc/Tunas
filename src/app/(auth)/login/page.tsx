import type { Metadata } from "next";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { GoogleButton, LoginForm, OrDivider } from "../forms";

export const metadata: Metadata = { title: "Masuk" };

const REASONS: Record<string, string> = {
  nonaktif: "Akun Anda sedang dinonaktifkan. Hubungi pengurus komunitas.",
  keluarga: "Data keluarga tidak ditemukan. Hubungi pengurus komunitas.",
  dihapus: "Akun dan seluruh data Anda sudah dihapus. Terima kasih sudah ikut program.",
  google_batal: "Masuk dengan Google dibatalkan.",
  google_gagal: "Masuk dengan Google gagal. Coba lagi atau masuk dengan nomor HP/email.",
  google_mati: "Masuk dengan Google belum diaktifkan oleh pengelola.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; alasan?: string }> }) {
  const [{ next, alasan }, auth] = await Promise.all([searchParams, getSetting("public.auth")]);
  return (
    <div className="card rounded-3xl p-6 shadow-xl shadow-black/5 sm:p-9">
      <h1 className="display text-[1.75rem] leading-tight text-ink sm:text-3xl">Masuk</h1>
      <p className="mb-5 text-ink-soft">Untuk orang tua.</p>
      {alasan && REASONS[alasan] && <p className="mb-4 rounded-xl bg-emas-300/25 p-3 text-sm font-semibold text-aksen-600">{REASONS[alasan]}</p>}
      {auth.google && (
        <>
          <GoogleButton label="Masuk dengan Google" />
          <OrDivider />
        </>
      )}
      <LoginForm next={next} />
      <div className="mt-6 border-t pt-4 text-center text-sm">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-bold text-marun-600">
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
