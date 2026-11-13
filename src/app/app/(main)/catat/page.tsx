import { notFound } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { getActiveChild, getCategories } from "@/lib/parent";
import { createClient } from "@/lib/supabase/server";
import { addDays, formatHari, isoToWibTime, todayStr } from "@/lib/date";
import { PageTitle } from "@/components/blocks";
import { LogForm, type DayUsage, type EditLog } from "./log-form";
import type { LeleLog } from "@/lib/lele";
import { NoChild } from "../no-child";

export const metadata = { title: "Catat Aktivitas" };

export default async function CatatPage({ searchParams }: { searchParams: Promise<{ tab?: string; edit?: string }> }) {
  const parent = await requireParent();
  const { child } = await getActiveChild(parent.familyId);
  if (!child) return <NoChild />;
  const { tab, edit } = await searchParams;
  const categories = await getCategories();
  const today = todayStr();
  const dates = Array.from({ length: 8 }, (_, i) => {
    const d = addDays(today, -i);
    return { value: d, label: i === 0 ? `Hari ini, ${formatHari(d)}` : i === 1 ? `Kemarin, ${formatHari(d)}` : formatHari(d) };
  });

  const supabase = await createClient();
  const oldest = addDays(today, -7);
  const [{ data: logs }, { data: leleRows }] = await Promise.all([
    supabase.from("activity_logs").select("id,log_date,type,duration_min").eq("child_id", child.id).gte("log_date", oldest).lte("log_date", today),
    supabase.from("lele_logs").select("log_date,pakan_pagi,pakan_sore,air,perilaku,cuaca,didampingi,catatan").eq("child_id", child.id).gte("log_date", oldest).lte("log_date", today),
  ]);
  // Total menit per tanggal (tanpa catatan yang sedang diubah) untuk bar 24 jam.
  const usage: DayUsage = {};
  for (const l of logs ?? []) {
    if (l.id === edit) continue;
    const u = (usage[l.log_date] ??= { digital: 0, positif: 0, rutin: 0 });
    u[l.type as keyof typeof u] += l.duration_min;
  }
  const lele: Record<string, LeleLog> = Object.fromEntries((leleRows ?? []).map((r) => [r.log_date, r as LeleLog]));

  let editLog: EditLog | undefined;
  if (edit) {
    const { data } = await supabase.from("activity_logs").select("*").eq("id", edit).eq("child_id", child.id).maybeSingle();
    if (!data) notFound();
    if (!dates.some((d) => d.value === data.log_date)) dates.push({ value: data.log_date, label: formatHari(data.log_date) });
    editLog = { ...data, start: isoToWibTime(data.start_at), end: isoToWibTime(data.end_at) };
  }

  return (
    <div>
      <PageTitle title={edit ? "Ubah Catatan" : "Catat Aktivitas"} subtitle={`untuk ${child.nickname}`} />
      <LogForm childId={child.id} categories={categories} dates={dates} initialTab={tab === "positif" || tab === "rutin" ? tab : "digital"} edit={editLog} usage={usage} lele={lele} />
    </div>
  );
}
