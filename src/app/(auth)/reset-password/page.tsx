import type { Metadata } from "next";
import { NewPasswordForm } from "../forms";

export const metadata: Metadata = { title: "Buat Password Baru" };

export default function ResetPasswordPage() {
  return (
    <div className="card rounded-3xl p-6 shadow-xl shadow-black/5 sm:p-9">
      <h1 className="display text-[1.75rem] leading-tight text-ink sm:text-3xl">Buat Password Baru</h1>
      <NewPasswordForm />
    </div>
  );
}
