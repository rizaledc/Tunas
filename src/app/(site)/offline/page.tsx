import { Icon } from "@/components/icons";

export const metadata = { title: "Sedang offline" };

export default function OfflinePage() {
  return (
    <div className="sa-texture flex min-h-[80vh] items-center justify-center px-4 pt-24 text-ink">
      <div className="max-w-md text-center">
        <Icon name="wifi-off" className="mx-auto h-14 w-14 text-hl" />
        <h1 className="display mt-6 text-4xl">Sedang tidak ada sinyal</h1>
        <p className="mt-3 text-ink/65">Periksa koneksi internet, lalu coba lagi. Catatan Anda aman.</p>
      </div>
    </div>
  );
}
