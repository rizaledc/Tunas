import Link from "next/link";
import { redirect } from "next/navigation";
import { getSetting } from "@/lib/settings";
import { requireParent } from "@/lib/auth";
import { getActiveChild, getFamilyStreak } from "@/lib/parent";
import { StreakBadge } from "@/components/app/streak";
import { BottomNav } from "@/components/app/bottom-nav";
import { ChildSwitcher } from "@/components/app/child-switcher";
import { LogoMark } from "@/components/logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const parent = await requireParent();
  const [consent, brand] = await Promise.all([getSetting("public.consent"), getSetting("public.brand")]);
  if (parent.consentVersion !== consent.version) redirect("/app/persetujuan");
  const [{ children: kids, child }, streak] = await Promise.all([getActiveChild(parent.familyId), getFamilyStreak(parent.familyId)]);
  return (
    <div className="min-h-dvh pb-28">
      <header className="no-print sticky top-0 z-30 bg-gradient-to-r from-hijau-800 via-hijau-700 to-hijau-900 text-white shadow-[0_8px_24px_-12px_rgba(60,0,0,0.6)]">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link href="/app" className="flex items-center gap-2" aria-label="Beranda aplikasi">
            <LogoMark src={brand.logo || undefined} tile className="h-10 w-10" />
            <span className="text-sm leading-tight">
              <span className="block text-white/80">Halo,</span>
              <span className="block max-w-36 truncate font-extrabold">{parent.nama}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <StreakBadge s={streak} />
            {kids.length > 0 && <span className="text-white/80">Anak:</span>}
            <ChildSwitcher items={kids.map((k) => ({ id: k.id, nickname: k.nickname }))} activeId={child?.id} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-4">{children}</div>
      <BottomNav />
    </div>
  );
}
