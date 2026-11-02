import Link from "next/link";
import { Logo } from "@/components/logo";
import { getSetting } from "@/lib/settings";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-daun-50 to-white">
      <header className="px-4 py-4">
        <Link href="/" aria-label="Kembali ke beranda">
          <Logo brand={await getSetting("public.brand")} />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-10">{children}</main>
    </div>
  );
}
