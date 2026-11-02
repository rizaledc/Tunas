"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app", label: "Beranda", icon: "🏠" },
  { href: "/app/riwayat", label: "Riwayat", icon: "📋" },
  { href: "/app/catat", label: "Catat", icon: "+", center: true },
  { href: "/app/analitik", label: "Analitik", icon: "📊" },
  { href: "/app/profil", label: "Profil", icon: "👤" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]" aria-label="Menu aplikasi">
      <ul className="mx-auto flex max-w-lg items-end justify-around px-2">
        {ITEMS.map((it) => {
          const active = it.href === "/app" ? path === "/app" : path.startsWith(it.href);
          if (it.center)
            return (
              <li key={it.href} className="-mt-6">
                <Link href={it.href} className="flex flex-col items-center gap-0.5 text-xs font-bold text-oranye-600" aria-current={active ? "page" : undefined}>
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-oranye-500 text-4xl leading-none font-bold text-white shadow-lg ring-4 ring-white">+</span>
                  {it.label}
                </Link>
              </li>
            );
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-w-16 flex-col items-center gap-0.5 py-2 text-xs font-bold", active ? "text-tunas-700" : "text-ink-soft")}
              >
                <span className={cn("text-2xl", !active && "opacity-70 grayscale")} aria-hidden>
                  {it.icon}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
