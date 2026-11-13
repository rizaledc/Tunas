import "server-only";
import { LEVEL_GROUPS } from "./utils";
import { createAdminClient } from "./supabase/admin";
import { addDays, startOfWeek, todayStr, wibHour } from "./date";
import { canShowGroup, MIN_GROUP_FAMILIES } from "./privacy";
import type { LogRow } from "./indicators";

type Db = ReturnType<typeof createAdminClient>;

/** Mengambil semua baris (melewati batas 1000 baris PostgREST). */
export async function fetchAll<T>(build: (db: Db) => { range: (a: number, b: number) => PromiseLike<{ data: T[] | null; error: unknown }> }): Promise<T[]> {
  const db = createAdminClient();
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(db).range(from, from + 999);
    if (error || !data?.length) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

export type StatLog = LogRow & { child_id: string; source: string };
export type ChildMeta = { id: string; family_id: string; school_level: string; birth_year: number };
export type FamilyMeta = { id: string; rt: string | null; parent_id: string };

export async function loadBase(from: string, to: string) {
  const [logs, children, families, agreements, cats] = await Promise.all([
    fetchAll<StatLog>((db) => db.from("activity_logs").select("child_id,log_date,type,category_id,duration_min,accompanied,follows_agreement,start_at,end_at,source").gte("log_date", from).lte("log_date", to).order("id")),
    fetchAll<ChildMeta>((db) => db.from("children").select("id,family_id,school_level,birth_year").order("id")),
    fetchAll<FamilyMeta>((db) => db.from("families").select("id,rt,parent_id").order("id")),
    fetchAll<{ child_id: string; target_screen_min: number }>((db) => db.from("agreements").select("child_id,target_screen_min").order("id")),
    fetchAll<{ id: string; type: string; name: string; icon: string }>((db) => db.from("categories").select("id,type,name,icon").order("sort")),
  ]);
  return { logs, children, families, agreements, cats };
}

export type GroupStats = {
  families: number;
  children: number;
  suppressed: boolean;
  childDays: number;
  avgScreen: number;
  avgPositive: number;
  avgTarget: number | null;
  compliancePct: number;
  accompaniedPct: number;
  nightPct: number;
  purposes: Array<{ name: string; value: number }>;
  positives: Array<{ name: string; value: number }>;
  hours: Array<{ name: string; value: number }>;
};

export function groupStats(base: Awaited<ReturnType<typeof loadBase>>, childIds: Set<string>, opts: { source?: "app" | "logbook_import" } = {}): GroupStats {
  const logs = base.logs.filter((l) => childIds.has(l.child_id) && (!opts.source || l.source === opts.source));
  const kids = base.children.filter((c) => childIds.has(c.id));
  const famCount = new Set(kids.map((k) => k.family_id)).size;
  const activeFamilies = new Set(kids.filter((k) => logs.some((l) => l.child_id === k.id)).map((k) => k.family_id)).size;
  const suppressed = !canShowGroup(activeFamilies);

  const dayKey = (l: StatLog) => `${l.child_id}|${l.log_date}`;
  const days = new Map<string, { digital: number; positif: number; broke: boolean; child: string }>();
  for (const l of logs) {
    const k = dayKey(l);
    const d = days.get(k) ?? { digital: 0, positif: 0, broke: false, child: l.child_id };
    if (l.type === "digital") d.digital += l.duration_min;
    else if (l.type === "positif") d.positif += l.duration_min;
    if (l.follows_agreement === false) d.broke = true;
    days.set(k, d);
  }
  const targets = new Map(base.agreements.map((a) => [a.child_id, a.target_screen_min]));
  let compliant = 0;
  let withTarget = 0;
  for (const d of days.values()) {
    const t = targets.get(d.child);
    if (t === undefined) continue;
    withTarget++;
    if (d.digital <= t && !d.broke) compliant++;
  }
  const digital = logs.filter((l) => l.type === "digital");
  const totalDigital = digital.reduce((a, l) => a + l.duration_min, 0);
  const totalPositive = logs.filter((l) => l.type === "positif").reduce((a, l) => a + l.duration_min, 0);
  const accompanied = digital.filter((l) => l.accompanied).reduce((a, l) => a + l.duration_min, 0);
  const timed = digital.filter((l) => l.start_at);
  const night = timed.filter((l) => {
    const h = wibHour(l.start_at!);
    return h >= 21 || h < 4;
  });

  const comp = (type: "digital" | "positif") => {
    const m = new Map<string, number>();
    for (const l of logs.filter((x) => x.type === type)) {
      const n = base.cats.find((c) => c.id === l.category_id)?.name ?? "Lainnya";
      m.set(n, (m.get(n) ?? 0) + l.duration_min);
    }
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };
  const hours = Array.from({ length: 24 }, (_, h) => ({ name: `${String(h).padStart(2, "0")}.00`, value: 0 }));
  for (const l of timed) hours[wibHour(l.start_at!)].value += l.duration_min;

  const targetVals = kids.map((k) => targets.get(k.id)).filter((x): x is number => x !== undefined);
  const n = days.size;
  return {
    families: famCount,
    children: kids.length,
    suppressed,
    childDays: n,
    avgScreen: n ? Math.round(totalDigital / n) : 0,
    avgPositive: n ? Math.round(totalPositive / n) : 0,
    avgTarget: targetVals.length ? Math.round(targetVals.reduce((a, b) => a + b, 0) / targetVals.length) : null,
    compliancePct: withTarget ? Math.round((compliant / withTarget) * 100) : 0,
    accompaniedPct: totalDigital ? Math.round((accompanied / totalDigital) * 100) : 0,
    nightPct: timed.length ? Math.round((night.reduce((a, l) => a + l.duration_min, 0) / Math.max(1, timed.reduce((a, l) => a + l.duration_min, 0))) * 100) : 0,
    purposes: comp("digital"),
    positives: comp("positif"),
    hours,
  };
}

/** `level` = kunci LEVEL_GROUPS (kelompok jenjang), bukan kelas satuan. */
export function filterChildren(base: Awaited<ReturnType<typeof loadBase>>, f: { level?: string; rt?: string }) {
  const famRt = new Map(base.families.map((x) => [x.id, x.rt ?? ""]));
  const levels = f.level ? new Set(LEVEL_GROUPS[f.level]?.levels ?? [f.level]) : null;
  return new Set(
    base.children.filter((c) => (!levels || levels.has(c.school_level)) && (!f.rt || famRt.get(c.family_id) === f.rt)).map((c) => c.id),
  );
}

export async function dashboardKpis() {
  const db = createAdminClient();
  const today = todayStr();
  const since7 = new Date(Date.now() - 7 * 86400_000).toISOString();
  const weekStart = startOfWeek(today);
  const trendStart = addDays(weekStart, -7 * 7);
  const [fam, kids, active, insights, insightsWeek] = await Promise.all([
    db.from("families").select("id", { count: "exact", head: true }),
    db.from("children").select("id", { count: "exact", head: true }),
    db.from("users").select("id", { count: "exact", head: true }).eq("role", "parent").gte("last_active_at", since7),
    db.from("ai_insights").select("id", { count: "exact", head: true }),
    db.from("ai_insights").select("id", { count: "exact", head: true }).gte("created_at", new Date(`${weekStart}T00:00:00+07:00`).toISOString()),
  ]);
  const base = await loadBase(trendStart, today);
  const childFam = new Map(base.children.map((c) => [c.id, c.family_id]));
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(trendStart, i * 7));
  const trend = weeks.map((w) => {
    const end = addDays(w, 6);
    const logs = base.logs.filter((l) => l.log_date >= w && l.log_date <= end && l.source === "app");
    const ids = new Set(logs.map((l) => l.child_id));
    const fams = new Set([...ids].map((id) => childFam.get(id)));
    const g = groupStats(base, ids, { source: "app" });
    const ok = canShowGroup(fams.size);
    return {
      label: `${Number(w.slice(8))}/${Number(w.slice(5, 7))}`,
      catatan: logs.length,
      keluarga: fams.size,
      screen: ok ? g.avgScreen : 0,
      positif: ok ? g.avgPositive : 0,
    };
  });
  const thisWeek = trend[7];
  const lastWeek = trend[6];
  const last7 = new Set(base.logs.filter((l) => l.log_date >= addDays(today, -6) && l.source === "app").map((l) => l.child_id));
  const g7 = groupStats(base, last7, { source: "app" });

  const alerts: string[] = [];
  if (lastWeek.keluarga > 0 && thisWeek.keluarga < lastWeek.keluarga * 0.8) {
    alerts.push(`Keterisian turun: ${thisWeek.keluarga} keluarga mencatat minggu ini vs ${lastWeek.keluarga} minggu lalu.`);
  }
  const { count: inactive } = await db.from("users").select("id", { count: "exact", head: true }).eq("role", "parent").eq("status", "active").or(`last_active_at.is.null,last_active_at.lt.${since7}`);
  if ((inactive ?? 0) > 0) alerts.push(`${inactive} orang tua belum membuka aplikasi lebih dari 7 hari.`);
  const { count: fallbacks } = await db.from("ai_insights").select("id", { count: "exact", head: true }).eq("model", "rule-based").gte("created_at", since7);
  if ((fallbacks ?? 0) > 0) alerts.push(`${fallbacks} insight minggu ini memakai ringkasan cadangan (AI gagal/saldo habis).`);
  if (!g7.suppressed && g7.avgTarget && g7.avgScreen > g7.avgTarget) alerts.push(`Rata-rata screen time komunitas (${g7.avgScreen} mnt) di atas rata-rata target (${g7.avgTarget} mnt).`);

  return {
    families: fam.count ?? 0,
    children: kids.count ?? 0,
    active7: active.count ?? 0,
    logsWeek: base.logs.filter((l) => l.log_date >= weekStart && l.source === "app").length,
    avgScreen: g7.suppressed ? null : g7.avgScreen,
    ratio: g7.suppressed ? null : `${g7.avgScreen} : ${g7.avgPositive}`,
    insights: insights.count ?? 0,
    insightsWeek: insightsWeek.count ?? 0,
    trend,
    alerts,
    minFamilies: MIN_GROUP_FAMILIES,
  };
}
