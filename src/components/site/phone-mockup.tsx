import { Icon } from "@/components/icons";

/** Mockup HP bergaya gelap yang menggambarkan beranda aplikasi. */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[17rem] rounded-[2.75rem] border-[10px] border-gelap-900 bg-gelap-900 shadow-[0_40px_80px_-30px_rgba(60,0,0,0.6)]" aria-label="Contoh tampilan aplikasi">
      <div className="overflow-hidden rounded-[2rem] bg-surface">
        <div className="theme-dark bg-gradient-to-br from-marun-700 to-marun-900 px-4 pt-5 pb-10 text-ink">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-ink/25" />
          <p className="text-[10px] font-semibold tracking-[0.2em] text-ink/60 uppercase">Selasa, 3 November</p>
          <p className="mt-1 text-[15px] font-extrabold tracking-tight">Ringkasan Dika hari ini</p>
        </div>
        <div className="-mt-7 space-y-2 px-3 pb-3">
          <div className="rounded-2xl bg-paper p-3 shadow-sm">
            <p className="flex items-center gap-1 text-[10px] font-bold text-ink-soft">
              <Icon name="device" className="h-3 w-3 text-marun-600" /> Screen time
            </p>
            <p className="mt-0.5 text-lg font-extrabold tracking-tight">
              75 <span className="text-xs font-semibold text-ink-soft">/ 120 menit</span>
            </p>
            <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 w-3/5 rounded-full bg-marun-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-paper p-3 shadow-sm">
              <p className="text-[10px] font-bold text-ink-soft">Aktivitas positif</p>
              <p className="text-base font-extrabold">90 mnt</p>
            </div>
            <div className="theme-dark rounded-2xl bg-gelap-900 p-3 text-ink">
              <p className="text-[10px] font-bold text-ink/60">Seimbang</p>
              <p className="text-base font-extrabold text-gold">55%</p>
            </div>
          </div>
          <div className="rounded-2xl bg-paper p-3 shadow-sm">
            <p className="flex items-center gap-1 text-[10px] font-bold text-marun-700">
              <Icon name="sparkle" className="h-3 w-3" /> Insight minggu ini
            </p>
            <p className="mt-0.5 text-[10px] leading-snug text-ink-soft">Dika makin sering menggambar. Coba ajak ngobrol tentang gambarnya.</p>
          </div>
        </div>
        <div className="flex items-end justify-around border-t border-ink/5 bg-paper px-2 pt-2 pb-3 text-ink-soft">
          <Icon name="home" className="h-4 w-4 text-marun-600" />
          <Icon name="list" className="h-4 w-4" />
          <span className="-mt-5 flex h-9 w-9 items-center justify-center rounded-full bg-aksen-500 text-white shadow">
            <Icon name="plus" className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <Icon name="chart" className="h-4 w-4" />
          <Icon name="user" className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
