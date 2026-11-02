import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { RegisterForm } from "../forms";

export const metadata: Metadata = pageMeta("/daftar", "Undangan Bergabung", "Anda diundang bergabung dengan SAHABAT ANAK. Daftar dengan kode undangan, lalu mulai mencatat aktivitas si kecil.");

export default async function DaftarPage({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const [{ kode }, consent] = await Promise.all([searchParams, getSetting("public.consent")]);
  return (
    <div className="card mt-4 p-6">
      <h1 className="text-2xl font-extrabold text-daun-900">Daftar SAHABAT ANAK</h1>
      <p className="mb-5 text-ink-soft">Pendaftaran memakai kode undangan. Minta kode ke pengurus komunitas atau sekolah Anda.</p>
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
