/** "91,8%" → { value: 91.8, percent: true }; "4,14" → { value: 4.14, percent: false } */
export function parseStat(raw?: string): { value: number; percent: boolean } | null {
  if (!raw) return null;
  const m = raw.replace(/\s/g, "").match(/-?\d+(?:[.,]\d+)?/);
  if (!m) return null;
  const value = Number(m[0].replace(",", "."));
  return Number.isFinite(value) ? { value, percent: raw.includes("%") } : null;
}
