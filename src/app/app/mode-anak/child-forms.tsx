"use client";
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui";
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
            <p className="mb-3 text-center text-2xl font-extrabold text-oranye-600">Hari ini aku…</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  aria-pressed={cat === c.id}
                  className={cn("flex flex-col items-center gap-1 rounded-3xl border-4 bg-white p-4 shadow-sm transition", cat === c.id ? "scale-105 border-oranye-500" : "border-transparent")}
                >
                  <span className="text-5xl" aria-hidden>
                    {c.icon}
                  </span>
                  <span className="text-center text-base leading-tight font-extrabold">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-center text-2xl font-extrabold text-tunas-700">Berapa lama?</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                [15, "Sebentar", "🐣"],
                [30, "Lumayan", "🐥"],
                [60, "Lama", "🐓"],
              ].map(([m, label, icon]) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setDur(Number(m))}
                  aria-pressed={dur === m}
                  className={cn("flex flex-col items-center rounded-3xl border-4 bg-white p-3 font-extrabold", dur === m ? "border-tunas-500" : "border-transparent")}
                >
                  <span className="text-4xl">{icon}</span>
                  {label}
                  <span className="text-sm font-semibold text-ink-soft">{m} menit</span>
                </button>
              ))}
            </div>
          </div>
          {state?.ok && <p className="animate-bounce text-center text-5xl">⭐</p>}
          <SubmitButton disabled={!cat || !dur} className="btn w-full rounded-3xl bg-oranye-500 py-5 text-2xl text-white shadow-lg">
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
          <button type="button" key={k.id} disabled={!k.hasPin} onClick={() => setId(k.id)} className={cn("rounded-3xl border-4 bg-white p-4 text-xl font-extrabold disabled:opacity-40", id === k.id ? "border-oranye-500" : "border-transparent")}>
            🧒 {k.nickname}
            {!k.hasPin && <span className="block text-xs font-semibold">PIN belum diatur</span>}
          </button>
        ))}
      </div>
      <input name="pin" inputMode="numeric" pattern="\d{4}" maxLength={4} required autoComplete="off" placeholder="PIN" className="input text-center text-3xl tracking-[0.6em]" />
      <SubmitButton disabled={!id} className="btn w-full rounded-3xl bg-oranye-500 py-4 text-xl text-white">
        Masuk Mode Anak
      </SubmitButton>
    </ActionForm>
  );
}

export function ExitForm() {
  return (
    <details className="rounded-2xl bg-white/70 p-3">
      <summary className="cursor-pointer text-center text-sm font-bold text-ink-soft">🔒 Keluar mode anak (untuk orang tua)</summary>
      <ActionForm action={exitChildMode} className="mt-3 space-y-2">
        <input name="password" type="password" required placeholder="Password orang tua" className="input" autoComplete="current-password" />
        <SubmitButton className="btn-outline w-full">Keluar</SubmitButton>
      </ActionForm>
    </details>
  );
}
