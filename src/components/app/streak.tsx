import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Streak } from "@/lib/streak";

const DAY = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/** Lencana kecil api + angka untuk header aplikasi. */
export function StreakBadge({ s }: { s: Streak }) {
  return (
    <Link
      href="/app#streak"
      aria-label={`Streak ${s.current} hari${s.doneToday ? "" : ", belum melapor hari ini"}`}
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-extrabold", s.doneToday ? "bg-kuning-500 text-hijau-950" : "bg-white/15 text-white")}
    >
      <Icon name="flame" className={cn("h-4 w-4", s.doneToday ? "text-[#c2410c]" : "text-white/70")} />
      {s.current}
    </Link>
  );
}

/** Kartu streak gaya Duolingo: api besar, jumlah hari, dan 7 hari terakhir. */
export function StreakCard({ s }: { s: Streak }) {
  const lit = s.doneToday;
  return (
    <section id="streak" className={cn("card overflow-hidden", lit ? "border-2 border-kuning-400 bg-gradient-to-br from-kuning-50 to-white" : s.atRisk ? "border-2 border-dashed border-kuning-500" : "")}>
      <div className="flex items-center gap-4">
        <div className={cn("relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl", lit ? "bg-kuning-500" : "bg-gray-100")}>
          <Icon name="flame" className={cn("h-10 w-10", lit ? "text-[#c2410c] motion-safe:animate-[sa-flicker_1.6s_ease-in-out_infinite]" : "text-gray-400")} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-3xl leading-none font-bold text-hijau-900">
            {s.current} <span className="text-lg">hari</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            {lit
              ? "Api menyala! Laporan hari ini sudah masuk."
              : s.atRisk
                ? "Catat hari ini agar api tidak padam."
                : s.best > 0
                  ? "Api padam. Mulai lagi dengan mencatat hari ini."
                  : "Catat setiap hari untuk menyalakan api."}
          </p>
        </div>
      </div>
      <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label="7 hari terakhir">
        {s.week.map((d, i) => {
          const isToday = i === 6;
          return (
            <li key={d.date} className="flex flex-col items-center gap-1">
              <span className={cn("text-[11px] font-bold", isToday ? "text-hijau-800" : "text-ink-soft")}>{isToday ? "Hari ini" : DAY[new Date(`${d.date}T12:00:00+07:00`).getUTCDay()]}</span>
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", d.done ? "bg-kuning-500 text-[#c2410c]" : isToday ? "border-2 border-dashed border-kuning-500 text-kuning-600" : "bg-gray-100 text-gray-300")} aria-label={d.done ? "melapor" : "tidak melapor"}>
                <Icon name="flame" className="h-5 w-5" />
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
        <span>Rekor terbaik: <strong className="text-ink">{s.best} hari</strong></span>
        {s.nextMilestone && <span>{s.nextMilestone - s.current} hari lagi menuju {s.nextMilestone} hari</span>}
        {!lit && (
          <Link href="/app/catat" className="btn-yellow btn-sm">
            <Icon name="flame" className="h-4 w-4" /> Catat sekarang
          </Link>
        )}
      </div>
    </section>
  );
}
