import type { Metadata } from "next";
import { LoginForm } from "../../forms";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="card mt-4 border-t-4 border-t-sky-brand p-6">
      <h1 className="text-2xl font-extrabold text-tunas-900">Panel Admin</h1>
      <p className="mb-5 text-ink-soft">Khusus pengurus TUNAS dan tim PKM Telkom University.</p>
      <LoginForm admin />
      <p className="mt-4 text-xs text-ink-soft">Percobaan login dibatasi 5 kali per 15 menit. Aktivitas admin dicatat di log.</p>
    </div>
  );
}
