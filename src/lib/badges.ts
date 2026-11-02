export type ChildLog = { log_date: string; category_id: string | null };

export function computeBadges(logs: ChildLog[], today: string) {
  const stars = logs.length;
  const cats = new Set(logs.map((l) => l.category_id)).size;
  const recent = new Set(logs.filter((l) => l.log_date >= addDays(today, -6)).map((l) => l.log_date)).size;
  return {
    stars,
    badges: [
      { icon: "🌟", name: "Bintang Pertama", desc: "Mencatat kegiatan pertama", earned: stars >= 1 },
      { icon: "💪", name: "Rajin", desc: "Mengumpulkan 5 bintang", earned: stars >= 5 },
      { icon: "🧭", name: "Penjelajah", desc: "Mencoba 3 jenis kegiatan", earned: cats >= 3 },
      { icon: "📅", name: "Seminggu Hebat", desc: "Mencatat 5 hari dalam seminggu", earned: recent >= 5 },
      { icon: "🏆", name: "Juara", desc: "Mengumpulkan 15 bintang", earned: stars >= 15 },
      { icon: "🚀", name: "Bintang Super", desc: "Mengumpulkan 30 bintang", earned: stars >= 30 },
    ],
  };
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
