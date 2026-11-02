"use client";
import "./globals.css";
import { StatusPage } from "@/components/site/status-page";

/** Cadangan terakhir jika tata letak utama ikut gagal. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = typeof error === "object" && error && "digest" in error ? String((error as { digest?: string }).digest ?? "") : "";
  return (
    <html lang="id">
      <body className="bg-gelap-950 font-sans antialiased">
        <title>Terjadi kendala | SAHABAT ANAK</title>
        <StatusPage
          code="500"
          eyebrow="Terjadi kendala"
          title="Maaf, situs sedang mengalami gangguan."
          text="Kami tidak dapat menampilkan halaman ini sekarang. Silakan coba lagi beberapa saat lagi atau kembali ke beranda."
          onRetry={retry}
          reference={digest || undefined}
        />
      </body>
    </html>
  );
}
