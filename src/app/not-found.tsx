import Link from "next/link";
import { Icon } from "@/components/icons";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="sa-dark-texture flex min-h-dvh items-center justify-center px-4 text-white">
      <div className="max-w-md text-center">
        <LogoMark tile={false} onDark className="mx-auto h-20 w-20" />
        <p className="eyebrow mt-8 text-aksen-400">Galat 404</p>
        <h1 className="display mt-4 text-5xl">Halaman tidak ditemukan</h1>
        <p className="mt-4 text-white/65">Mungkin tautannya sudah berubah atau halaman ini sudah dipindahkan.</p>
        <Link href="/" className="btn-primary mt-8 px-7">
          Kembali ke Beranda <Icon name="arrow-right" className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
