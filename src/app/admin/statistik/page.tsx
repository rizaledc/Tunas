import { Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { filterChildren, groupStats, loadBase, type GroupStats } from "@/lib/stats";
import { addDays, todayStr } from "@/lib/date";
import { MIN_GROUP_FAMILIES } from "@/lib/privacy";
import { SCHOOL_LEVELS } from "@/lib/utils";
import { PageTitle, Stat } from "@/components/blocks";
import { Donut, SimpleBars } from "@/components/charts";

export const metadata = { title: "Statistik" };

function Hidden() {
  return (
    <div className="card bg-gray-50 text-center">
      <Icon name="lock" className="mx-auto h-10 w-10 text-ink-soft" />
      <p className="font-bold">Data disembunyikan</p>
      <p className="text-sm text-ink-soft">Kelompok ini berisi kurang dari {MIN_GROUP_FAMILIES} keluarga yang mencatat, sehingga angka tidak ditampilkan agar keluarga tidak bisa ditebak.</p>
    </div>
  );
}

function Row({ label, g }: { label: string; g: GroupStats }) {
  return (
    <tr>
      <td className="font-bold">{label}</td>
      {g.suppressed ? (
        <td colSpan={5} className="text-ink-soft">
          <span className="inline-flex items-center gap-1"><Icon name="lock" className="h-4 w-4" /> &lt; {MIN_GROUP_FAMILIES} keluarga</span>
        </td>
      ) : (
        <>
          <td>{g.families}</td>
          <td>{g.avgScreen} mnt</td>
          <td>{g.avgTarget ?? "-"} mnt</td>
          <td>{g.avgPositive} mnt</td>
          <td>{g.compliancePct}%</td>
        </>
      )}
    </tr>
  );
}

export default async function StatistikPage({ searchParams }: { searchParams: Promise<{ dari?: string; sampai?: string; jenjang?: string; rt?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const to = sp.sampai || todayStr();
  const from = sp.dari || addDays(to, -29);
  const base = await loadBase(from, to);
  const ids = filterChildren(base, { level: sp.jenjang, rt: sp.rt });
  const app = groupStats(base, ids, { source: "app" });
  const baseline = groupStats(base, ids, { source: "logbook_import" });
  const rts = [...new Set(base.families.map((f) => f.rt).filter(Boolean))].sort() as string[];

  return (
    <div className="space-y-6">
      <PageTitle title="Statistik Agregat" subtitle={`Kelompok hanya ditampilkan jika berisi minimal ${MIN_GROUP_FAMILIES} keluarga.`} />
      <form className="card grid grid-cols-2 gap-3 md:grid-cols-5">
        <label>
          <span className="label">Dari</span>
          <input type="date" name="dari" defaultValue={from} className="input" />
        </label>
        <label>
          <span className="label">Sampai</span>
          <input type="date" name="sampai" defaultValue={to} className="input" />
        </label>
        <label>
          <span className="label">Jenjang</span>
          <select name="jenjang" defaultValue={sp.jenjang ?? ""} className="input">
            <option value="">Semua</option>
            {Object.entries(SCHOOL_LEVELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">RT</span>
          <select name="rt" defaultValue={sp.rt ?? ""} className="input">
            <option value="">Semua</option>
            {rts.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button className="btn-green w-full">Terapkan</button>
        </div>
      </form>

      {app.suppressed ? (
        <Hidden />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon="clock" label="Rata-rata screen time" value={`${app.avgScreen} mnt`} hint={`target rata-rata ${app.avgTarget ?? "-"} mnt`} tone="blue" />
            <Stat icon="leaf" label="Rata-rata aktivitas positif" value={`${app.avgPositive} mnt`} hint="per anak per hari tercatat" />
            <Stat icon="agreement" label="Kepatuhan kesepakatan" value={`${app.compliancePct}%`} hint="hari-anak sesuai target" tone="orange" />
            <Stat icon="moon" label="Penggunaan malam" value={`${app.nightPct}%`} hint="menit gawai 21.00–04.00" tone="red" />
            <Stat icon="family" label="Didampingi" value={`${app.accompaniedPct}%`} hint="menit gawai didampingi" />
            <Stat icon="home" label="Keluarga dalam filter" value={app.families} hint={`${app.children} anak · ${app.childDays} hari-anak`} tone="gray" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card">
              <h2 className="font-extrabold">Komposisi tujuan gawai</h2>
              <Donut data={app.purposes} />
            </section>
            <section className="card">
              <h2 className="font-extrabold">Aktivitas positif terpopuler</h2>
              <SimpleBars data={app.positives.slice(0, 8)} unit=" mnt" />
            </section>
          </div>
          <section className="card">
            <h2 className="font-extrabold">Jam rawan (total menit gawai per jam mulai)</h2>
            <SimpleBars data={app.hours.filter((h) => h.value > 0)} color="var(--chart-ink)" unit=" mnt" />
          </section>
        </>
      )}

      <section className="card">
        <h2 className="font-extrabold">Sebelum vs sesudah (baseline logbook kertas vs aplikasi)</h2>
        {baseline.childDays === 0 ? (
          <p className="text-ink-soft">Belum ada data logbook kertas yang diimpor untuk periode/filter ini.</p>
        ) : baseline.suppressed || app.suppressed ? (
          <p className="flex items-center gap-1 text-ink-soft"><Icon name="lock" className="h-4 w-4" /> Salah satu kelompok berisi kurang dari {MIN_GROUP_FAMILIES} keluarga.</p>
        ) : (
          <table className="tbl mt-2">
            <thead>
              <tr>
                <th>Indikator</th>
                <th>Logbook kertas</th>
                <th>Aplikasi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rata-rata screen time/hari</td>
                <td>{baseline.avgScreen} mnt</td>
                <td>{app.avgScreen} mnt</td>
              </tr>
              <tr>
                <td>Rata-rata aktivitas positif/hari</td>
                <td>{baseline.avgPositive} mnt</td>
                <td>{app.avgPositive} mnt</td>
              </tr>
              <tr>
                <td>Didampingi</td>
                <td>{baseline.accompaniedPct}%</td>
                <td>{app.accompaniedPct}%</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-2 font-extrabold">Per jenjang dan per RT</h2>
        <table className="tbl">
          <thead>
            <tr>
              <th>Kelompok</th>
              <th>Keluarga</th>
              <th>Screen time</th>
              <th>Target</th>
              <th>Positif</th>
              <th>Patuh</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(SCHOOL_LEVELS).map(([k, v]) => (
              <Row key={k} label={`Jenjang ${v}`} g={groupStats(base, filterChildren(base, { level: k, rt: sp.rt }), { source: "app" })} />
            ))}
            {rts.map((r) => (
              <Row key={r} label={`RT ${r}`} g={groupStats(base, filterChildren(base, { rt: r, level: sp.jenjang }), { source: "app" })} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
