"use client";
import { Icon, type IconName } from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo, type Brand } from "@/components/logo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const MENU: Array<{ href: string; label: string; icon: IconName; superOnly?: boolean }> = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/anggota", label: "Anggota", icon: "users" },
  { href: "/admin/statistik", label: "Statistik", icon: "chart" },
  { href: "/admin/laporan", label: "Laporan", icon: "file" },
  { href: "/admin/konten", label: "Konten", icon: "image" },
  { href: "/admin/kegiatan", label: "Kegiatan", icon: "calendar" },
  { href: "/admin/evaluasi", label: "Evaluasi", icon: "clipboard-check" },
  { href: "/admin/impor", label: "Impor Logbook", icon: "download", superOnly: true },
  { href: "/admin/insight", label: "Monitoring AI", icon: "sparkle", superOnly: true },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: "settings", superOnly: true },
  { href: "/admin/log", label: "Log", icon: "receipt", superOnly: true },
];

export function AdminSidebar({ role, nama, brand }: { role: string; nama: string; brand?: Brand }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = MENU.filter((m) => !m.superOnly || role === "superadmin");
  const nav = (
    <nav className="space-y-1" aria-label="Menu admin">
      {items.map((m) => {
        const active = m.href === "/admin" ? path === "/admin" : path.startsWith(m.href);
        return (
          <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold", active ? "bg-white text-[#940000]" : "text-white/90 hover:bg-white/10")}>
            <Icon name={m.icon} className="h-5 w-5" />
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <>
      <div className="no-print sticky top-0 z-40 flex items-center justify-between bg-gelap-800 px-4 py-3 text-white lg:hidden">
        <Logo light small brand={brand} />
        <div className="theme-dark flex items-center gap-2">
          <ThemeToggle />
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 ring-1 ring-white/40" aria-expanded={open} aria-label="Menu">
          <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
        </button>
        </div>
      </div>
      {open && <div className="no-print bg-gelap-800 px-4 pb-4 lg:hidden">{nav}</div>}
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 flex-col bg-gelap-800 p-4 text-white lg:flex dark:border-r dark:border-white/10 dark:bg-[#0b0b0b]">
        <Link href="/admin" className="mb-6 block">
          <Logo light small brand={brand} />
        </Link>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="mt-4 border-t border-white/20 pt-4 text-sm">
          <p className="font-bold">{nama}</p>
          <p className="text-white/70">{role === "superadmin" ? "Superadmin" : "Admin komunitas"}</p>
          <div className="theme-dark mt-3">
            <ThemeToggle label className="w-full justify-start" />
          </div>
          <form action="/keluar" method="post" className="mt-2">
            <button className="inline-flex items-center gap-2 rounded-lg px-3 py-1 font-bold ring-1 ring-white/40 hover:bg-white/10">
              <Icon name="logout" className="h-4 w-4" /> Keluar
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
