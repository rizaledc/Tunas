"use client";
import { Icon, CategoryIcon } from "@/components/icons";
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui";
import { cn, WITH_WHOM } from "@/lib/utils";
import { saveLog } from "../../actions";

type Cat = { id: string; type: "digital" | "positif"; name: string; icon: string };
export type EditLog = {
  id: string;
  type: "digital" | "positif";
  category_id: string | null;
  log_date: string;
  start: string;
  end: string;
  duration_min: number;
  app_name: string | null;
  accompanied: boolean | null;
  follows_agreement: boolean | null;
  with_whom: string | null;
  note: string | null;
};

function YesNo({ name, label, defaultValue }: { name: string; label: string; defaultValue?: boolean | null }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex gap-2">
        <label className="chip flex-1 justify-center py-3 text-base">
          <input type="radio" name={name} value="ya" defaultChecked={defaultValue === true} className="sr-only" /> <Icon name="check" /> Ya
        </label>
        <label className="chip flex-1 justify-center py-3 text-base">
          <input type="radio" name={name} value="tidak" defaultChecked={defaultValue === false} className="sr-only" /> <Icon name="close" /> Tidak
        </label>
      </div>
    </fieldset>
  );
}

export function LogForm({ childId, categories, dates, initialTab, edit }: { childId: string; categories: Cat[]; dates: Array<{ value: string; label: string }>; initialTab: "digital" | "positif"; edit?: EditLog }) {
  const [tab, setTab] = useState<"digital" | "positif">(edit?.type ?? initialTab);
  const [duration, setDuration] = useState<number>(edit?.duration_min ?? 0);
  const [mode, setMode] = useState<"durasi" | "jam">(edit?.start && edit?.end && tab === "digital" ? "jam" : tab === "digital" ? "jam" : "durasi");
  const cats = categories.filter((c) => c.type === tab);

  return (
    <div>
      {!edit && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-paper p-1 ring-1 ring-gray-200" role="tablist">
          {(["digital", "positif"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setMode(t === "digital" ? "jam" : "durasi");
              }}
              className={cn("rounded-xl py-3 font-extrabold", tab === t ? (t === "digital" ? "bg-gelap-800 text-white dark:bg-[#3a3a3a]" : "bg-marun-600 text-white") : "text-ink-soft")}
            >
              <span className="inline-flex items-center gap-1.5"><Icon name={t === "digital" ? "device" : "leaf"} /> {t === "digital" ? "Aktivitas Digital" : "Aktivitas Positif"}</span>
            </button>
          ))}
        </div>
      )}
      <ActionForm action={saveLog} resetOnSuccess={!edit} key={tab}>
        <input type="hidden" name="child_id" value={childId} />
        <input type="hidden" name="type" value={tab} />
        {edit && <input type="hidden" name="id" value={edit.id} />}

        <div>
          <label className="label" htmlFor="log_date">
            Tanggal
          </label>
          <select id="log_date" name="log_date" className="input" defaultValue={edit?.log_date ?? dates[0].value}>
            {dates.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="label">{tab === "digital" ? "Tujuan memakai gawai" : "Kegiatan apa?"}</legend>
          <div className={cn("grid gap-2", tab === "digital" ? "grid-cols-2" : "grid-cols-3")}>
            {cats.map((c) => (
              <label key={c.id} className="chip flex-col justify-center rounded-2xl py-3 text-center">
                <input type="radio" name="category_id" value={c.id} required defaultChecked={edit?.category_id === c.id} className="sr-only" />
                <CategoryIcon icon={c.icon} className="h-8 w-8" />
                <span className="text-xs leading-tight">{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {tab === "digital" && (
          <div>
            <label className="label" htmlFor="app_name">
              Aplikasi (opsional)
            </label>
            <input id="app_name" name="app_name" defaultValue={edit?.app_name ?? ""} className="input" placeholder="YouTube, Roblox, WhatsApp…" maxLength={60} />
          </div>
        )}

        <div>
          <div className="mb-2 flex gap-2 text-sm">
            <button type="button" onClick={() => setMode("jam")} className={cn("rounded-full px-3 py-1 font-bold", mode === "jam" ? "bg-ink text-surface" : "bg-gray-100")}>
              Jam mulai–selesai
            </button>
            <button type="button" onClick={() => setMode("durasi")} className={cn("rounded-full px-3 py-1 font-bold", mode === "durasi" ? "bg-ink text-surface" : "bg-gray-100")}>
              Durasi saja
            </button>
          </div>
          {mode === "jam" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="start_time">
                  Mulai
                </label>
                <input id="start_time" name="start_time" type="time" required defaultValue={edit?.start} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="end_time">
                  Selesai
                </label>
                <input id="end_time" name="end_time" type="time" required defaultValue={edit?.end} className="input" />
              </div>
            </div>
          ) : (
            <div>
              <p className="label">Berapa lama?</p>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((m) => (
                  <button key={m} type="button" onClick={() => setDuration(m)} className={cn("rounded-xl border-2 py-3 text-lg font-extrabold", duration === m ? "border-marun-600 bg-marun-50 text-marun-700" : "border-gray-200 bg-paper")}>
                    {m} mnt
                  </button>
                ))}
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm">
                atau
                <input name="duration_min" type="number" min={1} max={1440} value={duration || ""} onChange={(e) => setDuration(Number(e.target.value))} className="input w-28" placeholder="menit" required />
                menit
              </label>
            </div>
          )}
        </div>

        {tab === "digital" ? (
          <>
            <YesNo name="accompanied" label="Didampingi orang tua?" defaultValue={edit?.accompanied} />
            <YesNo name="follows_agreement" label="Sesuai kesepakatan keluarga?" defaultValue={edit?.follows_agreement} />
          </>
        ) : (
          <fieldset>
            <legend className="label">Bersama siapa?</legend>
            <div className="flex flex-wrap gap-2">
              {WITH_WHOM.map((w) => (
                <label key={w} className="chip">
                  <input type="radio" name="with_whom" value={w} defaultChecked={edit?.with_whom === w} className="sr-only" />
                  {w}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <label className="label" htmlFor="note">
            Catatan (opsional)
          </label>
          <textarea id="note" name="note" rows={2} maxLength={500} defaultValue={edit?.note ?? ""} className="input" placeholder="Contoh: menggambar ikan lele bersama kakak" />
        </div>
        <SubmitButton className={cn("btn w-full text-lg text-white", tab === "digital" ? "bg-gelap-800 hover:bg-gelap-900 dark:bg-[#3a3a3a] dark:hover:bg-[#474747]" : "bg-marun-600 hover:bg-marun-700")}>
          {edit ? "Simpan Perubahan" : "Simpan Catatan"}
        </SubmitButton>
      </ActionForm>
    </div>
  );
}
