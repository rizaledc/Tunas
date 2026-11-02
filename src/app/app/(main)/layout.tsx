import Link from "next/link";
import { redirect } from "next/navigation";
import { getSetting } from "@/lib/settings";
import { requireParent } from "@/lib/auth";
import { getActiveChild } from "@/lib/parent";
import { BottomNav } from "@/components/app/bottom-nav";
import { ChildSwitcher } from "@/components/app/child-switcher";
import { LogoMark } from "@/components/logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const parent = await requireParent();
  const consent = await getSetting("public.consent");
  if (parent.consentVersion !== consent.version) redirect("/app/persetujuan");
  const { children: kids, child } = await getActiveChild(parent.familyId);
  return (
    <div className="min-h-dvh pb-28">
      <header className="no-print sticky top-0 z-30 bg-daun-600 text-white shadow">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link href="/app" className="flex items-center gap-2" aria-label="Beranda aplikasi">
            <LogoMark className="h-9 w-9 ring-2 ring-white/40 rounded-xl" />
            <span className="text-sm leading-tight">
              <span className="block text-white/80">Halo,</span>
              <span className="block max-w-36 truncate font-extrabold">{parent.nama}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
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
