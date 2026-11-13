"use client";
import { useState } from "react";
import { Icon } from "@/components/icons";

/** Layar perayaan saat laporan pertama hari ini menyalakan api streak. */
export function StreakCelebrate({ data }: { data?: { streak?: number; best?: number; milestone?: boolean } | null }) {
  // Simpan objek data yang sudah ditutup; hasil simpan berikutnya membawa objek baru sehingga muncul lagi.
  const [closed, setClosed] = useState<object | null>(null);
  const streak = data?.streak ?? 0;
  if (!data || !streak || closed === data) return null;
  const setOpen = (_: false) => setClosed(data);
  return (
    <div role="dialog" aria-modal="true" aria-label={`Streak ${streak} hari`} className="fixed inset-0 z-50 flex items-center justify-center bg-hijau-950/70 p-6 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xs rounded-3xl bg-white p-7 text-center shadow-2xl motion-safe:animate-[sa-pop_.35s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-kuning-500">
          <Icon name="flame" className="h-16 w-16 text-[#c2410c] motion-safe:animate-[sa-flicker_1.2s_ease-in-out_infinite]" />
        </div>
        <p className="mt-4 font-display text-5xl font-bold text-hijau-900">{streak}</p>
        <p className="font-display text-xl font-bold text-hijau-800">hari berturut-turut!</p>
        <p className="mt-2 text-sm text-ink-soft">
          {data?.milestone ? "Tonggak baru tercapai. Terima kasih sudah konsisten mendampingi!" : streak === 1 ? "Api menyala. Catat lagi besok agar streak bertambah." : "Api tetap menyala. Sampai jumpa besok!"}
        </p>
        {data?.best && data.best > streak && <p className="mt-1 text-xs text-ink-soft">Rekor terbaik: {data.best} hari</p>}
        <button type="button" className="btn-primary mt-5 w-full" onClick={() => setOpen(false)}>
          Lanjut
        </button>
      </div>
    </div>
  );
}
