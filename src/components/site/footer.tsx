import Link from "next/link";
import { Logo, TunasBadge } from "@/components/logo";
import { getSetting } from "@/lib/settings";

export async function SiteFooter() {
  const contact = await getSetting("public.contact");
  return (
    <footer className="bg-tunas-900 text-white/85">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-3 max-w-md text-sm">
            Sistem Aplikasi Harmoni Aktivitas dan Perilaku Anak — luaran Teknologi Tepat Guna PKM Telkom University bersama Komunitas TUNAS (Tunggu Anak Siap) Banyumas.
          </p>
          <p className="mt-3 text-sm">📍 {contact.address}</p>
          <p className="mt-1 text-sm">
            💬 WhatsApp:{" "}
            <a className="underline" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
              +{contact.whatsapp}
            </a>
          </p>
          <p className="mt-1 text-sm">✉️ {contact.email}</p>
        </div>
        <div>
          <p className="mb-2 font-extrabold text-white">Menu</p>
          <ul className="space-y-1 text-sm">
            {[
              ["/tentang", "Tentang Program"],
              ["/kegiatan", "Kegiatan"],
              ["/galeri", "Galeri"],
              ["/artikel", "Artikel & Tips"],
              ["/panduan", "Panduan"],
              ["/daftar", "Daftar"],
              ["/privasi", "Kebijakan Privasi"],
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
          <p className="mb-2 font-extrabold text-white">Mitra</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg bg-white px-3 py-2 text-sm font-extrabold text-telkom-500">Telkom University</span>
            <TunasBadge light />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} SAHABAT ANAK · Komunitas TUNAS Banyumas & PKM Telkom University ·{" "}
        <Link href="/privasi" className="underline">
          Privasi
        </Link>
      </div>
    </footer>
  );
}
