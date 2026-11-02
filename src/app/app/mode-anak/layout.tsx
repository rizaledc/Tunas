import { requireParent } from "@/lib/auth";

export default async function ChildModeLayout({ children }: { children: React.ReactNode }) {
  await requireParent();
  return <div className="min-h-dvh bg-gradient-to-b from-emas-300/40 via-marun-50 to-marun-50 text-[18px]">{children}</div>;
}
