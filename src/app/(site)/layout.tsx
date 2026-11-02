import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">
        Lompat ke konten
      </a>
      <SiteHeader />
      <main id="konten">{children}</main>
      <SiteFooter />
    </>
  );
}
