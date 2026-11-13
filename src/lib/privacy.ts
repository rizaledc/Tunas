/**
 * Aturan statistik admin: seluruh data dianalisis tanpa ada kelompok yang disembunyikan.
 * Kelompok hanya ditandai kosong bila belum ada satu pun keluarga yang mencatat.
 */
export const MIN_GROUP_FAMILIES = 1;

export function canShowGroup(familyCount: number): boolean {
  return familyCount >= MIN_GROUP_FAMILIES;
}

export function suppress<T>(familyCount: number, value: T): T | null {
  return canShowGroup(familyCount) ? value : null;
}
