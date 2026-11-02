"use client";
import { Icon } from "@/components/icons";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Photo = { id: string; url: string; caption: string | null; category: string };
const CATS: Record<string, string> = { "": "Semua", anak: "Anak", orang_tua: "Orang Tua", pembinaan: "Pembinaan", lele: "Lele" };

export function GalleryGrid({ photos, limit, dark = false }: { photos: Photo[]; limit?: number; dark?: boolean }) {
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const list = photos.filter((p) => !cat || p.category === cat).slice(0, limit ?? photos.length);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, list.length]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter kategori">
        {Object.entries(CATS).map(([k, v]) => (
          <button
            key={k}
            role="tab"
            aria-selected={cat === k}
            onClick={() => setCat(k)}
            className={cn(
              "rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.2em] uppercase transition",
              cat === k ? "bg-aksen-500 text-white" : dark ? "border border-white/15 text-white/70 hover:border-white/40" : "border border-black/10 bg-white text-ink-soft hover:border-black/30",
            )}
          >
            {v}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className={cn("rounded-3xl p-10 text-center", dark ? "border border-white/10 text-white/55" : "bg-white text-ink-soft")}>Belum ada foto di kategori ini.</p>
      ) : (
        <div className="grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <button key={p.id} onClick={() => setOpen(i)} className={cn("group relative overflow-hidden rounded-2xl bg-gelap-800", i % 5 === 0 && "row-span-2")}>
              <Image src={p.url} alt={p.caption ?? "Foto kegiatan"} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              {p.caption && <span className="absolute inset-x-0 bottom-0 translate-y-2 px-3 pb-3 text-left text-xs font-semibold text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">{p.caption}</span>}
            </button>
          ))}
        </div>
      )}
      {open !== null && list[open] && (
        <div role="dialog" aria-modal="true" aria-label="Pratinjau foto" className="fixed inset-0 z-50 flex items-center justify-center bg-gelap-950/95 p-4 backdrop-blur" onClick={() => setOpen(null)}>
          <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={list[open].url} alt={list[open].caption ?? "Foto kegiatan"} fill sizes="100vw" className="object-contain" />
          </div>
          {list[open].caption && <p className="absolute bottom-6 px-4 text-center text-white">{list[open].caption}</p>}
          <button className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-ink" aria-label="Tutup" onClick={() => setOpen(null)}>
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
