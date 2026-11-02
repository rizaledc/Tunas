"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Photo = { id: string; url: string; caption: string | null; category: string };
const CATS: Record<string, string> = { "": "Semua", anak: "Anak", orang_tua: "Orang Tua", pembinaan: "Pembinaan", lele: "Lele" };

export function GalleryGrid({ photos, limit }: { photos: Photo[]; limit?: number }) {
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
            className={cn("rounded-full px-4 py-2 text-sm font-bold", cat === k ? "bg-tunas-600 text-white" : "bg-white text-ink-soft ring-1 ring-gray-200")}
          >
            {v}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="card text-center text-ink-soft">Belum ada foto di kategori ini.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <button key={p.id} onClick={() => setOpen(i)} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              <Image src={p.url} alt={p.caption ?? "Foto kegiatan"} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition group-hover:scale-105" />
              {p.caption && <span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-left text-xs text-white">{p.caption}</span>}
            </button>
          ))}
        </div>
      )}
      {open !== null && list[open] && (
        <div role="dialog" aria-modal="true" aria-label="Pratinjau foto" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={list[open].url} alt={list[open].caption ?? "Foto kegiatan"} fill sizes="100vw" className="object-contain" />
          </div>
          {list[open].caption && <p className="absolute bottom-6 px-4 text-center text-white">{list[open].caption}</p>}
          <button className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xl font-bold" aria-label="Tutup" onClick={() => setOpen(null)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
