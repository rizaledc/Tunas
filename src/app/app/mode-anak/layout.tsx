import { requireParent } from "@/lib/auth";

export default async function ChildModeLayout({ children }: { children: React.ReactNode }) {
  await requireParent();
  return <div className="min-h-dvh bg-gradient-to-b from-yellow-100 via-orange-50 to-daun-50 text-[18px]">{children}</div>;
}
