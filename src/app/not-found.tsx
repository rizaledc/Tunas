import type { Metadata } from "next";
import { StatusPage } from "@/components/site/status-page";

export const metadata: Metadata = { title: "Halaman belum tersedia", robots: { index: false } };

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      eyebrow="Halaman tidak ditemukan"
      title="Maaf, halaman ini belum tersedia."
      text="Alamat yang Anda buka mungkin salah ketik, sudah dipindahkan, atau memang belum ada. Silakan kembali ke beranda atau pilih halaman di bawah ini."
      notFound
    />
  );
}
