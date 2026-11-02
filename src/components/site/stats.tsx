import { Icon } from "@/components/icons";
import { Eyebrow, Headline } from "@/components/site/parts";
import { parseStat } from "@/lib/stat-value";

export type StatItem = { label: string; before?: string; after: string; note?: string };

const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });

/** Skala pembanding untuk bar: persen → 100, skor kecil → 5 atau 10. */
function scaleOf(values: number[], percent: boolean) {
  if (percent) return { max: 100, caption: "" };
  const top = Math.max(...values);
  if (top <= 5) return { max: 5, caption: "Skor skala 1 sampai 5" };
  if (top <= 10) return { max: 10, caption: "Skor skala 1 sampai 10" };
  return { max: top, caption: "" };
}

function describe(s: StatItem) {
  const a = parseStat(s.after);
  const b = parseStat(s.before);
  if (!a) return null;
  const sc = scaleOf([a.value, b?.value ?? 0], a.percent);
  const pct = (v: number) => Math.max(3, Math.min(100, (v / sc.max) * 100));
  let change = "";
  if (b) {
    const d = a.value - b.value;
    const up = d >= 0;
    if (a.percent) change = `${up ? "Naik" : "Turun"} ${fmt(Math.abs(d))} poin`;
    else change = `${up ? "Naik" : "Turun"} ${fmt(Math.abs(d))} poin (${fmt(Math.abs((d / (b.value || 1)) * 100))}%)`;
  }
  return { a, b, sc, pct, change, up: !b || a.value >= b.value };
}

function Bar({ label, value, width, strong }: { label: string; value: string; width: number; strong?: boolean }) {
  return (
    <div className="grid grid-cols-[4.25rem_1fr_auto] items-center gap-3 text-xs">
      <span className={strong ? "font-semibold text-white" : "text-white/55"}>{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-white/10">
        <span className={`block h-full rounded-full ${strong ? "bg-gradient-to-r from-aksen-600 to-emas-400" : "bg-white/35"}`} style={{ width: `${width}%` }} />
      </span>
      <span className={`tabular-nums ${strong ? "font-bold text-white" : "text-white/60"}`}>{value}</span>
    </div>
  );
}

export function StatsSection({ stats, eyebrow, title, text }: { stats: StatItem[]; eyebrow?: string; title?: string; text?: string }) {
  return (
    <section className="bg-gelap-950 text-white" aria-label="Angka capaian program">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && <Headline text={title} className="mt-5 text-4xl md:text-5xl" />}
          </div>
          {text && <p className="max-w-md text-white/65 lg:justify-self-end">{text}</p>}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => {
            const d = describe(s);
            return (
              <article key={s.label} className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="font-bold leading-snug text-white">{s.label}</h3>
                {s.note && <p className="mt-2 text-sm leading-relaxed text-white/60">{s.note}</p>}
                <div className="mt-auto pt-6">
                  <p className="display text-5xl text-white">{s.after}</p>
                  {d?.change ? (
                    <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${d.up ? "bg-emas-400/15 text-emas-300" : "bg-white/10 text-white/70"}`}>
                      <Icon name="chart" className="h-3.5 w-3.5" /> {d.change}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs font-semibold text-white/50">{d?.a.percent ? "dari seluruh peserta" : "hasil akhir program"}</p>
                  )}
                  {d && (
                    <div className="mt-5 space-y-2.5">
                      {d.b && s.before && <Bar label="Sebelum" value={s.before} width={d.pct(d.b.value)} />}
                      <Bar label={d.b ? "Sesudah" : "Hasil"} value={s.after} width={d.pct(d.a.value)} strong />
                      {d.sc.caption && <p className="pt-1 text-[11px] text-white/45">{d.sc.caption}, makin tinggi makin baik</p>}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
