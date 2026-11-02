import type { Metadata } from "next";
import { NewPasswordForm } from "../forms";

export const metadata: Metadata = { title: "Buat Password Baru" };

export default function ResetPasswordPage() {
  return (
    <div className="card rounded-3xl p-7 sm:p-9">
      <h1 className="display text-3xl text-ink">Buat Password Baru</h1>
      <NewPasswordForm />
    </div>
  );
}
