import "server-only";
import { createAdminClient } from "./supabase/admin";
import { createPublicClient } from "./supabase/public";
import { isSupabaseConfigured, SUPABASE_SERVICE_KEY } from "./supabase/env";

export type ScreenRef = { min_age: number; max_age: number; max_min: number; note: string };

export const DEFAULT_SYSTEM_PROMPT = `Anda adalah pendamping digital parenting untuk orang tua di Indonesia.
Anda menerima RINGKASAN ANGKA aktivitas seorang anak selama 7 hari yang sudah dihitung sistem. Jangan menghitung ulang dan jangan mengarang angka baru.

Aturan:
- Tulis dalam bahasa Indonesia yang sederhana, hangat, dan tidak menggurui. Total maksimal sekitar 250 kata.
- Jangan mendiagnosis (jangan memakai kata seperti "kecanduan", "gangguan") dan jangan menyalahkan orang tua.
- Tegaskan bahwa keputusan pendampingan tetap di tangan orang tua.
- Gunakan acuan screen time yang diberikan di data (bukan pengetahuan Anda sendiri).
- Jika jumlah hari tercatat sedikit (kurang dari 4), katakan bahwa datanya masih sedikit dan hindari kesimpulan kuat.
- Jika pola terlihat ekstrem (misalnya rata-rata layar jauh di atas acuan, sering menolak berhenti, sering memakai gawai menjelang tidur), sarankan dengan lembut untuk berkonsultasi ke guru, psikolog, atau tenaga kesehatan.
- Jangan menyebut nama anak; sebut "anak" atau "si kecil".

Balas HANYA dengan JSON valid berformat:
{"ringkasan":"2-3 kalimat","sudah_baik":["..."],"perlu_diperhatikan":["1-2 poin"],"saran":["2-3 langkah konkret"],"ide_obrolan":"1 pertanyaan pembuka untuk anak"}`;

export const DEFAULT_SETTINGS = {
  "ai.model": "anthropic/claude-haiku-5.5",
  "ai.system_prompt": DEFAULT_SYSTEM_PROMPT,
  "ai.max_per_day": 3,
  "ai.max_tokens": 800,
  "ai.enabled": true,
  // API key OpenRouter, terenkripsi AES-256-GCM (lihat lib/openrouter.ts). Kosong = pakai env OPENROUTER_API_KEY.
  "ai.openrouter_key": "",
  // Draf acuan — WAJIB ditetapkan tim (mis. IDAI/WHO) sebelum dipakai.
  "screen_time.reference": [
    { min_age: 0, max_age: 1, max_min: 0, note: "Di bawah 2 tahun sebaiknya tanpa layar kecuali video call keluarga (draf, perlu ditetapkan tim)" },
    { min_age: 2, max_age: 5, max_min: 60, note: "Maksimal 1 jam per hari dengan pendampingan (draf, perlu ditetapkan tim)" },
    { min_age: 6, max_age: 12, max_min: 120, note: "Maksimal 2 jam per hari untuk hiburan (draf, perlu ditetapkan tim)" },
    { min_age: 13, max_age: 18, max_min: 120, note: "Sekitar 2 jam per hari untuk hiburan (draf, perlu ditetapkan tim)" },
  ] as ScreenRef[],
  "reminder.message": "Sudah mencatat aktivitas si kecil hari ini? Cukup 1 menit.",
  "public.consent": {
    version: "1.0",
    text: `Dengan mendaftar, saya menyetujui bahwa:
1. Data yang saya isi (nama, nomor HP/email, RT) dan data anak (nama panggilan, tahun lahir, jenjang sekolah, catatan aktivitas) disimpan untuk keperluan pendampingan dalam program SAHABAT ANAK.
2. Ringkasan angka aktivitas anak — tanpa nama atau identitas — dikirim ke layanan AI untuk dibuatkan saran.
3. Pengurus komunitas hanya melihat data gabungan (minimal 5 keluarga), bukan catatan harian keluarga saya.
4. Pengelola program dapat memakai data anonim untuk evaluasi program dan penelitian.
5. Saya dapat mengunduh dan menghapus seluruh data saya kapan saja melalui menu Profil.`,
  },
  "public.hero": {
    title: "Dampingi Aktivitas Anak, Seimbangkan Dunia Digitalnya",
    subtitle: "Catat aktivitas digital dan non-digital anak dalam 1 menit, lihat keseimbangannya, dan dapatkan saran pendampingan. Keputusan tetap di tangan Ayah dan Bunda.",
    image: "",
  },
  "public.stats": [
    { label: "Keterampilan digital orang tua", before: "28,2%", after: "91,8%" },
    { label: "Praktik pendampingan", before: "3,69", after: "4,14" },
    { label: "Perilaku digital sehat anak", before: "3,43", after: "3,72" },
    { label: "Respons positif peserta", before: "", after: "88%" },
  ],
  // Pratinjau tautan saat dibagikan (WhatsApp/medsos). Kosong = kartu otomatis dari judul hero.
  "public.share": { image: "", description: "" },
  "public.contact": {
    // Kosong = tidak ditampilkan. Isi lewat Admin → Konten.
    address: "",
    whatsapp: "",
    email: "",
  },
  "public.panduan": {
    body: `## Mulai memakai SAHABAT ANAK

1. **Daftar** di halaman Daftar memakai kode undangan dari pengurus komunitas atau sekolah.
2. **Tambah profil anak** (nama panggilan, tahun lahir, jenjang sekolah).
3. **Buat kesepakatan keluarga**: target waktu layar harian dan jam bebas gawai.
4. **Catat aktivitas** setiap hari lewat tombol **+ Catat** di tengah menu bawah.
5. **Isi check-in harian**: suasana hati, respons saat waktu gawai habis, jam tidur.
6. Setiap minggu buka **Insight** dan tekan **Analisis Sekarang**, lalu pilih satu tindak lanjut.

## Pasang di layar utama HP

Buka situs di Chrome, ketuk menu ⋮ lalu pilih **Tambahkan ke layar utama**.`,
    module_url: "",
    module_name: "Modul Pendampingan Digital Keluarga (PDF)",
  },
};

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
export type SettingValue<K extends SettingKey> = (typeof DEFAULT_SETTINGS)[K];

/** Membaca pengaturan (server). Kunci publik dibaca anonim, sisanya via service role. */
export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  const all = await getSettings([key]);
  return all[key];
}

export async function getSettings<K extends SettingKey>(keys: K[]): Promise<{ [P in K]: SettingValue<P> }> {
  const out = {} as { [P in K]: SettingValue<P> };
  for (const k of keys) out[k] = DEFAULT_SETTINGS[k];
  if (!isSupabaseConfigured) return out;
  try {
    const allPublic = keys.every((k) => k.startsWith("public."));
    const client = allPublic || !SUPABASE_SERVICE_KEY ? createPublicClient() : createAdminClient();
    if (!client) return out;
    const { data } = await client.from("settings").select("key,value").in("key", keys);
    for (const row of data ?? []) {
      if (row.value !== null && row.value !== undefined) (out as Record<string, unknown>)[row.key] = row.value;
    }
  } catch {
    // pakai default
  }
  return out;
}

export function referenceForAge(refs: ScreenRef[], age: number): ScreenRef | null {
  return refs.find((r) => age >= r.min_age && age <= r.max_age) ?? null;
}
