"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { THEME_KEY } from "@/lib/theme";


function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  try {
    if (dark) sessionStorage.setItem(THEME_KEY, "dark");
    else sessionStorage.removeItem(THEME_KEY);
  } catch {
    // penyimpanan diblokir: mode tetap berlaku sampai halaman dimuat ulang
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#060606" : "#940000");
}

export function ThemeToggle({ className, label = false }: { className?: string; label?: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener("sa-theme", sync);
    return () => window.removeEventListener("sa-theme", sync);
  }, []);
  const toggle = () => {
    apply(!dark);
    window.dispatchEvent(new Event("sa-theme"));
  };
  const text = dark ? "Mode terang" : "Mode gelap";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={text}
      aria-pressed={dark}
      title={text}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-ink/15 text-ink transition hover:border-ink/40 hover:bg-ink/5",
        label ? "px-4 py-2.5 text-sm font-semibold" : "h-10 w-10",
        className,
      )}
    >
      <Icon name={dark ? "sun" : "moon"} className="h-[18px] w-[18px]" />
      {label && <span>{text}</span>}
    </button>
  );
}
