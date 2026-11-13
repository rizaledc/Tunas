"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Logo, type Brand } from "@/components/logo";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/galeri", label: "Galeri" },
  { href: "/artikel", label: "Artikel" },
  { href: "/panduan", label: "Panduan" },
];

export function SiteHeader({ brand }: { brand?: Brand }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const solid = scrolled || open;

  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 text-ink transition-colors duration-300", solid ? "border-b border-ink/10 bg-surface/85 backdrop-blur-xl" : "bg-surface/70 backdrop-blur-md")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-5">
        <Link href="/" aria-label="SAHABAT ANAK, beranda">
          <Logo auto brand={brand} />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Menu utama">
          {MENU.map((m) => {
            const active = m.href === "/" ? path === "/" : path.startsWith(m.href);
            return (
              <Link key={m.href} href={m.href} className={cn("relative py-2 text-[12px] font-semibold tracking-[0.18em] uppercase transition hover:text-ink", active ? "text-ink" : "text-ink/65")}>
                {m.label}
                {active && <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-px w-5 bg-hl" />}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
                <Link href="/login" className="hidden shrink-0 items-center gap-3 rounded-full border border-hl/70 py-2.5 pr-3 pl-5 whitespace-nowrap text-[12px] font-semibold tracking-[0.18em] text-ink uppercase transition hover:border-hijau-700 hover:bg-hijau-700 hover:text-white lg:inline-flex">
          Masuk / Daftar <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
                  <button className="rounded-full border border-ink/20 p-2.5" aria-expanded={open} aria-label={open ? "Tutup menu" : "Buka menu"} onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
        </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-ink/10 px-4 pt-2 pb-6 lg:hidden" aria-label="Menu utama seluler">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-ink/10 py-4 text-sm font-semibold tracking-[0.18em] uppercase">
              {m.label}
              <Icon name="chevron-right" className="h-4 w-4 text-ink/60" />
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="btn-primary mt-5 w-full">
            Masuk / Daftar <Icon name="arrow-right" className="h-5 w-5" />
          </Link>
        </nav>
      )}
    </header>
  );
}
