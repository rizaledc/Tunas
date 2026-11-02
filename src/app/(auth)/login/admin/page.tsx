import type { Metadata } from "next";
import { LoginForm } from "../../forms";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ alasan?: string }> }) {
  const { alasan } = await searchParams;
  return (
    <div className="card mt-4 border-t-4 border-t-sky-brand p-6">
      <h1 className="text-2xl font-extrabold text-daun-900">Panel Admin</h1>
      <p className="mb-5 text-ink-soft">Khusus pengurus komunitas dan pengelola program.</p>
      {alasan === "google" && <p className="mb-4 rounded-xl bg-orange-50 p-3 text-sm font-semibold text-oranye-600">Akun pengurus masuk lewat halaman ini dengan email dan password.</p>}
      <LoginForm admin />
      <p className="mt-4 text-xs text-ink-soft">Percobaan login dibatasi 5 kali per 15 menit. Aktivitas admin dicatat di log.</p>
    </div>
  );
}
