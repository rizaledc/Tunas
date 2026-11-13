"use client";
import { Icon } from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app", label: "Beranda", icon: "home" as const },
  { href: "/app/riwayat", label: "Riwayat", icon: "list" as const },
  { href: "/app/catat", label: "Catat", icon: "plus" as const, center: true },
  { href: "/app/analitik", label: "Analitik", icon: "chart" as const },
  { href: "/app/profil", label: "Profil", icon: "user" as const },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-paper pb-[env(safe-area-inset-bottom)]" aria-label="Menu aplikasi">
      <ul className="mx-auto flex max-w-lg items-end justify-around px-2">
        {ITEMS.map((it) => {
          const active = it.href === "/app" ? path === "/app" : path.startsWith(it.href);
          if (it.center)
            return (
              <li key={it.href} className="-mt-6">
                <Link href={it.href} className="flex flex-col items-center gap-0.5 text-xs font-bold text-hijau-700" aria-current={active ? "page" : undefined}>
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-hijau-700 text-white shadow-lg ring-4 ring-white">
                    <Icon name="plus" className="h-8 w-8" strokeWidth={2.5} />
                  </span>
                  {it.label}
                </Link>
              </li>
            );
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-w-16 flex-col items-center gap-0.5 py-2 text-xs font-bold", active ? "text-hijau-700" : "text-ink-soft")}
              >
                <Icon name={it.icon} className="h-7 w-7" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
