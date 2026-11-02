"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Placeholder } from "@/components/blocks";

type Item = { slug: string; title: string; dateLabel: string; cover: string | null };

export function EventSlider({ items }: { items: Item[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);
  if (!items.length) return <Placeholder label="Kegiatan unggulan akan tampil di sini" icon="🎉" className="aspect-[16/10] rounded-2xl" />;
  const it = items[i];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="relative aspect-[16/10]">
        {it.cover ? (
          <Image src={it.cover} alt={it.title} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
        ) : (
          <Placeholder label="Foto kegiatan" icon="🎨" className="h-full w-full" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
          <p className="text-sm font-semibold">{it.dateLabel}</p>
          <p className="text-xl font-extrabold">{it.title}</p>
          <Link href={`/kegiatan/${it.slug}`} className="btn-primary btn-sm mt-2">
            Lihat Detail
          </Link>
        </div>
      </div>
      {items.length > 1 && (
        <>
          <button aria-label="Sebelumnya" onClick={() => setI((i - 1 + items.length) % items.length)} className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 font-bold">
            ‹
          </button>
          <button aria-label="Berikutnya" onClick={() => setI((i + 1) % items.length)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 font-bold">
            ›
          </button>
          <div className="absolute top-3 right-3 flex gap-1">
            {items.map((_, k) => (
              <span key={k} className={`h-2 w-2 rounded-full ${k === i ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
