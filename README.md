# SAHABAT ANAK

**Sistem Aplikasi Harmoni Aktivitas dan Perilaku Anak** — website mobile-first untuk keluarga, komunitas, dan sekolah di seluruh Indonesia. Orang tua mencatat aktivitas digital dan non-digital anak, melihat keseimbangannya, dan mendapat insight AI. Spesifikasi lengkap: [`PRD Website SAHABAT ANAK.md`](./PRD%20Website%20SAHABAT%20ANAK.md).

## Logo

<img src="public/logo.svg" width="72" alt="Logo SAHABAT ANAK" /> <img src="public/icons/icon.svg" width="72" alt="Ikon aplikasi SAHABAT ANAK" />

Dua daun yang tumbuh dari satu titik. **Daun besar marun** adalah orang tua yang menaungi (dan dunia nyata tempat anak bermain); **daun kecil merah** adalah anak yang sedang tumbuh. Keduanya berangkat dari akar yang sama — keluarga dan komunitas tempat anak tumbuh — dan bersama-sama membentuk tanda ✓: keseimbangan digital yang dicapai berdua, bukan diperintahkan. Warna kata mengikuti daun: **SAHABAT** marun, **ANAK** merah.

**Palet warna** mengikuti Telkom: merah `#FF0000`, merah tua `#B00000` (turunan marun `#940000` sebagai warna utama), putih, abu `#808080`, abu gelap `#333333`, dan hitam. Aksen emas `#E8B54D` dipakai untuk ikon dan detail kecil. Font: Plus Jakarta Sans. Token warna ada di `src/app/globals.css` (`marun-*`, `aksen-*`, `gelap-*`, `emas-*`).

Berkas: `public/logo.svg` (latar terang), `public/icons/icon.svg` (ikon aplikasi), PNG 192/512/maskable di `public/icons/`, gambar pratinjau tautan `src/app/opengraph-image.png`. Komponen React: `LogoMark` dan `Logo` di `src/components/logo.tsx`.

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
node --env-file=.env.local scripts/create-superadmin.mjs "Pengelola" admin@contoh.id "Kuat!Sekali2026"
npm run dev
```

Buka http://localhost:3000. Masuk admin di `/login/admin`, buat kode undangan di **Anggota**, lalu daftar sebagai orang tua di `/daftar?kode=KODE`.

Perintah lain: `npm test` (unit test), `npm run typecheck`, `npm run lint`, `npm run build`.

## Deploy ke produksi

1. **Supabase**: buat project, buka **SQL Editor**, tempel seluruh isi `supabase/setup.sql` (skema + RLS + storage + data awal) lalu **Run** sekali. Alternatif CLI: `npx supabase link --project-ref <ref>` lalu `npx supabase db push` dan jalankan `supabase/seed.sql`. Aktifkan **MFA TOTP** di Authentication → Multi-Factor. Atur Site URL ke domain Anda (mis. `https://domain-anda.id`) dan tambahkan redirect `https://domain-anda.id/auth/callback`.
2. **Vercel**: impor repo ini, isi environment variable sesuai `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://domain-anda.id`
   - `OPENROUTER_API_KEY` — **opsional**; API key bisa diisi langsung dari **Panel Admin → Pengaturan → AI & Prompt** (lihat bawah)
   - `APP_SECRET` (string acak panjang, untuk cookie mode anak)
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`npx web-push generate-vapid-keys`)
   - `CRON_SECRET` (dipakai Vercel Cron untuk `/api/cron/reminder`, setiap hari 19.00 WIB)
3. **Domain**: arahkan domain Anda ke Vercel.
4. Buat superadmin pertama dengan `scripts/create-superadmin.mjs` (pakai env produksi), lalu tambah admin komunitas lewat **Pengaturan → Akun Admin**.

## Masuk & daftar dengan Google

Kredensial Google **tidak** disimpan di kode/Vercel — cukup di Google Cloud dan Supabase. Panduan yang sama (dengan URL yang sudah terisi otomatis untuk domain Anda) ada di **Admin → Pengaturan → Login & Google**.

| Di mana | Kolom | Isi |
| --- | --- | --- |
| Google Cloud Console → APIs & Services → OAuth consent screen | App name, support email, logo, authorized domain | SAHABAT ANAK, email pengelola, logo, `domain-anda.id` |
| Google Cloud Console → Credentials → Create OAuth client ID (*Web application*) | Authorized JavaScript origins | `https://domain-anda.id` |
| | Authorized redirect URIs | `https://<project-ref>.supabase.co/auth/v1/callback` |
| Supabase → Authentication → Sign In / Providers → **Google** | Client ID, Client Secret | dari langkah sebelumnya, lalu **Enable** |
| Supabase → Authentication → URL Configuration | Site URL / Redirect URLs | `https://domain-anda.id` / `https://domain-anda.id/auth/callback` |

Setelah itu nyalakan **"Tampilkan tombol Masuk/Daftar dengan Google"** di panel (panel menolak menyalakan jika provider di Supabase belum aktif). Pengguna Google tetap diminta kode undangan, nomor HP, dan persetujuan data saat pertama kali masuk. Akun pengurus tetap masuk lewat `/login/admin`.

Lokal (opsional): isi `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` dan `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`, ubah `enabled = true` di `[auth.external.google]` pada `supabase/config.toml`, lalu restart Supabase; redirect URI Google untuk lokal: `http://127.0.0.1:54321/auth/v1/callback`.

