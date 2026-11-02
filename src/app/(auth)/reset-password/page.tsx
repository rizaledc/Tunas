import type { Metadata } from "next";
import { NewPasswordForm } from "../forms";

export const metadata: Metadata = { title: "Buat Password Baru" };

export default function ResetPasswordPage() {
  return (
    <div className="card mt-4 p-6">
      <h1 className="text-2xl font-extrabold text-tunas-900">Buat Password Baru</h1>
      <NewPasswordForm />
    </div>
  );
}
