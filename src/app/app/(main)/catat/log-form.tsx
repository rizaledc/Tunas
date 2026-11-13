"use client";
import { Icon, CategoryIcon, type IconName } from "@/components/icons";
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui";
import { DurationWheel } from "@/components/app/duration-wheel";
import { cn, WITH_WHOM } from "@/lib/utils";
import type { ActivityType } from "@/lib/indicators";
import { isLeleCategory, isOtherCategory, LELE_OPTIONS, type LeleLog } from "@/lib/lele";
import { saveLog } from "../../actions";

type Cat = { id: string; type: ActivityType; name: string; icon: string };
export type DayUsage = Record<string, { digital: number; positif: number; rutin: number }>;
export type EditLog = {
  id: string;
  type: ActivityType;
  category_id: string | null;
  custom_label: string | null;
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

const TABS: Array<{ key: ActivityType; label: string; icon: IconName; color: string }> = [
  { key: "digital", label: "Digital", icon: "device", color: "bg-gelap-800 text-white" },
  { key: "positif", label: "Positif", icon: "leaf", color: "bg-hijau-600 text-white" },
  { key: "rutin", label: "Rutinitas", icon: "school", color: "bg-kuning-500 text-hijau-950" },
];
const TYPE_TEXT: Record<ActivityType, string> = { digital: "digital", positif: "positif", rutin: "rutinitas" };
const DAY = 1440;

const fmt = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? (m ? `${h} j ${m} mnt` : `${h} jam`) : `${m} mnt`;
};

function addMinutes(time: string, min: number) {
  if (!/^\d{2}:\d{2}$/.test(time)) return "";
  const t = (Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) + min) % DAY;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

function minutesBetween(start: string, end: string) {
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return 0;
  const [a, b] = [start, end].map((t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3)));
  return b > a ? b - a : b + DAY - a;
}

/** Bar 24 jam: digital, positif, rutinitas yang sudah dicatat + catatan yang sedang diisi + sisa. */
function DayBar({ used, adding, type }: { used: { digital: number; positif: number; rutin: number }; adding: number; type: ActivityType }) {
  const total = used.digital + used.positif + used.rutin;
  const remaining = Math.max(0, DAY - total);
  const after = Math.max(0, DAY - total - adding);
  const over = total + adding > DAY;
  const seg = [
    { k: "digital", v: used.digital, c: "bg-gelap-700", l: "Digital" },
    { k: "positif", v: used.positif, c: "bg-hijau-600", l: "Positif" },
    { k: "rutin", v: used.rutin, c: "bg-kuning-500", l: "Rutinitas" },
  ];
  const addColor = type === "digital" ? "bg-gelap-700/45" : type === "positif" ? "bg-hijau-600/45" : "bg-kuning-500/50";
  return (
    <div className="card space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-extrabold">Catatan 24 jam</p>
        <p className={cn("text-sm font-bold", over ? "text-merah-600" : "text-hijau-800")}>
          {over ? `Lebih ${fmt(total + adding - DAY)} dari 24 jam` : adding ? `Sisa ${fmt(after)} setelah ini` : `Sisa ${fmt(remaining)}`}
        </p>
      </div>
      <div className="flex h-4 overflow-hidden rounded-full bg-gray-100" role="img" aria-label={`Sudah tercatat ${fmt(total)} dari 24 jam`}>
        {seg.map((s) => s.v > 0 && <span key={s.k} className={s.c} style={{ width: `${(s.v / DAY) * 100}%` }} />)}
        {adding > 0 && <span className={cn(addColor, "bg-[repeating-linear-gradient(45deg,transparent_0_4px,rgba(255,255,255,.45)_4px_8px)]")} style={{ width: `${(Math.min(adding, remaining) / DAY) * 100}%` }} />}
      </div>
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
        {seg.map((s) => (
          <span key={s.k} className="inline-flex items-center gap-1">
            <span className={cn("h-2 w-2 rounded-full", s.c)} /> {s.l} {fmt(s.v)}
          </span>
        ))}
        <span>· tercatat {fmt(total)} dari 24 jam</span>
      </p>
    </div>
  );
}

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