## Akun, password, dan validasi

- **Password kuat**: minimal 10 karakter, ada huruf besar, huruf kecil, angka, dan simbol; bukan kata umum, nama, atau nomor HP pengguna. Formulir menampilkan checklist syarat, indikator kekuatan, dan tombol **Buatkan password kuat**. Aturan yang sama diperiksa ulang di server (daftar, reset, ganti password, akun buatan admin).
- **Nomor HP**: hanya angka (huruf otomatis tidak bisa diketik), harus nomor seluler Indonesia (08… / 628…).
- **Email**: format diperiksa; salah ketik umum (mis. `gmial.com`) diberi saran perbaikan.
- **Daftar mandiri tanpa Google** wajib nomor HP **dan** email (email dipakai untuk memulihkan password sendiri). Daftar dengan Google wajib nomor HP.
- **Admin membuat akun** di **Admin → Anggota → Buat akun orang tua** (cukup nomor HP atau email; password otomatis yang kuat atau ditentukan sendiri, lengkap dengan tombol kirim lewat WhatsApp). Admin juga bisa **ubah data**, **reset password**, menonaktifkan, dan impor dari Excel.
- Disarankan juga mengatur *Password requirements* di Supabase → Authentication → Policies agar sama ketatnya.

## Konten yang bisa diubah dari panel admin

Semua teks dan gambar situs publik dapat diubah di **Admin → Konten** tanpa coding: hero & foto, angka capaian, seluruh bagian beranda (label, fitur & ikon, cara kerja + gambar, alur program, judul bagian, ajakan, teks footer, tampil/sembunyi per bagian), logo & slogan, halaman Tentang (teks + foto), halaman Privasi, panduan & modul PDF, kontak, gambar saat dibagikan, artikel, galeri (unggah banyak, **ganti foto**, keterangan, kategori, izin publikasi, hapus), kegiatan (sampul, dokumentasi, daftar hadir). Superadmin mengatur kategori & ikon, AI, consent, acuan screen time, pengingat, akun admin, dan login Google. Setiap bagian punya tombol **Kembalikan ke bawaan**.

## Pratinjau tautan (WhatsApp & media sosial)

Setiap halaman mengirim meta Open Graph/Twitter lengkap (judul, deskripsi, URL kanonik, gambar 1200×630 JPEG ±30–50 KB — format & ukuran yang andal untuk WhatsApp):

- **Beranda & halaman umum**: kartu bermerek otomatis dari judul hero; admin bisa mengganti deskripsi atau mengunggah gambar sendiri di **Admin → Konten → Tampilan saat dibagikan** (ada pratinjau gaya WhatsApp).
- **Artikel & kegiatan**: kartu memakai foto sampul + judul (dan tanggal untuk kegiatan); tanpa foto memakai kartu bermerek. Ada tombol **Bagikan** (WhatsApp, Facebook, X, Telegram, salin tautan, menu bagikan HP).
- **Tautan undangan** `/daftar?kode=…`: kartu "Anda diundang bergabung".

Agar gambar muncul, URL situs harus publik dan absolut: isi `NEXT_PUBLIC_SITE_URL` (di Vercel otomatis memakai domain produksi bila kosong). WhatsApp menyimpan pratinjau lama beberapa jam; untuk Facebook gunakan [Sharing Debugger](https://developers.facebook.com/tools/debug/) → *Scrape Again*.

## Mengaktifkan AI (tanpa coding)

Semua pengaturan AI dilakukan superadmin di **Panel Admin → Pengaturan → AI & Prompt**:

1. Buat API key di [openrouter.ai/keys](https://openrouter.ai/keys), **pasang limit kredit** pada kunci (mis. USD 10–15), lalu isi saldo di [openrouter.ai/credits](https://openrouter.ai/credits).
2. Tempel kunci → **Verifikasi & Simpan**. Kunci dicek ke OpenRouter dulu, lalu disimpan terenkripsi (AES-256-GCM dengan `APP_SECRET`) dan hanya ditampilkan tersamar.
3. Tekan **Uji koneksi & contoh insight**: memeriksa kunci & saldo, memastikan model ada di katalog (beserta harga), dan menjalankan satu insight dari data contoh anonim.
4. Atur model (daftar diambil otomatis dari katalog OpenRouter, lengkap dengan perkiraan biaya per analisis), batas analisis per anak per hari, `max_tokens`, prompt sistem (ada tombol pulihkan bawaan), atau matikan AI sementara.

Kunci di panel diutamakan; jika kosong dipakai `OPENROUTER_API_KEY` dari server. Jika kunci salah, saldo habis, atau OpenRouter gangguan, orang tua tetap mendapat ringkasan rule-based, dan penyebabnya tampil di **Monitoring AI** (error terakhir, saldo, token, biaya). Penting: jangan mengganti `APP_SECRET` setelah kunci disimpan — jika terganti, cukup simpan ulang API key.

Untuk pengujian lokal tanpa internet, `OPENROUTER_BASE_URL` dapat diarahkan ke server tiruan.

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
- **Foto** landing page diunggah lewat Konten setelah izin publikasi orang tua ada.
- Kontak WhatsApp/email di footer masih contoh — ubah di Konten → Hero & Angka.
