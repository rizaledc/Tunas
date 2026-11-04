import Link from "next/link";
import { redirect } from "next/navigation";
import { getSetting } from "@/lib/settings";
import { requireParent } from "@/lib/auth";
import { getActiveChild } from "@/lib/parent";
import { BottomNav } from "@/components/app/bottom-nav";
import { ChildSwitcher } from "@/components/app/child-switcher";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const parent = await requireParent();
  const [consent, brand] = await Promise.all([getSetting("public.consent"), getSetting("public.brand")]);
  if (parent.consentVersion !== consent.version) redirect("/app/persetujuan");
  const { children: kids, child } = await getActiveChild(parent.familyId);
  return (
    <div className="min-h-dvh pb-28">
      <header className="no-print sticky top-0 z-30 bg-gradient-to-r from-marun-800 via-marun-700 to-marun-900 text-white shadow-[0_8px_24px_-12px_rgba(60,0,0,0.6)]">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link href="/app" className="flex items-center gap-2" aria-label="Beranda aplikasi">
            <LogoMark src={brand.logo || undefined} className="h-9 w-9 ring-2 ring-white/40 rounded-xl" />
            <span className="text-sm leading-tight">
              <span className="block text-white/80">Halo,</span>
              <span className="block max-w-36 truncate font-extrabold">{parent.nama}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {kids.length > 0 && <span className="text-white/80">Anak:</span>}
            <ChildSwitcher items={kids.map((k) => ({ id: k.id, nickname: k.nickname }))} activeId={child?.id} />
            <span className="theme-dark">
              <ThemeToggle className="h-9 w-9 border-white/30" />
            </span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-4">{children}</div>
      <BottomNav />
    </div>
  );
}
