import type { Metadata } from "next";
import { ResetRequestForm } from "../forms";

export const metadata: Metadata = { title: "Lupa Password" };

export default function LupaPasswordPage() {
  return (
    <div className="card rounded-3xl p-6 shadow-xl shadow-black/5 sm:p-9">
      <h1 className="display text-[1.75rem] leading-tight text-ink sm:text-3xl">Lupa Password</h1>
      <p className="mb-5 text-ink-soft">Masukkan email akun Anda. Kami kirim tautan untuk membuat password baru. Akun yang masuk dengan Google tidak memakai password; akun yang hanya memakai nomor HP: minta pengurus komunitas mereset password.</p>
      <ResetRequestForm />
    </div>
  );
}
