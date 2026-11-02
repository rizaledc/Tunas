import { requireAdmin } from "@/lib/auth";
import { addDays, todayStr } from "@/lib/date";
import { PageTitle } from "@/components/blocks";

export const metadata = { title: "Laporan" };

export default async function LaporanPage() {
  const me = await requireAdmin();
  const month = todayStr().slice(0, 7);
  return (
    <div className="space-y-4">
      <PageTitle title="Laporan & Ekspor" subtitle="Unduh rekap dalam format Excel atau PDF." />
      <section className="card">
        <h2 className="font-extrabold">📊 Rekap bulanan komunitas</h2>
        <p className="text-sm text-ink-soft">Angka agregat; kelompok berisi kurang dari 5 keluarga disembunyikan.</p>
        <form action="/api/admin/laporan" className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="jenis" value="bulanan" />
          <label>
            <span className="label">Bulan</span>
            <input type="month" name="bulan" defaultValue={month} className="input" />
          </label>
          <button name="format" value="xlsx" className="btn-green">
            Excel
          </button>
          <button name="format" value="pdf" className="btn-outline">
            PDF
          </button>
        </form>
      </section>
      <section className="card">
        <h2 className="font-extrabold">📅 Rekap kehadiran kegiatan</h2>
        <form action="/api/admin/laporan" className="mt-3 flex flex-wrap gap-2">
          <input type="hidden" name="jenis" value="kehadiran" />
          <button name="format" value="xlsx" className="btn-green">
            Excel
          </button>
          <button name="format" value="pdf" className="btn-outline">
            PDF
          </button>
        </form>
      </section>
      {me.role === "superadmin" && (
        <section className="card">
          <h2 className="font-extrabold">🔬 Data anonim untuk artikel ilmiah</h2>
          <p className="text-sm text-ink-soft">Khusus superadmin. Kode anak/responden berupa pseudonim; tanpa nama, nomor HP, atau RT.</p>
          <form action="/api/admin/laporan" className="mt-3 flex flex-wrap items-end gap-2">
            <input type="hidden" name="jenis" value="anonim" />
            <label>
              <span className="label">Dari</span>
              <input type="date" name="dari" defaultValue={addDays(todayStr(), -89)} className="input" />
            </label>
            <label>
              <span className="label">Sampai</span>
              <input type="date" name="sampai" defaultValue={todayStr()} className="input" />
            </label>
            <button name="format" value="xlsx" className="btn-green">
              Excel
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
