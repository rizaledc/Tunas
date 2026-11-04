import { Icon, type IconName } from "@/components/icons";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ icon = "sprout", title, text, action }: { icon?: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-marun-50 text-marun-600">
        <Icon name={icon} className="h-9 w-9" />
      </span>
      <p className="text-lg font-bold">{title}</p>
      {text && <p className="max-w-sm text-ink-soft">{text}</p>}
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "green", icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "green" | "orange" | "blue" | "red" | "gray"; icon?: IconName }) {
  const tones = {
    green: "bg-marun-50 text-marun-600",
    orange: "bg-emas-300/25 text-emas-500",
    blue: "bg-ink/[0.045] text-ink",
    red: "bg-aksen-500/10 text-aksen-600",
    gray: "bg-ink/[0.045] text-ink-soft",
  };
  return (
    <div className="card">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
        {icon && (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-ink">{value}</div>
      {hint && <div className="mt-1 text-sm text-ink-soft">{hint}</div>}
    </div>
  );
}

export function Tabs({ items, active }: { items: Array<{ href: string; label: string; key: string }>; active: string }) {
  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
      {items.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap",
            t.key === active ? "bg-marun-600 text-white" : "bg-paper text-ink-soft ring-1 ring-gray-200",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export function Progress({ value, max, tone = "green" }: { value: number; max: number; tone?: "green" | "orange" | "red" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = tone === "green" ? "bg-marun-500" : tone === "orange" ? "bg-aksen-500" : "bg-merah-500";
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Placeholder({ label, icon = "camera", className }: { label: string; icon?: IconName; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-marun-100 via-marun-50 to-marun-50 text-marun-700", className)}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-marun-600 shadow-sm">
        <Icon name={icon} className="h-8 w-8" />
      </span>
      <span className="px-2 text-center text-xs font-semibold">{label}</span>
    </div>
  );
}
