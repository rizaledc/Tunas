import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { getSetting } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const brand = await getSetting("public.brand");
  return (
    <>
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">
        Lompat ke konten
      </a>
      <SiteHeader brand={brand} />
      <main id="konten" className="bg-gelap-950">{children}</main>
      <SiteFooter />
    </>
  );
}
