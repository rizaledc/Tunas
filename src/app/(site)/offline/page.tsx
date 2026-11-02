import { Icon } from "@/components/icons";

export const metadata = { title: "Sedang offline" };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Icon name="wifi-off" className="mx-auto h-16 w-16 text-ink-soft" />
      <h1 className="mt-3 text-2xl font-extrabold">Sedang tidak ada sinyal</h1>
      <p className="mt-2 text-ink-soft">Periksa koneksi internet, lalu coba lagi. Catatan Anda aman.</p>
    </div>
  );
}
