import { requireParent } from "@/lib/auth";
import { getActiveChild, getAgreement, getCategories } from "@/lib/parent";
import { createClient } from "@/lib/supabase/server";
import { addDays, dateRange, formatMenit, formatTanggal, startOfWeek, todayStr } from "@/lib/date";
import { composition, dailyTotals, sumBy, type LogRow } from "@/lib/indicators";
import { PageTitle, Tabs } from "@/components/blocks";
import { Donut, ScreenTimeChart } from "@/components/charts";
import { LeanMeter } from "@/components/app/lean-meter";
import { cn } from "@/lib/utils";
import { NoChild } from "../no-child";

export const metadata = { title: "Analitik" };

function Delta({ now, before, invert = false, unit = "mnt" }: { now: number; before: number; invert?: boolean; unit?: string }) {
  if (!before) return <span className="text-xs text-ink-soft">belum ada pembanding</span>;
  const d = Math.round(((now - before) / before) * 100);
  const good = invert ? d <= 0 : d >= 0;
  return (
    <span className={cn("text-sm font-bold", good ? "text-hijau-700" : "text-merah-600")}>
      {d >= 0 ? "▲" : "▼"} {Math.abs(d)}% <span className="font-normal text-ink-soft">dari {before} {unit}</span>
    </span>
  );
}

export default async function AnalitikPage({ searchParams }: { searchParams: Promise<{ rentang?: string }> }) {
  const parent = await requireParent();
  const { child } = await getActiveChild(parent.familyId);
  if (!child) return <NoChild />;
  const { rentang } = await searchParams;
  const month = rentang === "bulan";
  const today = todayStr();
  const span = month ? 30 : 7;
  const start = addDays(today, -(span - 1));
  const calStart = startOfWeek(addDays(today, -34));

  const supabase = await createClient();
  const [agreement, cats, { data }] = await Promise.all([
    getAgreement(child.id),
    getCategories(true),
    supabase
      .from("activity_logs")
      .select("log_date,type,category_id,duration_min,accompanied,follows_agreement,start_at,end_at")
      .eq("child_id", child.id)
      .gte("log_date", calStart < addDays(today, -13) ? calStart : addDays(today, -13)),
  ]);
  const logs = (data ?? []) as LogRow[];
  const target = agreement?.target_screen_min ?? 120;
  const inRange = logs.filter((l) => l.log_date >= start);
  const daily = dailyTotals(inRange, dateRange(start, today)).map((d) => ({
    ...d,
    label: month ? formatTanggal(d.date, { day: "numeric" }) : formatTanggal(d.date, { weekday: "short" }),
  }));
  const purposes = composition(inRange, cats, "digital").map((c) => ({ name: c.name, value: c.minutes }));
  const positives = composition(inRange, cats, "positif").map((c) => ({ name: c.name, value: c.minutes }));

  const thisWeek = logs.filter((l) => l.log_date >= addDays(today, -6));
  const lastWeek = logs.filter((l) => l.log_date >= addDays(today, -13) && l.log_date <= addDays(today, -7));
  const avg = (rows: LogRow[], type: "digital" | "positif") => {
    const d = new Set(rows.map((r) => r.log_date)).size;
    return d ? Math.round(sumBy(rows.filter((r) => r.type === type), (r) => r.duration_min) / d) : 0;
  };
  const filled = new Set(logs.map((l) => l.log_date));
  const calendar = dateRange(calStart, today);
  const overDays = daily.filter((d) => d.digital > target).length;

  return (
    <div className="space-y-4">
      <PageTitle title="Analitik" subtitle={child.nickname} />
      <Tabs
        active={month ? "bulan" : "minggu"}
        items={[
          { key: "minggu", label: "7 hari", href: "/app/analitik" },
          { key: "bulan", label: "30 hari", href: "/app/analitik?rentang=bulan" },
        ]}
      />

      <LeanMeter
        digital={inRange.filter((l) => l.type === "digital").reduce((a, l) => a + l.duration_min, 0)}
        positif={inRange.filter((l) => l.type === "positif").reduce((a, l) => a + l.duration_min, 0)}
        period={month ? "30 hari terakhir" : "7 hari terakhir"}
      />

      <section className="card">
        <h2 className="font-extrabold">Screen time harian vs target</h2>
        <p className="text-sm text-ink-soft">
          {overDays} dari {span} hari melewati target {formatMenit(target)}.
        </p>
        <ScreenTimeChart data={daily} target={target} />
      </section>

      <section className="grid grid-cols-1 gap-3">
        <div className="card">
          <h2 className="font-extrabold">Tren minggu ini vs minggu lalu</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-ink-soft">Rata-rata screen time/hari</p>
              <p className="text-2xl font-extrabold">{avg(thisWeek, "digital")} mnt</p>
              <Delta now={avg(thisWeek, "digital")} before={avg(lastWeek, "digital")} invert />
            </div>
            <div>
              <p className="text-sm text-ink-soft">Rata-rata aktivitas positif/hari</p>
              <p className="text-2xl font-extrabold">{avg(thisWeek, "positif")} mnt</p>
              <Delta now={avg(thisWeek, "positif")} before={avg(lastWeek, "positif")} />
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="font-extrabold">Tujuan memakai gawai</h2>
        <Donut data={purposes} />
      </section>
      <section className="card">
        <h2 className="font-extrabold">Kategori aktivitas positif</h2>
        <Donut data={positives} />
      </section>

      <section className="card">
        <h2 className="font-extrabold">Kalender keterisian catatan</h2>
        <p className="text-sm text-ink-soft">
          {calendar.filter((d) => filled.has(d)).length} dari {calendar.length} hari tercatat
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
            <span key={d} className="font-bold text-ink-soft">
              {d}
            </span>
          ))}
          {calendar.map((d) => (
            <span
              key={d}
              title={formatTanggal(d)}
              className={cn("flex aspect-square items-center justify-center rounded-lg font-bold", filled.has(d) ? "bg-hijau-500 text-white" : "bg-gray-100 text-ink-soft", d === today && "ring-2 ring-hijau-600")}
            >
              {Number(d.slice(8))}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
