/** Aturan privasi statistik: kelompok ditampilkan hanya jika ≥ 5 keluarga. */
export const MIN_GROUP_FAMILIES = 5;

export function canShowGroup(familyCount: number): boolean {
  return familyCount >= MIN_GROUP_FAMILIES;
}

export function suppress<T>(familyCount: number, value: T): T | null {
  return canShowGroup(familyCount) ? value : null;
}
