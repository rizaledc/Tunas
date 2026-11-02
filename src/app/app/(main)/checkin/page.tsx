import { Icon } from "@/components/icons";
import { requireParent } from "@/lib/auth";
import { getActiveChild } from "@/lib/parent";
import { createClient } from "@/lib/supabase/server";
import { formatHari, todayStr } from "@/lib/date";
import { MOODS, STOP_RESPONSES } from "@/lib/utils";
import { ActionForm, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { saveCheckin } from "../../actions";
import { NoChild } from "../no-child";

export const metadata = { title: "Check-in Harian" };

export default async function CheckinPage() {
  const parent = await requireParent();
  const { child } = await getActiveChild(parent.familyId);
  if (!child) return <NoChild />;
  const today = todayStr();
  const supabase = await createClient();
  const { data: c } = await supabase.from("daily_checkins").select("*").eq("child_id", child.id).eq("date", today).maybeSingle();

  return (
    <div>
      <PageTitle title="Check-in Harian" subtitle={`${child.nickname} · ${formatHari(today)}`} />
      <ActionForm action={saveCheckin} className="space-y-5">
        <input type="hidden" name="child_id" value={child.id} />
        <input type="hidden" name="date" value={today} />
        <fieldset className="card">
          <legend className="mb-2 px-1 text-lg font-extrabold">1. Suasana hati {child.nickname} hari ini?</legend>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(MOODS).map(([k, m]) => (
              <label key={k} className="chip flex-col justify-center rounded-2xl py-3">
                <input type="radio" name="mood" value={k} defaultChecked={c?.mood === k} className="sr-only" />
                <Icon name={m.icon} className="h-9 w-9 text-oranye-500" />
                <span className="text-xs">{m.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="card">
          <legend className="mb-2 px-1 text-lg font-extrabold">2. Saat waktu gawai habis, anak…</legend>
          <div className="grid gap-2">
            {Object.entries(STOP_RESPONSES).map(([k, label]) => (
              <label key={k} className="chip justify-start rounded-xl py-3 text-base">
                <input type="radio" name="stop_response" value={k} defaultChecked={c?.stop_response === k} className="sr-only" />
                <Icon name={k === "mudah" ? "face-smile" : k === "diingatkan" ? "megaphone" : "face-angry"} className="h-6 w-6 text-tunas-600" /> {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="card">
          <label htmlFor="sleep_time" className="mb-2 block text-lg font-extrabold">
            3. Jam tidur anak
          </label>
          <input id="sleep_time" name="sleep_time" type="time" defaultValue={c?.sleep_time?.slice(0, 5) ?? ""} className="input" />
        </div>
        <fieldset className="card">
          <legend className="mb-2 px-1 text-lg font-extrabold">4. Memakai gawai menjelang tidur?</legend>
          <div className="flex gap-2">
            <label className="chip flex-1 justify-center py-3 text-base">
              <input type="radio" name="device_before_sleep" value="ya" defaultChecked={c?.device_before_sleep === true} className="sr-only" /> <Icon name="device" /> Ya
            </label>
            <label className="chip flex-1 justify-center py-3 text-base">
              <input type="radio" name="device_before_sleep" value="tidak" defaultChecked={c?.device_before_sleep === false} className="sr-only" /> <Icon name="sleep" /> Tidak
            </label>
          </div>
        </fieldset>
        <SubmitButton className="btn-green w-full text-lg">{c ? "Perbarui Check-in" : "Simpan Check-in"}</SubmitButton>
      </ActionForm>
    </div>
  );
}
