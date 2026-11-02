import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import { getSettings } from "@/lib/settings";
import { DarkMedia, Eyebrow, Headline } from "@/components/site/parts";
import { AuthAside } from "@/components/site/auth-aside";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

function BackToSite({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Kembali ke website"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border py-2 pr-3.5 pl-2.5 text-[11px] font-bold tracking-[0.14em] whitespace-nowrap uppercase transition",
        dark ? "border-white/25 text-white hover:bg-white/10" : "border-gray-300 bg-white text-ink hover:border-marun-600 hover:text-marun-700",
      )}
    >
      <Icon name="arrow-left" className="h-4 w-4" aria-hidden /> <span className="max-[359px]:sr-only">Website</span>
    </Link>
  );
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings(["public.brand", "public.hero"]);
  const brand = s["public.brand"];
  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-start">
      {/* Panel merek (layar lebar) */}
      <DarkMedia src={s["public.hero"].image} className="sticky top-0 hidden h-dvh text-white lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-gelap-950/90 via-gelap-950/70 to-marun-900/80" />
        {!s["public.hero"].image && <LogoMark tile={false} onDark className="absolute right-[-5rem] bottom-[-4rem] h-[30rem] w-[30rem] opacity-10" />}
        <div className="relative flex h-full flex-col justify-between gap-8 overflow-y-auto p-10 xl:px-12">
          <Link href="/" aria-label="SAHABAT ANAK, beranda">
            <Logo light brand={brand} />
          </Link>
          <div>
            <Eyebrow>{brand.tagline}</Eyebrow>
            <Headline text="Dampingi dengan hati, seimbangkan bersama." className="mt-5 text-5xl [@media(min-height:960px)]:xl:text-6xl" />
            <p className="mt-5 max-w-sm text-white/65">Catat aktivitas si kecil dalam satu menit, lihat polanya, lalu putuskan sendiri langkah pendampingan terbaik.</p>
          </div>
          <AuthAside />
        </div>
      </DarkMedia>

      <div className="flex min-h-dvh min-w-0 flex-col">
        {/* Kepala seluler */}
        <header className="sa-dark-texture px-5 pt-5 pb-20 text-white lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" aria-label="SAHABAT ANAK, beranda" className="min-w-0">
              <Logo light small brand={brand} />
            </Link>
            <BackToSite dark />
          </div>
          <p className="display mt-8 text-[1.7rem] leading-[1.05]">
            Dampingi dengan hati, <span className="text-aksen-400">seimbangkan bersama.</span>
          </p>
        </header>
        <div className="hidden justify-end px-8 pt-6 lg:flex">
          <BackToSite />
        </div>
        <main className="relative mx-auto -mt-12 flex w-full max-w-md flex-1 flex-col px-4 pb-12 sm:px-5 lg:mt-0 lg:justify-center lg:py-10">{children}</main>
      </div>
    </div>
  );
}
