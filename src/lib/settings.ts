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
- Jangan memakai tanda pisah panjang (em dash); gunakan koma atau titik.

Balas HANYA dengan JSON valid berformat:
{"ringkasan":"2-3 kalimat","sudah_baik":["..."],"perlu_diperhatikan":["1-2 poin"],"saran":["2-3 langkah konkret"],"ide_obrolan":"1 pertanyaan pembuka untuk anak"}`;

export const DEFAULT_SETTINGS = {
  "ai.model": "anthropic/claude-haiku-5.5",
  "ai.system_prompt": DEFAULT_SYSTEM_PROMPT,
  // Koin AI per akun orang tua per hari. Koin diisi ulang setiap 07.00 WIB (00.00 UTC) dan tidak menumpuk.
  "ai.coins_per_day": 1,
  "ai.max_tokens": 800,
  "ai.enabled": true,
  // API key OpenRouter, terenkripsi AES-256-GCM (lihat lib/openrouter.ts). Kosong = pakai env OPENROUTER_API_KEY.
  "ai.openrouter_key": "",
  // Draf acuan: WAJIB ditetapkan tim (mis. IDAI/WHO) sebelum dipakai.
  "screen_time.reference": [
    { min_age: 0, max_age: 1, max_min: 0, note: "Di bawah 2 tahun sebaiknya tanpa layar kecuali video call keluarga (draf, perlu ditetapkan tim)" },
    { min_age: 2, max_age: 5, max_min: 60, note: "Maksimal 1 jam per hari dengan pendampingan (draf, perlu ditetapkan tim)" },
    { min_age: 6, max_age: 12, max_min: 120, note: "Maksimal 2 jam per hari untuk hiburan (draf, perlu ditetapkan tim)" },
    { min_age: 13, max_age: 18, max_min: 120, note: "Sekitar 2 jam per hari untuk hiburan (draf, perlu ditetapkan tim)" },
  ] as ScreenRef[],
  "reminder.message": "Sudah mencatat aktivitas si kecil hari ini? Cukup 1 menit.",
  "public.consent": {
    version: "1.1",
    text: `Dengan mendaftar, saya menyetujui bahwa:
