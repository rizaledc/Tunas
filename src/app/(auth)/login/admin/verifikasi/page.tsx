import type { Metadata } from "next";
import { MfaForm } from "../../../forms";

export const metadata: Metadata = { title: "Verifikasi Dua Langkah", robots: { index: false } };

export default function MfaPage() {
  return (
    <div className="card rounded-3xl p-6 shadow-xl shadow-black/5 sm:p-9">
      <h1 className="display text-[1.75rem] leading-tight text-ink sm:text-3xl">Verifikasi Dua Langkah</h1>
      <p className="mb-5 text-ink-soft">Buka aplikasi autentikator (Google Authenticator, Authy, dll.) dan masukkan kodenya.</p>
      <MfaForm />
    </div>
  );
}
