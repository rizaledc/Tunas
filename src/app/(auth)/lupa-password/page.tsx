import type { Metadata } from "next";
import { ResetRequestForm } from "../forms";

export const metadata: Metadata = { title: "Lupa Password" };

export default function LupaPasswordPage() {
  return (
    <div className="card mt-4 p-6">
      <h1 className="text-2xl font-extrabold text-tunas-900">Lupa Password</h1>
      <p className="mb-5 text-ink-soft">Untuk akun yang mendaftar dengan email. Akun nomor HP: minta pengurus TUNAS mereset password.</p>
      <ResetRequestForm />
    </div>
  );
}
