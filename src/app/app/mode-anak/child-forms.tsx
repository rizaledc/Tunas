"use client";
import { Icon, CategoryIcon, type IconName } from "@/components/icons";
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui";
import { HiddenUsername } from "@/components/fields";
import { cn } from "@/lib/utils";
import { childLog, enterChildMode, exitChildMode } from "../actions";

type Cat = { id: string; name: string; icon: string };

export function ChildLogForm({ categories }: { categories: Cat[] }) {
  const [cat, setCat] = useState<string>("");
  const [dur, setDur] = useState<number>(0);
  return (
    <ActionForm action={childLog} className="space-y-5">
      {(state) => (
        <>
          <input type="hidden" name="category_id" value={cat} />
          <input type="hidden" name="duration_min" value={dur || ""} />
          <div>
            <p className="mb-3 text-center text-2xl font-extrabold text-hijau-700">Hari ini aku…</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  aria-pressed={cat === c.id}
                  className={cn("flex flex-col items-center gap-1 rounded-3xl border-4 bg-paper p-4 shadow-sm transition", cat === c.id ? "scale-105 border-hijau-700" : "border-transparent")}
                >
                  <CategoryIcon icon={c.icon} className="h-12 w-12 text-hijau-700" />
                  <span className="text-center text-base leading-tight font-extrabold [overflow-wrap:anywhere]">{c.name.replace("/", "/\u200b")}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-center text-2xl font-extrabold text-hijau-700">Berapa lama?</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                [15, "Sebentar", "time-15"],
                [30, "Lumayan", "time-30"],
                [60, "Lama", "time-60"],
              ] as Array<[number, string, IconName]>).map(([m, label, icon]) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setDur(Number(m))}
                  aria-pressed={dur === m}
                  className={cn("flex flex-col items-center rounded-3xl border-4 bg-paper p-3 font-extrabold", dur === m ? "border-hijau-500" : "border-transparent")}
                >
                  <Icon name={icon} className="h-10 w-10 text-hijau-600" />
                  {label}
                  <span className="text-sm font-semibold text-ink-soft">{m} menit</span>
                </button>
              ))}
            </div>
          </div>
          {state?.ok && <Icon name="star-solid" className="mx-auto block h-14 w-14 animate-bounce text-kuning-400" />}
          <SubmitButton disabled={!cat || !dur} className="btn w-full rounded-3xl bg-hijau-700 py-5 text-2xl text-white shadow-lg">
            Simpan & Dapat Bintang!
          </SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function EnterForm({ kids }: { kids: Array<{ id: string; nickname: string; hasPin: boolean }> }) {
  const [id, setId] = useState(kids.find((k) => k.hasPin)?.id ?? "");
  return (
    <ActionForm action={enterChildMode} className="space-y-4">
      <input type="hidden" name="child_id" value={id} />
      <div className="grid grid-cols-2 gap-3">
        {kids.map((k) => (
          <button type="button" key={k.id} disabled={!k.hasPin} onClick={() => setId(k.id)} className={cn("rounded-3xl border-4 bg-paper p-4 text-xl font-extrabold disabled:opacity-40", id === k.id ? "border-hijau-700" : "border-transparent")}>
            <Icon name="child" className="mx-auto mb-1 block h-8 w-8 text-hijau-600" />
            {k.nickname}
            {!k.hasPin && <span className="block text-xs font-semibold">PIN belum diatur</span>}
          </button>
        ))}
      </div>
      <input name="pin" inputMode="numeric" pattern="\d{4}" maxLength={4} required autoComplete="off" placeholder="PIN" className="input text-center text-3xl tracking-[0.6em]" />
      <SubmitButton disabled={!id} className="btn w-full rounded-3xl bg-hijau-700 py-4 text-xl text-white">
        Masuk Mode Anak
      </SubmitButton>
    </ActionForm>
  );
}

export function ExitForm() {
  return (
    <details className="rounded-2xl bg-white/70 p-3">
      <summary className="cursor-pointer text-center text-sm font-bold text-ink-soft"><span className="inline-flex items-center gap-1"><Icon name="lock" className="h-4 w-4" /> Keluar mode anak (untuk orang tua)</span></summary>
      <ActionForm action={exitChildMode} className="mt-3 space-y-2">
        <HiddenUsername />
        <input name="password" type="password" required placeholder="Password orang tua" className="input" autoComplete="current-password" />
        <SubmitButton className="btn-outline w-full">Keluar</SubmitButton>
      </ActionForm>
    </details>
  );
}