function Choice({ name, options, defaultValue, multi = false }: { name: string; options: ReadonlyArray<{ value: string; label: string }>; defaultValue?: string | string[] | null; multi?: boolean }) {
  const isOn = (v: string) => (Array.isArray(defaultValue) ? defaultValue.includes(v) : defaultValue === v);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className="chip">
          <input type={multi ? "checkbox" : "radio"} name={name} value={o.value} defaultChecked={isOn(o.value)} className="sr-only" />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/** Instrumen I: logbook pemantauan harian lele (satu isian per anak per hari). */
function LeleSection({ date, existing }: { date: string; existing?: LeleLog }) {
  return (
    <fieldset key={date} className="space-y-4 rounded-2xl border-2 border-hijau-200 bg-hijau-50/60 p-4">
      <legend className="flex items-center gap-2 px-1 font-extrabold text-hijau-800">
        <Icon name="fish" /> Logbook lele hari ini
      </legend>
      <p className="-mt-2 text-xs text-ink-soft">
        {existing ? "Sudah ada isian untuk tanggal ini; perubahan akan memperbarui isian tersebut." : "Diisi sekali sehari. Kalau mencatat merawat lele lagi di hari yang sama, isian ini diperbarui."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="label">Pakan pagi (07.00–08.00)</p>
          <Choice name="lele_pakan_pagi" options={LELE_OPTIONS.pakan} defaultValue={existing?.pakan_pagi} />
        </div>
        <div>
          <p className="label">Pakan sore (16.00–17.00)</p>
          <Choice name="lele_pakan_sore" options={LELE_OPTIONS.pakan} defaultValue={existing?.pakan_sore} />
        </div>
      </div>
      <div>
        <p className="label">
          Kekeruhan air (visual & bau) <span className="font-normal text-ink-soft">· boleh lebih dari satu</span>
        </p>
        <Choice name="lele_air" multi options={LELE_OPTIONS.air} defaultValue={existing?.air} />
      </div>
      <div>
        <p className="label">
          Perilaku & nafsu makan ikan <span className="font-normal text-ink-soft">· boleh lebih dari satu</span>
        </p>
        <Choice name="lele_perilaku" multi options={LELE_OPTIONS.perilaku} defaultValue={existing?.perilaku} />
      </div>
      <div>
        <p className="label">Kondisi cuaca</p>
        <Choice name="lele_cuaca" options={LELE_OPTIONS.cuaca} defaultValue={existing?.cuaca} />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="lele_didampingi" defaultChecked={existing?.didampingi} className="mt-0.5 h-5 w-5 accent-hijau-600" />
        <span>
          <strong>Paraf orang tua:</strong> saya mendampingi anak saat mengamati kolam hari ini.
        </span>
      </label>
    </fieldset>
  );
}

export function LogForm({
  childId,
  categories,
  dates,
  initialTab,
  edit,
  usage,
  lele,
}: {
  childId: string;
  categories: Cat[];
  dates: Array<{ value: string; label: string }>;
  initialTab: ActivityType;
  edit?: EditLog;
  usage: DayUsage;
  lele: Record<string, LeleLog>;
}) {
  const [tab, setTab] = useState<ActivityType>(edit?.type ?? initialTab);
  const [date, setDate] = useState(edit?.log_date ?? dates[0].value);
  const [catId, setCatId] = useState<string | null>(edit?.category_id ?? null);
  const [duration, setDuration] = useState<number>(edit?.duration_min ?? 0);
  // Jam mulai–selesai opsional; durasi dan jam saling menyesuaikan.
  const [showTimes, setShowTimes] = useState<boolean>(edit ? Boolean(edit.start && edit.end) : initialTab === "digital");
  const [start, setStart] = useState(edit?.start ?? "");
  const [end, setEnd] = useState(edit?.end ?? "");
  const changeDuration = (min: number) => {
    setDuration(min);
    if (start && min > 0) setEnd(addMinutes(start, min));
  };
  const changeStart = (v: string) => {
    setStart(v);
    if (v && duration > 0) setEnd(addMinutes(v, duration));
    else if (v && end) setDuration(minutesBetween(v, end));
  };
  const changeEnd = (v: string) => {
    setEnd(v);
    if (start && v) setDuration(minutesBetween(start, v));
  };
  const cats = categories.filter((c) => c.type === tab);
  const cat = categories.find((c) => c.id === catId) ?? null;
  const used = usage[date] ?? { digital: 0, positif: 0, rutin: 0 };
  const remaining = Math.max(0, DAY - used.digital - used.positif - used.rutin);
  const adding = duration;
  const presets = cat?.icon === "sleep" ? [60, 120, 420, 480] : tab === "rutin" ? [30, 60, 120, 360] : [15, 30, 60, 120];
  const showLele = tab === "positif" && cat && isLeleCategory(cat);
  const showOther = cat && cat.type === tab && isOtherCategory(cat);

  return (
    <div className="space-y-4">
      {!edit && (
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-paper p-1 ring-1 ring-gray-200" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => {
                setTab(t.key);
                setCatId(null);
                setShowTimes(t.key === "digital");
              }}
              className={cn("rounded-xl px-1 py-3 text-sm font-extrabold sm:text-base", tab === t.key ? t.color : "text-ink-soft")}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon name={t.icon} className="h-5 w-5" /> {t.label}
              </span>
            </button>
          ))}
        </div>
      )}

      <DayBar used={used} adding={adding} type={tab} />

      <ActionForm action={saveLog} resetOnSuccess={!edit} key={tab} className="space-y-4">
        <input type="hidden" name="child_id" value={childId} />
        <input type="hidden" name="type" value={tab} />
        {edit && <input type="hidden" name="id" value={edit.id} />}

        <div>
          <label className="label" htmlFor="log_date">
            Tanggal
          </label>
          <select id="log_date" name="log_date" className="input" value={date} onChange={(e) => setDate(e.target.value)}>
            {dates.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="label">{tab === "digital" ? "Tujuan memakai gawai" : tab === "rutin" ? "Rutinitas apa?" : "Kegiatan apa?"}</legend>
          <div className={cn("grid gap-2", tab === "digital" ? "grid-cols-2" : "grid-cols-3")}>
            {cats.map((c) => (
              <label key={c.id} className="chip flex-col justify-center rounded-2xl py-3 text-center">
                <input type="radio" name="category_id" value={c.id} required checked={catId === c.id} onChange={() => setCatId(c.id)} className="sr-only" />
                <CategoryIcon icon={c.icon} className="h-8 w-8" />
                <span className="text-xs leading-tight">{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {showOther && (
          <div>
            <label className="label" htmlFor="custom_label">
              Tulis kegiatannya
            </label>
            <input id="custom_label" name="custom_label" required maxLength={60} defaultValue={edit?.custom_label ?? ""} className="input" placeholder={tab === "digital" ? "Contoh: Menonton berita" : tab === "rutin" ? "Contoh: Les privat" : "Contoh: Berkebun"} autoFocus />
          </div>
        )}

        {showLele && <LeleSection date={date} existing={lele[date]} />}

        {tab === "digital" && (
          <div>
            <label className="label" htmlFor="app_name">
              Aplikasi (opsional)
            </label>
            <input id="app_name" name="app_name" defaultValue={edit?.app_name ?? ""} className="input" placeholder="YouTube, Roblox, WhatsApp…" maxLength={60} />
          </div>
        )}

        <div>
          <p className="label">Berapa lama?</p>
          <DurationWheel value={duration} onChange={changeDuration} max={remaining} />
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {presets.map((m) => (
              <button key={m} type="button" onClick={() => changeDuration(m)} className={cn("rounded-full border px-3 py-1.5 text-sm font-bold", duration === m ? "border-hijau-600 bg-hijau-50 text-hijau-800" : "border-gray-200 bg-paper text-ink-soft")}>
                {fmt(m)}
              </button>
            ))}
            {remaining > 0 && remaining < DAY && (
              <button type="button" onClick={() => changeDuration(remaining)} className="rounded-full border border-kuning-500 bg-kuning-50 px-3 py-1.5 text-sm font-bold text-kuning-800">
                Sisa hari ini ({fmt(remaining)})
              </button>
            )}
          </div>
          <input type="hidden" name="duration_min" value={duration || ""} />

          <div className="mt-4 rounded-2xl bg-gray-50 p-3">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={showTimes} onChange={(e) => setShowTimes(e.target.checked)} className="h-5 w-5 accent-hijau-600" />
              Isi jam mulai–selesai {tab === "digital" ? "(disarankan untuk gawai)" : "(opsional)"}
            </label>
            {showTimes && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor="start_time">
                      Mulai
                    </label>
                    <input id="start_time" name="start_time" type="time" required value={start} onChange={(e) => changeStart(e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="end_time">
                      Selesai
                    </label>
                    <input id="end_time" name="end_time" type="time" required value={end} onChange={(e) => changeEnd(e.target.value)} className="input" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                  Ubah jam mulai atau selesai, durasi di atas ikut menyesuaikan. Ubah durasi, jam selesai ikut bergeser. Jika melewati tengah malam (mis. tidur 21.00–05.00), seluruhnya dicatat di tanggal mulai.
                </p>
              </>
            )}
          </div>
        </div>

        {tab === "digital" && (
          <>
            <YesNo name="accompanied" label="Didampingi orang tua?" defaultValue={edit?.accompanied} />
            <YesNo name="follows_agreement" label="Sesuai kesepakatan keluarga?" defaultValue={edit?.follows_agreement} />
          </>
        )}
        {tab === "positif" && (
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
          <textarea id="note" name="note" rows={2} maxLength={500} defaultValue={edit?.note ?? ""} className="input" placeholder={showLele ? "Contoh: air agak bau setelah hujan" : "Contoh: menggambar ikan lele bersama kakak"} />
        </div>
        <SubmitButton className={cn("btn w-full text-lg", tab === "digital" ? "bg-gelap-800 text-white hover:bg-gelap-900" : tab === "positif" ? "bg-hijau-600 text-white hover:bg-hijau-700" : "bg-kuning-500 text-hijau-950 hover:bg-kuning-400")}>
          {edit ? "Simpan Perubahan" : `Simpan Catatan ${TYPE_TEXT[tab][0].toUpperCase()}${TYPE_TEXT[tab].slice(1)}`}
        </SubmitButton>
      </ActionForm>
    </div>
  );
}
