"use client";
import { useEffect } from "react";
import { StatusPage } from "@/components/site/status-page";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = typeof error === "object" && error && "digest" in error ? String((error as { digest?: string }).digest ?? "") : "";
  return (
    <>
      <title>Terjadi kendala | SAHABAT ANAK</title>
      <StatusPage
        code="500"
        eyebrow="Terjadi kendala"
        title="Maaf, ada yang tidak beres."
        text="Halaman ini gagal dimuat. Data Anda tetap aman. Coba muat ulang, atau kembali ke beranda dan ulangi beberapa saat lagi."
        onRetry={retry}
        reference={digest || undefined}
      />
    </>
  );
}
