import { SITE_URL } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ServiceWorker } from "@/components/service-worker";
import { getSetting } from "@/lib/settings";
import { og } from "@/lib/seo";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

const DEFAULT_DESCRIPTION =
  "Catat aktivitas digital dan non-digital anak, lihat keseimbangannya, dan dapatkan saran pendampingan. Keputusan tetap di tangan orang tua.";

export async function generateMetadata(): Promise<Metadata> {
  const share = await getSetting("public.share");
  const description = share.description || DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "SAHABAT ANAK — Dampingi Aktivitas Anak, Seimbangkan Dunia Digitalnya",
      template: "%s · SAHABAT ANAK",
    },
    description,
    applicationName: "SAHABAT ANAK",
    alternates: { canonical: "/" },
    appleWebApp: { capable: true, title: "SAHABAT ANAK", statusBarStyle: "default" },
    openGraph: og("/", { description }),
    twitter: { card: "summary_large_image" },
  };
}

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
