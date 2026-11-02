import { SITE_URL } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ServiceWorker } from "@/components/service-worker";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SAHABAT ANAK — Sistem Aplikasi Harmoni Aktivitas dan Perilaku Anak",
    template: "%s · SAHABAT ANAK",
  },
  description:
    "Catat aktivitas digital dan non-digital anak, lihat keseimbangannya, dan dapatkan saran pendampingan. Keputusan tetap di tangan orang tua.",
  applicationName: "SAHABAT ANAK",
  appleWebApp: { capable: true, title: "SAHABAT ANAK", statusBarStyle: "default" },
  openGraph: { type: "website", locale: "id_ID", siteName: "SAHABAT ANAK" },
};

export const viewport: Viewport = {
  themeColor: "#23824a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={nunito.variable}>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