1. Data yang saya isi (nama, nomor HP/email, RT) dan data anak (nama panggilan, tahun lahir, jenjang sekolah, catatan aktivitas) disimpan untuk keperluan pendampingan dalam program SAHABAT ANAK.
2. Ringkasan angka aktivitas anak (tanpa nama atau identitas) dikirim ke layanan AI untuk dibuatkan saran.
3. Pengurus komunitas melihat statistik gabungan seluruh keluarga (misalnya rata-rata per kelas atau per RT), bukan catatan harian keluarga saya. Karena dihitung dari semua data, kelompok kecil tetap ditampilkan.
4. Pengelola program dapat memakai data anonim untuk evaluasi program dan penelitian.
5. Saya dapat mengunduh dan menghapus seluruh data saya kapan saja melalui menu Profil.`,
  },
  "public.hero": {
    title: "Dampingi Aktivitas Anak, Seimbangkan Dunia Digitalnya",
    subtitle: "Catat aktivitas digital dan non-digital anak dalam 1 menit, lihat keseimbangannya, dan dapatkan saran pendampingan. Keputusan tetap di tangan Ayah dan Bunda.",
    image: "",
  },
  "public.stats": [
    { label: "Keterampilan digital orang tua", before: "28,2%", after: "91,8%", note: "Orang tua yang sudah mampu memakai fitur keamanan gawai dan memahami aplikasi yang dipakai anak." },
    { label: "Praktik pendampingan", before: "3,69", after: "4,14", note: "Seberapa sering orang tua menemani dan berdiskusi saat anak memakai gawai." },
    { label: "Perilaku digital sehat anak", before: "3,43", after: "3,72", note: "Kebiasaan anak memakai gawai secukupnya dan tetap aktif bermain di luar layar." },
    { label: "Respons positif peserta", before: "", after: "88%", note: "Peserta yang menilai program bermanfaat dan ingin melanjutkan." },
  ],
  // Identitas situs: logo khusus (kosong = logo bawaan) dan slogan.
  "public.brand": { logo: "", tagline: "Tumbuh seimbang bersama keluarga" },
  // Isi landing page di luar hero & angka capaian (semua bisa diubah di Admin → Konten).
  "public.landing": {
    badge: "Pendamping digital keluarga Indonesia",
    cta_primary: "Mulai Mencatat",
    cta_secondary: "Pelajari Program",
    stats_label: "Keluarga aktif mencatat",
    stats_eyebrow: "Hasil program",
    stats_title: "Dampak nyata pendampingan",
    stats_text: "Diukur pada peserta sebelum dan sesudah mengikuti program. Skor memakai skala 1 sampai 5, semakin tinggi semakin baik.",
    events_title: "Kegiatan Pendampingan",
    agenda_title: "Agenda Mendatang",
    // Foto dokumentasi di bagian Kegiatan Pendampingan (wajah sudah diburamkan demi privasi).
    events_photos: [
      { url: "/images/kegiatan/sosialisasi-aplikasi.jpg", caption: "Sosialisasi aplikasi bersama orang tua dan anak" },
      { url: "/images/kegiatan/diskusi-orang-tua.jpg", caption: "Diskusi orang tua tentang pendampingan digital" },
      { url: "/images/kegiatan/apresiasi-peserta.jpg", caption: "Apresiasi untuk peserta anak" },
    ],
    features_title: "Fitur Aplikasi",
    features_text: "Dirancang untuk semua perangkat, dari HP, tablet, hingga laptop. Tombol besar, bahasa sederhana. Bukan aplikasi pemblokir, semua dicatat oleh Ayah dan Bunda.",
    features: [
      { icon: "pencil", title: "Catat Aktivitas", text: "Catat waktu gawai dan kegiatan positif anak kurang dari 1 menit." },
      { icon: "chart", title: "Grafik Keseimbangan", text: "Lihat perbandingan digital dan non-digital dalam grafik yang mudah dibaca." },
      { icon: "sparkle", title: "Insight AI", text: "Ringkasan mingguan dan saran pendampingan, bukan perintah." },
      { icon: "agreement", title: "Kesepakatan Keluarga", text: "Tetapkan target waktu layar dan jam bebas gawai, lalu cetak posternya." },
      { icon: "star", title: "Mode Anak", text: "Anak mencatat kegiatannya sendiri dan mengumpulkan bintang." },
      { icon: "community", title: "Pantau Komunitas", text: "Pengurus komunitas atau sekolah melihat data gabungan untuk merencanakan kegiatan." },
    ],
    steps_title: "Cara Kerja",
    steps: [
      { title: "Daftar dengan kode undangan", text: "Minta kode undangan ke pengurus komunitas atau sekolah, lalu daftar dengan nomor HP atau akun Google." },
      { title: "Catat aktivitas harian", text: "Tekan tombol + Catat, pilih jenis aktivitas, selesai dalam satu menit." },
      { title: "Baca insight dan diskusikan dengan anak", text: "Setiap minggu dapatkan ringkasan dan ide obrolan untuk si kecil." },
    ],
    steps_image: "",
    roadmap_title: "Alur Program",
    roadmap: [
      { label: "Tahap 1", title: "Literasi Digital Orang Tua", text: "Orang tua dibekali keterampilan dan pemahaman dunia digital anak." },
      { label: "Tahap 2", title: "Pendampingan Keluarga", text: "Keluarga belajar mendampingi penggunaan gawai yang sehat." },
      { label: "Tahap 3", title: "Aktivitas Alternatif", text: "Anak diajak berkegiatan positif di luar layar dan mulai mencatatnya." },
      { label: "Tahap 4", title: "SAHABAT ANAK", text: "Pencatatan berpindah ke aplikasi dengan grafik dan insight AI." },
    ],
    gallery_title: "Galeri Kegiatan",
    articles_title: "Artikel & Tips",
    cta_title: "Bergabung dengan SAHABAT ANAK",
    cta_text: "Dampingi tumbuh kembang anak bersama keluarga-keluarga lain di komunitas Anda.",
    cta_button: "Daftar Sekarang",
    footer_text: "Sistem Aplikasi Harmoni Aktivitas dan Perilaku Anak. Membantu keluarga mendampingi aktivitas digital dan non-digital anak secara seimbang.",
    show: { stats: true, events: true, features: true, steps: true, roadmap: true, gallery: true, articles: true, cta: true },
  },
  "public.tentang": {
    title: "Tentang SAHABAT ANAK",
    intro: "**SAHABAT ANAK** (Sistem Aplikasi Harmoni Aktivitas dan Perilaku Anak) membantu orang tua mencatat aktivitas digital dan non-digital anak, melihat keseimbangannya, lalu mendapatkan saran pendampingan. Keputusan pendampingan tetap di tangan orang tua.",
    body: `## Latar Belakang

