import type { Metadata } from "next";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { RegisterForm } from "../forms";

export const metadata: Metadata = { title: "Daftar", description: "Registrasi orang tua anggota Komunitas TUNAS dengan kode undangan." };

export default async function DaftarPage({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const [{ kode }, consent] = await Promise.all([searchParams, getSetting("public.consent")]);
  return (
    <div className="card mt-4 p-6">
      <h1 className="text-2xl font-extrabold text-tunas-900">Daftar SAHABAT ANAK</h1>
      <p className="mb-5 text-ink-soft">Pendaftaran tertutup untuk anggota Komunitas TUNAS. Minta kode undangan ke pengurus.</p>
      <RegisterForm consentText={consent.text} consentVersion={consent.version} code={kode} />
      <p className="mt-6 border-t pt-4 text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-sky-brand">
          Masuk
        </Link>
      </p>
    </div>
  );
}
