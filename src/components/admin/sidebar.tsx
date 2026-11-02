"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const MENU: Array<{ href: string; label: string; icon: string; superOnly?: boolean }> = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/anggota", label: "Anggota", icon: "👥" },
  { href: "/admin/statistik", label: "Statistik", icon: "📊" },
  { href: "/admin/laporan", label: "Laporan", icon: "📄" },
  { href: "/admin/konten", label: "Konten", icon: "🖼️" },
  { href: "/admin/kegiatan", label: "Kegiatan", icon: "📅" },
  { href: "/admin/evaluasi", label: "Evaluasi", icon: "📝" },
  { href: "/admin/impor", label: "Impor Logbook", icon: "📥", superOnly: true },
  { href: "/admin/insight", label: "Monitoring AI", icon: "✨", superOnly: true },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: "⚙️", superOnly: true },
  { href: "/admin/log", label: "Log", icon: "🧾", superOnly: true },
];

export function AdminSidebar({ role, nama }: { role: string; nama: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = MENU.filter((m) => !m.superOnly || role === "superadmin");
  const nav = (
    <nav className="space-y-1" aria-label="Menu admin">
      {items.map((m) => {
        const active = m.href === "/admin" ? path === "/admin" : path.startsWith(m.href);
        return (
          <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold", active ? "bg-white text-sky-brand" : "text-white/90 hover:bg-white/10")}>
            <span aria-hidden>{m.icon}</span>
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <>
      <div className="no-print sticky top-0 z-40 flex items-center justify-between bg-sky-brand px-4 py-3 text-white lg:hidden">
        <Logo light small />
        <button onClick={() => setOpen(!open)} className="rounded-lg px-3 py-1 font-bold ring-1 ring-white/40" aria-expanded={open}>
          Menu
        </button>
      </div>
      {open && <div className="no-print bg-sky-brand px-4 pb-4 lg:hidden">{nav}</div>}
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 flex-col bg-sky-brand p-4 text-white lg:flex">
        <Link href="/admin" className="mb-6 block">
          <Logo light />
        </Link>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="mt-4 border-t border-white/20 pt-4 text-sm">
          <p className="font-bold">{nama}</p>
          <p className="text-white/70">{role === "superadmin" ? "Superadmin (Tim PKM)" : "Admin komunitas"}</p>
          <form action="/keluar" method="post" className="mt-2">
            <button className="rounded-lg px-3 py-1 font-bold ring-1 ring-white/40 hover:bg-white/10">Keluar</button>
          </form>
        </div>
      </aside>
    </>
  );
}
