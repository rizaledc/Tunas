import { Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { dashboardKpis } from "@/lib/stats";
import { PageTitle, Stat } from "@/components/blocks";
import { TrendChart } from "@/components/charts";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ akses?: string }> }) {
  await requireAdmin();
  const { akses } = await searchParams;
  const k = await dashboardKpis();
  const hidden = `Disembunyikan (< ${k.minFamilies} keluarga)`;
  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" subtitle="Angka gabungan komunitas, tanpa data per keluarga." />
      {akses === "ditolak" && <p className="rounded-xl bg-red-50 p-3 font-semibold text-merah-600">Menu tersebut khusus superadmin.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon="home" label="Keluarga terdaftar" value={k.families} />
        <Stat icon="child" label="Anak terdaftar" value={k.children} />
        <Stat icon="device" label="Pengguna aktif 7 hari" value={k.active7} tone="blue" />
        <Stat icon="note" label="Catatan minggu ini" value={k.logsWeek} tone="orange" />
        <Stat icon="clock" label="Rata-rata screen time" value={k.avgScreen !== null ? `${k.avgScreen} mnt/hari` : "–"} hint={k.avgScreen === null ? hidden : "per anak per hari tercatat, 7 hari"} tone="blue" />
        <Stat icon="scale" label="Digital : positif (mnt)" value={k.ratio ?? "–"} hint={k.ratio === null ? hidden : "rata-rata per anak-hari"} />
        <Stat icon="sparkle" label="Insight dibuat" value={k.insights} hint={`${k.insightsWeek} minggu ini`} tone="orange" />
      </div>
      <section className="card">
        <h2 className="font-extrabold">Tren 8 minggu</h2>
        <p className="text-sm text-ink-soft">Rata-rata menit per anak-hari; minggu dengan kurang dari {k.minFamilies} keluarga ditampilkan 0.</p>
        <TrendChart
          data={k.trend}
          lines={[
            { key: "screen", name: "Screen time", color: "#333333" },
            { key: "positif", name: "Aktivitas positif", color: "#940000" },
            { key: "keluarga", name: "Keluarga mencatat", color: "#e8b54d" },
          ]}
        />
      </section>
      <section className="card">
        <h2 className="mb-2 flex items-center gap-2 font-extrabold"><Icon name="warning" className="text-aksen-500" /> Peringatan</h2>
        {k.alerts.length ? (
          <ul className="list-disc space-y-1 pl-5">
            {k.alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft">Tidak ada peringatan.</p>
        )}
      </section>
    </div>
  );
}