Banyak program pendampingan mencatat aktivitas anak di logbook kertas. Datanya tersebar di lembar setiap peserta, perlu direkap manual, dan sulit divisualisasikan. SAHABAT ANAK memindahkan logbook itu ke HP agar orang tua dan komunitas lebih mudah melihat perkembangan.

## Bukan Parental Control

SAHABAT ANAK tidak memblokir aplikasi, tidak membaca isi HP anak, dan tidak melacak lokasi. Screen time dicatat manual oleh orang tua, seperti logbook.

## Tujuan

- Orang tua mencatat aktivitas anak kurang dari 1 menit per catatan.
- Orang tua melihat keseimbangan aktivitas digital dan non-digital dalam grafik.
- Orang tua mendapat ringkasan dan saran pendampingan dari AI, bukan perintah.
- Komunitas atau sekolah mendapat data gabungan untuk merencanakan kegiatan.
- Pengelola program mendapat data evaluasi untuk laporan dan penelitian.

## Untuk Komunitas & Sekolah

SAHABAT ANAK dapat dipakai komunitas orang tua, sekolah, posyandu, atau kelompok kegiatan di seluruh Indonesia. Pengurus mengundang anggota dengan kode undangan dan hanya melihat data gabungan.

## Untuk Keluarga

Orang tua mencatat sendiri, melihat polanya, lalu memutuskan sendiri langkah pendampingan. Data keluarga tetap milik keluarga dan bisa diunduh atau dihapus kapan saja.

## Alur Program

1. **Literasi digital orang tua**
2. **Pendampingan keluarga** dalam penggunaan gawai
3. **Aktivitas alternatif** anak di luar layar
4. **SAHABAT ANAK**: aplikasi pencatatan, grafik, dan insight AI`,
    image: "",
    show_logo: true,
  },
  "public.privasi": {
    body: `## Data apa yang disimpan?

- Orang tua: nama, nomor HP, email, RT, dan password (tersimpan dalam bentuk hash). Jika masuk dengan Google, kami menerima nama dan email dari akun Google.
- Anak: hanya nama panggilan, tahun lahir, dan jenjang sekolah, tanpa NIK, alamat, atau foto.
- Catatan aktivitas, check-in harian, kesepakatan keluarga, insight, dan refleksi.

## Siapa yang bisa melihat?

- Hanya orang tua yang bersangkutan yang bisa melihat catatan harian anaknya.
- Pengurus komunitas hanya melihat angka gabungan (rata-rata per kelas, per RT, atau seluruh komunitas), bukan catatan harian keluarga. Seluruh data dihitung tanpa ada kelompok yang disembunyikan, sehingga kelompok kecil pun tetap tampil.
- Layanan AI hanya menerima ringkasan angka, tanpa nama atau identitas anak.

## Hak Anda

- Mengunduh seluruh data Anda di menu Profil.
- Menghapus akun beserta seluruh data anak kapan saja.
- Foto anak hanya dipublikasikan jika orang tua memberi izin; izin dicatat per foto.`,
  },
  // Metode masuk. Login Google aktif setelah kredensial dipasang di Supabase (lihat README).
  "public.auth": { google: false },
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
      if (row.value === null || row.value === undefined) continue;
      const def = (DEFAULT_SETTINGS as Record<string, unknown>)[row.key];
      const isObj = (v: unknown) => typeof v === "object" && v !== null && !Array.isArray(v);
      // Objek digabung dengan default agar kolom baru tetap punya nilai awal.
      (out as Record<string, unknown>)[row.key] = isObj(def) && isObj(row.value) ? { ...(def as object), ...(row.value as object) } : row.value;
    }
  } catch {
    // pakai default
  }
  return out;
}

export function referenceForAge(refs: ScreenRef[], age: number): ScreenRef | null {
  return refs.find((r) => age >= r.min_age && age <= r.max_age) ?? null;
}
