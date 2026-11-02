import { redirect } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { getChildModeId } from "@/lib/child-mode";
import { getCategories, getChildren } from "@/lib/parent";
import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/date";
import { computeBadges } from "@/lib/badges";
import { ChildLogForm, ExitForm } from "./child-forms";

export const metadata = { title: "Mode Anak" };

export default async function ModeAnakPage() {
  const parent = await requireParent();
  const childId = await getChildModeId();
  const kids = await getChildren(parent.familyId);
  const child = kids.find((k) => k.id === childId);
  if (!child) redirect("/app/mode-anak/masuk");
  const supabase = await createClient();
  const [cats, { data: logs }] = await Promise.all([
    getCategories(),
    supabase.from("activity_logs").select("log_date,category_id").eq("child_id", child.id).eq("input_by", "child"),
  ]);
  const { stars, badges } = computeBadges(logs ?? [], todayStr());
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <div className="text-center">
        <p className="text-5xl">👋</p>
        <h1 className="text-3xl font-extrabold text-tunas-900">Halo, {child.nickname}!</h1>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-2xl font-extrabold text-oranye-600 shadow">⭐ {stars} bintang</p>
      </div>
      <ChildLogForm categories={cats.filter((c) => c.type === "positif")} />
      <section>
        <h2 className="mb-3 text-center text-2xl font-extrabold text-tunas-900">Lencanaku</h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <div key={b.name} className={`rounded-3xl bg-white p-3 text-center shadow-sm ${b.earned ? "" : "opacity-40 grayscale"}`} title={b.desc}>
              <p className="text-4xl">{b.icon}</p>
              <p className="text-sm leading-tight font-extrabold">{b.name}</p>
              <p className="text-[11px] leading-tight text-ink-soft">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <ExitForm />
    </div>
  );
}
