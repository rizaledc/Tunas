import { SITE_URL } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ServiceWorker } from "@/components/service-worker";
import { getSetting } from "@/lib/settings";
import { og } from "@/lib/seo";
import { THEME_SCRIPT } from "@/lib/theme";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["400", "500", "600", "700", "800"] });

const DEFAULT_DESCRIPTION =
  "Catat aktivitas digital dan non-digital anak, lihat keseimbangannya, dan dapatkan saran pendampingan. Keputusan tetap di tangan orang tua.";

export async function generateMetadata(): Promise<Metadata> {
  const share = await getSetting("public.share");
  const description = share.description || DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "SAHABAT ANAK | Dampingi Aktivitas Anak, Seimbangkan Dunia Digitalnya",
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
  themeColor: "#940000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: kelas "dark" dipasang skrip sebelum React berjalan.
    <html lang="id" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
