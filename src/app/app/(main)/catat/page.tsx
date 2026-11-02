import { notFound } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { getActiveChild, getCategories } from "@/lib/parent";
import { createClient } from "@/lib/supabase/server";
import { addDays, formatHari, isoToWibTime, todayStr } from "@/lib/date";
import { PageTitle } from "@/components/blocks";
import { LogForm, type EditLog } from "./log-form";
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

  let editLog: EditLog | undefined;
  if (edit) {
    const supabase = await createClient();
    const { data } = await supabase.from("activity_logs").select("*").eq("id", edit).eq("child_id", child.id).maybeSingle();
    if (!data) notFound();
    if (!dates.some((d) => d.value === data.log_date)) dates.push({ value: data.log_date, label: formatHari(data.log_date) });
    editLog = { ...data, start: isoToWibTime(data.start_at), end: isoToWibTime(data.end_at) };
  }

  return (
    <div>
      <PageTitle title={edit ? "Ubah Catatan" : "Catat Aktivitas"} subtitle={`untuk ${child.nickname}`} />
      <LogForm childId={child.id} categories={categories} dates={dates} initialTab={tab === "positif" ? "positif" : "digital"} edit={editLog} />
    </div>
  );
}
