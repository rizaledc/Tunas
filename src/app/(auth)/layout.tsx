import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import { getSettings } from "@/lib/settings";
import { DarkMedia, Eyebrow, Headline } from "@/components/site/parts";
import { AuthAside } from "@/components/site/auth-aside";

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

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 py-5 lg:hidden">
          <Link href="/" aria-label="Kembali ke beranda">
            <Logo brand={brand} />
          </Link>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-12 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
