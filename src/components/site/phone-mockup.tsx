import { Icon } from "@/components/icons";

/** Mockup HP sederhana yang menggambarkan beranda aplikasi. */
export function PhoneMockup() {
  return (
    <div className="mx-auto w-64 rounded-[2.5rem] border-[10px] border-ink bg-white p-3 shadow-2xl" aria-label="Contoh tampilan aplikasi">
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-gray-300" />
      <p className="text-xs font-semibold text-ink-soft">Halo, Bunda</p>
      <p className="text-sm font-extrabold">Ringkasan Dika hari ini</p>
      <div className="mt-2 rounded-xl bg-blue-50 p-2">
        <p className="text-[11px] font-semibold text-sky-brand">Screen time</p>
        <p className="text-lg font-extrabold">75 / 120 mnt</p>
        <div className="mt-1 h-2 rounded-full bg-white">
          <div className="h-2 w-3/5 rounded-full bg-sky-brand" />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-tunas-50 p-2">
          <p className="text-[11px] font-semibold text-tunas-700">Aktivitas positif</p>
          <p className="font-extrabold">90 mnt</p>
        </div>
        <div className="rounded-xl bg-orange-50 p-2">
          <p className="text-[11px] font-semibold text-oranye-600">Seimbang</p>
          <p className="font-extrabold">55%</p>
        </div>
      </div>
      <div className="mt-2 rounded-xl border border-tunas-100 p-2">
        <p className="flex items-center gap-1 text-[11px] font-bold text-tunas-700"><Icon name="sparkle" className="h-3 w-3" /> Insight minggu ini</p>
        <p className="text-[11px] text-ink-soft">Dika makin sering menggambar. Coba ajak ngobrol tentang gambarnya…</p>
      </div>
      <div className="mt-3 flex items-end justify-around border-t pt-2 text-[10px] text-ink-soft">
        <Icon name="home" className="h-4 w-4 text-tunas-600" />
        <Icon name="list" className="h-4 w-4" />
        <span className="-mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-oranye-500 text-white"><Icon name="plus" className="h-5 w-5" strokeWidth={2.5} /></span>
        <Icon name="chart" className="h-4 w-4" />
        <Icon name="user" className="h-4 w-4" />
      </div>
    </div>
  );
}
