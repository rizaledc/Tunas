import type { Metadata } from "next";
import { LoginForm } from "../../forms";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ alasan?: string }> }) {
  const { alasan } = await searchParams;
  return (
    <div className="card rounded-3xl border-t-4 border-t-hijau-600 p-6 shadow-xl shadow-black/5 sm:p-9">
      <h1 className="display text-[1.75rem] leading-tight text-ink sm:text-3xl">Panel Admin</h1>
      <p className="mb-5 text-ink-soft">Khusus pengurus komunitas dan pengelola program.</p>
      {alasan === "google" && <p className="mb-4 rounded-xl bg-kuning-300/25 p-3 text-sm font-semibold text-hijau-700">Akun pengurus masuk lewat halaman ini dengan email dan password.</p>}
      <LoginForm admin />
      <p className="mt-4 text-xs text-ink-soft">Percobaan login dibatasi 5 kali per 15 menit. Aktivitas admin dicatat di log.</p>
    </div>
  );
}
