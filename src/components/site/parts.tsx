import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Pecah judul menjadi bagian biasa + bagian sorotan (setelah koma/titik terakhir, atau kata terakhir). */
export function splitHighlight(text: string): [string, string] {
  const t = text.trim();
  const m = t.match(/^(.*[,.;:!?])\s+(\S.*)$/);
  if (m) return [m[1], m[2]];
  const i = t.lastIndexOf(" ");
  return i > 0 ? [t.slice(0, i), t.slice(i + 1)] : ["", t];
}

/** Judul editorial: bagian akhir berwarna merah Telkom. */
export function Headline({ text, as: As = "h2", className, light = true, breakLine = true }: { text: string; as?: "h1" | "h2" | "h3"; className?: string; light?: boolean; breakLine?: boolean }) {
  const [a, b] = splitHighlight(text);
  return (
    <As className={cn("display", light ? "text-white" : "text-ink", className)}>
      {a && (
        <>
          {a}
          {breakLine ? <br /> : " "}
        </>
      )}
      <span className={light ? "text-aksen-400" : "text-marun-600"}>{b}</span>
    </As>
  );
}

export function Eyebrow({ children, light = true, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3", light ? "text-white/60" : "text-marun-600", className)}>
      <span className={cn("h-px w-8", light ? "bg-aksen-400" : "bg-marun-500")} aria-hidden />
      {children}
    </p>
  );
}

/** Tombol gaya referensi: lingkaran berpanah + label huruf kapital. */
export function ArrowLink({ href, children, light = true, className }: { href: string; children: ReactNode; light?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-4", className)}>
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border transition duration-300 group-hover:bg-aksen-500 group-hover:border-aksen-500 group-hover:text-white",
          light ? "border-aksen-400 text-aksen-400" : "border-marun-600 text-marun-600",
        )}
      >
        <Icon name="arrow-right" className="h-5 w-5 transition group-hover:translate-x-0.5" />
      </span>
      <span className={cn("eyebrow", light ? "text-white" : "text-ink")}>{children}</span>
    </Link>
  );
}

/** Pita gelap pembuka untuk halaman dalam (Tentang, Kegiatan, Artikel, dll.). */
export function PageHero({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <section className="sa-dark-texture relative overflow-hidden text-white">
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-16 md:pt-40 md:pb-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Headline as="h1" text={title} className="mt-5 text-4xl md:text-6xl" />
        {text && <p className="mt-5 max-w-2xl text-lg text-white/70">{text}</p>}
        {children}
      </div>
    </section>
  );
}

/** Latar gambar gelap: foto bila ada, tekstur marun bila belum ada. */
export function DarkMedia({ src, alt, className, children, sizes = "100vw", priority }: { src?: string | null; alt?: string; className?: string; children?: ReactNode; sizes?: string; priority?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden", !src && "sa-dark-texture", className)}>
      {src && <Image src={src} alt={alt ?? ""} fill sizes={sizes} priority={priority} className="object-cover" />}
      {children}
    </div>
  );
}
