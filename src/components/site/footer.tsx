import Link from "next/link";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { getSetting } from "@/lib/settings";

export async function SiteFooter() {
  const [contact, brand, landing] = await Promise.all([getSetting("public.contact"), getSetting("public.brand"), getSetting("public.landing")]);
  return (
    <footer className="bg-daun-900 text-white/85">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light brand={brand} />
          <p className="mt-3 max-w-md text-sm">
            {landing.footer_text}
          </p>
          {contact.address && (
            <p className="mt-3 flex gap-2 text-sm">
              <Icon name="pin" className="mt-0.5 h-4 w-4" /> {contact.address}
            </p>
          )}
          {contact.whatsapp && (
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Icon name="chat" className="h-4 w-4" /> WhatsApp:{" "}
              <a className="underline" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                +{contact.whatsapp}
              </a>
            </p>
          )}
          {contact.email && (
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Icon name="mail" className="h-4 w-4" /> {contact.email}
            </p>
          )}
        </div>
        <div>
          <p className="mb-2 font-extrabold text-white">Menu</p>
          <ul className="space-y-1 text-sm">
            {[
              ["/tentang", "Tentang"],
              ["/kegiatan", "Kegiatan"],
              ["/galeri", "Galeri"],
              ["/artikel", "Artikel & Tips"],
              ["/panduan", "Panduan"],
            ].map(([h, l]) => (
              <li key={h}>
                <Link href={h} className="hover:underline">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-extrabold text-white">Aplikasi</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/login" className="inline-flex items-center gap-2 hover:underline">
                <Icon name="user" className="h-4 w-4" /> Masuk
              </Link>
            </li>
            <li>
              <Link href="/daftar" className="inline-flex items-center gap-2 hover:underline">
                <Icon name="plus" className="h-4 w-4" /> Daftar dengan kode undangan
              </Link>
            </li>
            <li>
              <Link href="/privasi" className="inline-flex items-center gap-2 hover:underline">
                <Icon name="shield" className="h-4 w-4" /> Kebijakan privasi
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} SAHABAT ANAK ·{" "}
        <Link href="/privasi" className="underline">
          Privasi
        </Link>
      </div>
    </footer>
  );
}
