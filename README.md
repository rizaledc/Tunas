# SAHABAT ANAK

**Sistem Aplikasi Harmoni Aktivitas dan Perilaku Anak** — website mobile-first untuk Komunitas TUNAS (Tunggu Anak Siap) Banyumas × PKM Telkom University. Orang tua mencatat aktivitas digital dan non-digital anak, melihat keseimbangannya, dan mendapat insight AI. Spesifikasi lengkap: [`PRD Website SAHABAT ANAK.md`](./PRD%20Website%20SAHABAT%20ANAK.md).

## Teknologi

| Lapisan | Pilihan |
| --- | --- |
| Frontend + backend | Next.js 16 (App Router, Server Actions) + TypeScript + Tailwind CSS 4 |
| Database, auth, storage | Supabase (PostgreSQL + Row Level Security, Auth + TOTP 2FA, Storage) |
| Grafik | Recharts |
| AI | OpenRouter → `anthropic/claude-haiku-5.5` (bisa diganti di Pengaturan) |
| Ekspor | ExcelJS (xlsx), jsPDF (pdf) |
| Notifikasi | PWA + Web Push (Vercel Cron harian) |
| Hosting | Vercel (`vercel.json`, region Singapura) |

## Struktur

```
src/app/(site)/        Halaman publik: /, /tentang, /kegiatan, /galeri, /artikel, /panduan, /privasi
src/app/(auth)/        /daftar, /login, /login/admin (+ verifikasi 2FA), lupa/reset password
src/app/app/           Dashboard orang tua (/app, catat, checkin, riwayat, analitik, insight,
                       kesepakatan + poster, anak, kegiatan, profil, evaluasi, mode-anak)
src/app/admin/         Panel admin (dashboard, anggota, statistik, laporan, konten, kegiatan,
                       evaluasi, impor logbook, monitoring AI, pengaturan, log)
src/app/api/           data-saya (unduh data pribadi), admin/laporan, admin/template, cron/reminder
src/lib/               auth, indikator & insight AI, statistik agregat (min. 5 keluarga), SUS, dll.
supabase/migrations/   Skema 17 tabel inti + RLS + bucket storage
supabase/seed.sql      Kategori aktivitas & contoh konten
tests/                 Unit test (vitest)
```

## Menjalankan secara lokal

Butuh Node.js 20+ dan Docker (untuk Supabase lokal).

```bash
npm install
npx supabase start          # menerapkan migrasi + seed
cp .env.example .env.local  # isi URL & key dari output `supabase start`
node --env-file=.env.local scripts/create-superadmin.mjs "Tim PKM" admin@contoh.id "PasswordKuat123"
npm run dev
```

Buka http://localhost:3000. Masuk admin di `/login/admin`, buat kode undangan di **Anggota**, lalu daftar sebagai orang tua di `/daftar?kode=KODE`.

Perintah lain: `npm test` (unit test), `npm run typecheck`, `npm run lint`, `npm run build`.

## Deploy ke produksi

1. **Supabase**: buat project, lalu `npx supabase link --project-ref <ref>` dan `npx supabase db push` (menerapkan `supabase/migrations`). Jalankan `supabase/seed.sql` di SQL editor. Aktifkan **MFA TOTP** di Authentication → Multi-Factor. Atur Site URL ke `https://sahabatanaktunas.com` dan tambahkan redirect `https://sahabatanaktunas.com/auth/callback`.
2. **Vercel**: impor repo ini, isi environment variable sesuai `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://sahabatanaktunas.com`
   - `OPENROUTER_API_KEY` (pasang limit kredit di dashboard OpenRouter, mis. USD 10–15)
   - `APP_SECRET` (string acak panjang, untuk cookie mode anak)
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`npx web-push generate-vapid-keys`)
   - `CRON_SECRET` (dipakai Vercel Cron untuk `/api/cron/reminder`, setiap hari 19.00 WIB)
3. **Domain**: arahkan `sahabatanaktunas.com` ke Vercel.
4. Buat superadmin pertama dengan `scripts/create-superadmin.mjs` (pakai env produksi), lalu tambah admin komunitas lewat **Pengaturan → Akun Admin**.

## Privasi & keamanan (ringkas)

- RLS: orang tua hanya membaca/menulis data keluarganya. Admin komunitas **tidak** punya akses baris ke catatan, check-in, insight, atau refleksi — statistik dihitung di server dan kelompok di bawah **5 keluarga** disembunyikan.
- Data ke AI hanya ringkasan angka (tanpa nama). Jika AI gagal / saldo habis / dimatikan, sistem memakai ringkasan rule-based.
- Batas 3 analisis/anak/hari, cache bila data tidak berubah, `max_tokens` 800.
- Consent berversi: mengubah versi di Pengaturan meminta persetujuan ulang. Orang tua bisa unduh (Excel/JSON) dan hapus seluruh datanya.
- Login dibatasi 5 kali gagal / 15 menit, login admin terpisah, 2FA TOTP opsional untuk superadmin, audit log aksi admin.
- Foto galeri dikompres ke WebP di browser dan hanya tampil jika izin publikasi dicentang.

## Yang masih perlu diputuskan tim (lihat PRD §12)

- **Acuan screen time** per usia masih draf (Pengaturan → Acuan Screen Time) — tetapkan dari pedoman resmi (IDAI/WHO).
- **Kategori** aktivitas perlu disamakan dengan logbook kertas asli (Pengaturan → Kategori).
- **Logo** SAHABAT ANAK di repo adalah logo sementara; logo TUNAS & Telkom University ditampilkan sebagai teks sampai file resmi tersedia.
- **Foto** landing page diunggah lewat Konten setelah izin publikasi orang tua ada.
- Kontak WhatsApp/email di footer masih contoh — ubah di Konten → Hero & Angka.
