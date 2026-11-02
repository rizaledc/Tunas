import type { Metadata } from "next";
import { MfaForm } from "../../../forms";

export const metadata: Metadata = { title: "Verifikasi Dua Langkah", robots: { index: false } };

export default function MfaPage() {
  return (
    <div className="card mt-4 p-6">
      <h1 className="text-2xl font-extrabold text-tunas-900">Verifikasi Dua Langkah</h1>
      <p className="mb-5 text-ink-soft">Buka aplikasi autentikator (Google Authenticator, Authy, dll.) dan masukkan kodenya.</p>
      <MfaForm />
    </div>
  );
}
