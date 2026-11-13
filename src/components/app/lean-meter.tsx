import { Icon } from "@/components/icons";
import { formatMenit } from "@/lib/date";

/** Kecenderungan anak: lebih condong ke gawai (screen time) atau ke kegiatan di luar layar. */
export function leanOf(digital: number, positif: number) {
  const total = digital + positif;
  if (!total) return { pct: 50, label: "Belum ada data", tone: "none" as const };
  const pct = Math.round((positif / total) * 100); // 0 = semua gawai, 100 = semua kegiatan luar layar
  if (pct >= 60) return { pct, label: "Lebih condong ke kegiatan di luar layar", tone: "good" as const };
  if (pct <= 40) return { pct, label: "Lebih condong ke gawai (screen time)", tone: "warn" as const };
  return { pct, label: "Cukup seimbang", tone: "mid" as const };
}

export function LeanMeter({ digital, positif, period }: { digital: number; positif: number; period: string }) {
  const l = leanOf(digital, positif);
  const color = l.tone === "good" ? "text-hijau-700" : l.tone === "warn" ? "text-merah-600" : "text-kuning-800";
  return (
    <div className="card">
      <p className="flex items-center gap-1.5 text-sm font-bold text-hijau-700">
        <Icon name="scale" className="h-4 w-4" /> Kecenderungan {period}
      </p>
      <p className={`mt-1 text-lg font-extrabold ${l.tone === "none" ? "text-ink-soft" : color}`}>{l.label}</p>
      <div className="relative mt-3">
        <div className="flex h-3 overflow-hidden rounded-full" aria-hidden>
          <span className="bg-gelap-700" style={{ width: `${100 - l.pct}%` }} />
          <span className="bg-hijau-600" style={{ width: `${l.pct}%` }} />
        </div>
        {l.tone !== "none" && (
          <span className="absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kuning-500 ring-2 ring-white" style={{ left: `${100 - l.pct}%` }} aria-hidden />
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <Icon name="device" className="h-3.5 w-3.5" /> Gawai {formatMenit(digital)} {digital + positif ? `(${100 - l.pct}%)` : ""}
        </span>
        <span className="inline-flex items-center gap-1">
          Kegiatan luar layar {formatMenit(positif)} {digital + positif ? `(${l.pct}%)` : ""} <Icon name="leaf" className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
