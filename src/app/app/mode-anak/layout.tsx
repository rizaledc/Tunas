import { requireParent } from "@/lib/auth";

export default async function ChildModeLayout({ children }: { children: React.ReactNode }) {
  await requireParent();
  return <div className="min-h-dvh bg-gradient-to-b from-kuning-300/40 via-hijau-50 to-hijau-50 text-[18px]">{children}</div>;
}
