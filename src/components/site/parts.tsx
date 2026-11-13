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
// `light` dipertahankan untuk kompatibilitas; warna kini mengikuti mode terang/gelap.
export function Headline({ text, as: As = "h2", className, breakLine = true }: { text: string; as?: "h1" | "h2" | "h3"; className?: string; light?: boolean; breakLine?: boolean }) {
  const [a, b] = splitHighlight(text);
  return (
    <As className={cn("display text-ink", className)}>
      {a && (
        <>
          {a}
          {breakLine ? <br /> : " "}
        </>
      )}
      <span className="text-hl">{b}</span>
    </As>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-ink/65", className)}>
      <span className="h-px w-8 bg-hl" aria-hidden />
      {children}
    </p>
  );
}

/** Tombol gaya referensi: lingkaran berpanah + label huruf kapital. */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; light?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-4", className)}>
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border border-hl text-hl transition duration-300 group-hover:border-hijau-700 group-hover:bg-hijau-700 group-hover:text-white",
        )}
      >
        <Icon name="arrow-right" className="h-5 w-5 transition group-hover:translate-x-0.5" />
      </span>
      <span className="eyebrow text-ink">{children}</span>
    </Link>
  );
}

/** Pita gelap pembuka untuk halaman dalam (Tentang, Kegiatan, Artikel, dll.). */
export function PageHero({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <section className="sa-texture relative overflow-hidden text-ink">
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-16 md:pt-40 md:pb-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Headline as="h1" text={title} className="mt-5 text-4xl md:text-6xl" />
        {text && <p className="mt-5 max-w-2xl text-lg text-ink/70">{text}</p>}
        {children}
      </div>
    </section>
  );
}

/** Latar gambar: foto (selalu bergaya gelap agar teks terbaca) atau tekstur yang ikut mode terang/gelap. */
export function DarkMedia({ src, alt, className, children, sizes = "100vw", priority }: { src?: string | null; alt?: string; className?: string; children?: ReactNode; sizes?: string; priority?: boolean }) {
  return (
    // Jangan gabungkan "relative" dengan pemosisian "absolute" dari pemanggil: tingginya akan nol.
    <div className={cn(/\b(absolute|fixed|sticky)\b/.test(className ?? "") ? "" : "relative", "overflow-hidden", src ? "theme-dark" : "sa-texture", className)}>
      {src && <Image src={src} alt={alt ?? ""} fill sizes={sizes} priority={priority} className="object-cover" />}
      {children}
    </div>
  );
}
