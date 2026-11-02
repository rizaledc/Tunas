import Link from "next/link";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { getSetting } from "@/lib/settings";

export async function SiteFooter() {
  const [contact, brand, landing] = await Promise.all([getSetting("public.contact"), getSetting("public.brand"), getSetting("public.landing")]);
  return (
    <footer className="relative overflow-hidden bg-gelap-950 text-white/70">
      <div className="h-1 bg-gradient-to-r from-marun-700 via-aksen-500 to-marun-700" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo light brand={brand} />
          <p className="mt-6 max-w-sm text-sm leading-relaxed">{landing.footer_text}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {contact.address && (
              <li className="flex gap-3">
                <Icon name="pin" className="mt-0.5 h-4 w-4 text-aksen-400" /> {contact.address}
              </li>
            )}
            {contact.whatsapp && (
              <li className="flex items-center gap-3">
                <Icon name="chat" className="h-4 w-4 text-aksen-400" />
                <a className="hover:text-white" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  +{contact.whatsapp}
                </a>
              </li>
            )}
            {contact.email && (
              <li className="flex items-center gap-3">
                <Icon name="mail" className="h-4 w-4 text-aksen-400" /> {contact.email}
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5 text-white">Jelajahi</p>
          <ul className="space-y-3 text-sm">
            {[
              ["/tentang", "Tentang"],
              ["/kegiatan", "Kegiatan"],
              ["/galeri", "Galeri"],
              ["/artikel", "Artikel & Tips"],
              ["/panduan", "Panduan"],
            ].map(([h, l]) => (
              <li key={h}>
                <Link href={h} className="transition hover:text-white">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5 text-white">Aplikasi</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/login" className="inline-flex items-center gap-2 transition hover:text-white">
                <Icon name="user" className="h-4 w-4 text-emas-400" /> Masuk
              </Link>
            </li>
            <li>
              <Link href="/daftar" className="inline-flex items-center gap-2 transition hover:text-white">
                <Icon name="plus" className="h-4 w-4 text-emas-400" /> Daftar dengan kode undangan
              </Link>
            </li>
            <li>
              <Link href="/privasi" className="inline-flex items-center gap-2 transition hover:text-white">
                <Icon name="shield" className="h-4 w-4 text-emas-400" /> Kebijakan privasi
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4">
        <p className="display pointer-events-none -mb-3 select-none whitespace-nowrap text-[13.5vw] leading-[0.8] text-white/[0.05] lg:text-[9.6rem]" aria-hidden>
          SAHABAT ANAK
        </p>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-white/45">
          <span>© {new Date().getFullYear()} SAHABAT ANAK</span>
          <a href="https://kodinginaja.biz.id/" target="_blank" rel="noopener" className="group inline-flex items-center gap-2 text-white/55 transition hover:text-white">
            <span>Support by:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.google.com/s2/favicons?domain=kodinginaja.biz.id&sz=64" alt="" width={18} height={18} loading="lazy" className="h-[18px] w-[18px] rounded bg-white/90 p-px" />
            <span className="font-semibold text-white/80 group-hover:text-white">Kodinginaja.biz.id</span>
          </a>
          <Link href="/privasi" className="hover:text-white">
            Privasi & persetujuan data
          </Link>
        </div>
      </div>
    </footer>
  );
}
