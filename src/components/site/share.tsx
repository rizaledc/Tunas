"use client";
import { useState, useSyncExternalStore } from "react";
import { Icon, type IconName } from "@/components/icons";

/** Tombol bagikan: WhatsApp, Facebook, X, Telegram, salin tautan, dan menu bagikan bawaan HP. */
export function ShareButtons({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(
    () => () => {},
    () => "share" in navigator,
    () => false,
  );
  const url = () => `${window.location.origin}${path}`;
  const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer");
  const items: Array<{ label: string; icon: IconName; className: string; onClick: () => void }> = [
    { label: "WhatsApp", icon: "chat", className: "bg-[#128C4A] text-white hover:bg-[#0E7A3F]", onClick: () => open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url()}`)}`) },
    { label: "Facebook", icon: "share", className: "bg-[#1877F2] text-white", onClick: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`) },
    { label: "X", icon: "send", className: "bg-black text-white", onClick: () => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}`) },
    { label: "Telegram", icon: "send", className: "bg-[#229ED9] text-white", onClick: () => open(`https://t.me/share/url?url=${encodeURIComponent(url())}&text=${encodeURIComponent(title)}`) },
    {
      label: copied ? "Tersalin!" : "Salin tautan",
      icon: copied ? "check" : "copy",
      className: "bg-paper text-ink ring-1 ring-gray-200",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(url());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Salin tautan ini:", url());
        }
      },
    },
  ];
  return (
    <div className="mt-8 border-t pt-5">
      <p className="mb-3 flex items-center gap-2 font-extrabold">
        <Icon name="share" className="text-marun-600" /> Bagikan
      </p>
      <div className="flex flex-wrap gap-2">
        {canNativeShare && (
          <button type="button" className="btn-sm btn bg-marun-600 text-white" onClick={() => navigator.share({ title, url: url() }).catch(() => {})}>
            <Icon name="share" className="h-4 w-4" /> Bagikan…
          </button>
        )}
        {items.map((it) => (
          <button key={it.label} type="button" onClick={it.onClick} className={`btn-sm btn ${it.className}`}>
            <Icon name={it.icon} className="h-4 w-4" /> {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
