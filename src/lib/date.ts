/** Utilitas tanggal berbasis WIB (Asia/Jakarta, UTC+7). Tanggal dalam format YYYY-MM-DD. */
export const TZ = "Asia/Jakarta";

export function toDateStr(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Menggabungkan tanggal WIB + jam "HH:MM" menjadi ISO timestamp. */
export function wibToIso(dateStr: string, time: string): string {
  return new Date(`${dateStr}T${time}:00+07:00`).toISOString();
}

export function isoToWibTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

export function wibHour(iso: string): number {
  return Number(isoToWibTime(iso).slice(0, 2));
}

export function formatTanggal(input: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }): string {
  const d = typeof input === "string" ? new Date(input.length === 10 ? `${input}T00:00:00+07:00` : input) : input;
  return new Intl.DateTimeFormat("id-ID", { timeZone: TZ, ...opts }).format(d);
}

export function formatHari(dateStr: string): string {
  return formatTanggal(dateStr, { weekday: "long", day: "numeric", month: "long" });
}

export function formatMenit(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} mnt`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} j ${r} mnt` : `${h} jam`;
}

/** Senin pertama dari minggu yang memuat tanggal ini. */
export function startOfWeek(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // Senin = 0
  return addDays(dateStr, -dow);
}

/** ISO timestamp n hari yang lalu dari sekarang. */
export function isoDaysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString();
}

/** Periode koin AI: mulai 07.00 WIB (= 00.00 UTC) hari ini, berakhir 07.00 WIB esok hari. */
export function coinPeriod(now = new Date()): { start: Date; next: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return { start, next: new Date(start.getTime() + 86_400_000) };
}
