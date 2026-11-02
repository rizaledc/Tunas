import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-5xl">🌱</p>
      <h1 className="mt-3 text-2xl font-extrabold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-ink-soft">Mungkin tautannya sudah berubah.</p>
      <Link href="/" className="btn-primary mt-6">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
