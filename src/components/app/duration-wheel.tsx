"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ITEM = 44; // tinggi satu baris (px)

/** Satu kolom angka yang bisa digulir (scroll-snap), mirip pemilih waktu di HP. */
function Wheel({ values, value, onChange, label, suffix }: { values: number[]; value: number; onChange: (v: number) => void; label: string; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fromScroll = useRef(false);

  // Sinkronkan posisi gulir dengan nilai dari luar (mis. tombol 15/30/60 menit).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (fromScroll.current) {
      fromScroll.current = false;
      return;
    }
    const i = Math.max(0, values.indexOf(value));
    el.scrollTo({ top: i * ITEM, behavior: "smooth" });
  }, [value, values]);

  const onScroll = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const i = Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM)));
      if (values[i] !== value) {
        fromScroll.current = true;
        onChange(values[i]);
      }
    }, 90);
  };

  const step = (d: number) => {
    const i = Math.min(values.length - 1, Math.max(0, values.indexOf(value) + d));
    onChange(values[i]);
  };

  return (
    <div className="flex-1">
      <p className="mb-1 text-center text-xs font-bold tracking-wide text-ink-soft uppercase">{label}</p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-1 top-1/2 h-11 -translate-y-1/2 rounded-xl border-2 border-hijau-600 bg-hijau-50" aria-hidden />
        <div
          ref={ref}
          role="spinbutton"
          tabIndex={0}
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={values[0]}
          aria-valuemax={values[values.length - 1]}
          aria-valuetext={`${value} ${suffix}`}
          onScroll={onScroll}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              step(e.key === "ArrowUp" ? -1 : 1);
            }
          }}
          className="relative h-[132px] snap-y snap-mandatory overflow-y-scroll overscroll-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-hijau-600 [&::-webkit-scrollbar]:hidden"
          style={{ paddingBlock: ITEM }}
        >
          {values.map((v) => (
            <button
              type="button"
              key={v}
              tabIndex={-1}
              onClick={() => onChange(v)}
              className={cn("flex h-11 w-full snap-center items-center justify-center text-xl tabular-nums transition", v === value ? "font-extrabold text-hijau-800" : "text-ink-soft/70")}
            >
              {v}
              <span className="ml-1 text-sm font-semibold">{suffix}</span>
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-paper to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-paper to-transparent" aria-hidden />
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 25 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/** Pemilih durasi jam + menit. `max` = sisa menit yang masih boleh dicatat hari itu. */
export function DurationWheel({ value, onChange, max = 1440 }: { value: number; onChange: (min: number) => void; max?: number }) {
  const h = Math.floor(value / 60);
  const m = value % 60;
  const set = (nh: number, nm: number) => {
    let total = nh * 60 + nm;
    if (nh === 24) total = 1440;
    onChange(Math.min(total, 1440));
  };
  const over = value > max;
  return (
    <div>
      <div className="flex gap-3 rounded-2xl bg-paper p-2 ring-1 ring-gray-200">
        <Wheel label="Jam" suffix="jam" values={HOURS} value={h} onChange={(v) => set(v, v === 24 ? 0 : m)} />
        <Wheel label="Menit" suffix="mnt" values={MINUTES} value={h === 24 ? 0 : m} onChange={(v) => set(h === 24 ? 23 : h, v)} />
      </div>
      <p className={cn("mt-2 text-center text-sm font-bold", over ? "text-merah-600" : "text-hijau-800")} aria-live="polite">
        {value === 0 ? "Gulir untuk memilih durasi" : `${h ? `${h} jam ` : ""}${m || !h ? `${m} menit` : ""}`.trim()}
        {over && " · melebihi sisa waktu hari ini"}
      </p>
    </div>
  );
}
