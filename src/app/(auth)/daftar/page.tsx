import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { GoogleButton, OrDivider, RegisterForm } from "../forms";

export const metadata: Metadata = pageMeta("/daftar", "Undangan Bergabung", "Anda diundang bergabung dengan SAHABAT ANAK. Daftar dengan kode undangan, lalu mulai mencatat aktivitas si kecil.");

export default async function DaftarPage({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const [{ kode }, consent, auth] = await Promise.all([searchParams, getSetting("public.consent"), getSetting("public.auth")]);
  return (
    <div className="card rounded-3xl p-6 shadow-xl shadow-black/5 sm:p-9">
      <h1 className="display text-[1.75rem] leading-tight text-ink sm:text-3xl">Daftar SAHABAT ANAK</h1>
      <p className="mb-5 text-ink-soft">Pendaftaran memakai kode undangan. Minta kode ke pengurus komunitas atau sekolah Anda.</p>
      {auth.google && (
        <>
          <GoogleButton code={kode ?? ""} label="Daftar dengan Google" />
          <p className="mt-2 text-center text-xs text-ink-soft">Lebih cepat: tidak perlu membuat password. Kode undangan diminta di langkah berikutnya.</p>
          <OrDivider />
          <p className="mb-3 text-sm font-bold">Daftar dengan nomor HP & email</p>
        </>
      )}
      <RegisterForm consentText={consent.text} consentVersion={consent.version} code={kode} />
      <p className="mt-6 border-t pt-4 text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-marun-600">
          Masuk
        </Link>
      </p>
    </div>
  );
}
