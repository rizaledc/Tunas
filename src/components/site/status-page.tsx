"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Logo, LogoMark } from "@/components/logo";

const PAGES = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/galeri", label: "Galeri" },
  { href: "/artikel", label: "Artikel" },
  { href: "/panduan", label: "Panduan" },
  { href: "/privasi", label: "Privasi" },
  { href: "/login", label: "Masuk" },
  { href: "/daftar", label: "Daftar" },
  { href: "/lupa-password", label: "Lupa password" },
];

function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Tebak halaman yang dimaksud dari alamat yang salah ketik, mis. /tentan → /tentang. */
export function suggestPage(path: string) {
  const seg = "/" + (path.toLowerCase().split(/[/?#]/).filter(Boolean)[0] ?? "");
  if (seg === "/") return null;
  let best: (typeof PAGES)[number] | null = null;
  let score = Infinity;
  for (const p of PAGES.slice(1)) {
    const s = distance(seg, p.href);
    if (s < score) [best, score] = [p, s];
  }
  return best && score <= Math.max(2, Math.floor(best.href.length / 3)) && best.href !== path ? best : null;
}

type Props = {
  code: string;
  eyebrow: string;
  title: string;
  text: string;
  /** Tampilkan saran halaman & tautan cepat (untuk 404). */
  notFound?: boolean;
  onRetry?: () => void;
  reference?: string;
};

export function StatusPage({ code, eyebrow, title, text, notFound, onRetry, reference }: Props) {
  const path = usePathname() ?? "";
  const router = useRouter();
  const hint = notFound ? suggestPage(path) : null;
  return (
    <div className="sa-dark-texture relative flex min-h-dvh flex-col overflow-hidden text-white">
      <LogoMark tile={false} onDark className="pointer-events-none absolute right-[-6rem] bottom-[-5rem] h-[26rem] w-[26rem] opacity-[0.07] md:h-[34rem] md:w-[34rem]" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5">
        <Link href="/" aria-label="SAHABAT ANAK, beranda" className="min-w-0">
          <Logo light />
        </Link>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-4 pb-16">
        <div className="max-w-2xl">
          <p className="display text-[5.5rem] leading-none text-aksen-400 md:text-[8rem]" aria-hidden>
            {code}
          </p>
          <p className="eyebrow mt-6 text-white/60">{eyebrow}</p>
          <h1 className="display mt-4 text-4xl leading-[1.05] md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-lg text-lg text-white/70">{text}</p>

          {notFound && path && (
            <p className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70">
              <span className="shrink-0 whitespace-nowrap">Alamat:</span> <code className="truncate font-semibold text-white">{path}</code>
            </p>
          )}

          {hint && (
            <p className="mt-6 text-white/80">
              Mungkin maksud Anda{" "}
              <Link href={hint.href} className="font-bold text-emas-300 underline decoration-emas-300/40 underline-offset-4 hover:decoration-emas-300">
                halaman {hint.label}
              </Link>
              ?
            </p>
          )}

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className="btn-primary px-7">
              <Icon name="home" className="h-5 w-5" /> Kembali ke Beranda
            </Link>
            {onRetry && (
              <button type="button" onClick={onRetry} className="btn rounded-full border border-white/25 px-6 text-white hover:bg-white/10">
                <Icon name="refresh" className="h-5 w-5" /> Coba lagi
              </button>
            )}
            <button type="button" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} className="btn rounded-full border border-white/25 px-6 text-white hover:bg-white/10">
              <Icon name="arrow-left" className="h-5 w-5" /> Halaman sebelumnya
            </button>
          </div>

          {notFound && (
            <nav className="mt-12 border-t border-white/10 pt-6" aria-label="Halaman lain">
              <p className="eyebrow text-white/45">Atau kunjungi</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {PAGES.slice(1, 7).map((p) => (
                  <li key={p.href}>
                    <Link href={p.href} className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-aksen-400 hover:text-white">
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {reference && <p className="mt-10 text-xs text-white/40">Kode referensi: {reference}. Sebutkan kode ini jika menghubungi pengurus.</p>}
        </div>
      </main>
    </div>
  );
}
