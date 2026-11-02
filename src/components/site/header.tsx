"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo, TunasBadge } from "@/components/logo";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/galeri", label: "Galeri" },
  { href: "/artikel", label: "Artikel" },
  { href: "/panduan", label: "Panduan" },
];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-sky-brand text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="SAHABAT ANAK — Beranda">
          <Logo light />
          <span className="hidden sm:inline">
            <TunasBadge light />
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu utama">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10",
                (m.href === "/" ? path === "/" : path.startsWith(m.href)) && "bg-white/15",
              )}
            >
              {m.label}
            </Link>
          ))}
          <Link href="/login" className="btn-primary btn-sm ml-2">
            Masuk / Daftar
          </Link>
        </nav>
        <button className="rounded-lg p-2 hover:bg-white/10 lg:hidden" aria-expanded={open} aria-label="Buka menu" onClick={() => setOpen(!open)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 px-4 pb-4 lg:hidden" aria-label="Menu utama seluler">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-bold hover:bg-white/10">
              {m.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">
            Masuk / Daftar
          </Link>
        </nav>
      )}
    </header>
  );
}
