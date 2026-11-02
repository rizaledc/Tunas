"use client";
import { useTransition } from "react";
import { selectChild } from "@/app/app/actions";

export function ChildSwitcher({ items, activeId }: { items: Array<{ id: string; nickname: string }>; activeId?: string }) {
  const [pending, start] = useTransition();
  if (items.length < 2) return items[0] ? <span className="font-extrabold">{items[0].nickname}</span> : null;
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Pilih anak</span>
      <select
        className="rounded-xl border border-white/40 bg-white/15 px-3 py-2 font-extrabold text-white"
        value={activeId}
        disabled={pending}
        onChange={(e) => start(() => selectChild(e.target.value))}
      >
        {items.map((c) => (
          <option key={c.id} value={c.id} className="text-ink">
            {c.nickname}
          </option>
        ))}
      </select>
    </label>
  );
}
