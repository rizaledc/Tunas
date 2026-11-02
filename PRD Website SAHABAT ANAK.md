# PRD Website SAHABAT ANAK

Nov 3, 2026 · @Rizal

## 1. Ringkasan produk

SAHABAT ANAK (Sistem Aplikasi Harmoni Aktivitas dan Perilaku Anak) adalah website mobile-first di **sahabatanaktunas.com** yang menggantikan modul dan logbook kertas program sebelumnya. Orang tua mencatat aktivitas digital dan non-digital anak, melihat keseimbangannya, lalu mendapat insight AI. Keputusan pendampingan tetap di tangan orang tua.

**Latar belakang.** Logbook manual membuat data tersebar di lembar tiap peserta, butuh rekapitulasi, dan sulit divisualisasikan. Program ini adalah luaran Teknologi Tepat Guna PKM Telkom University bersama Komunitas TUNAS (Tunggu Anak Siap) Banyumas, Desa Banteran.

**Tujuan produk**

1. Orang tua bisa mencatat aktivitas anak dalam kurang dari 1 menit per entri.
2. Orang tua melihat keseimbangan aktivitas digital dan non-digital anak dalam bentuk grafik yang mudah dibaca.
3. Orang tua mendapat ringkasan dan saran pendampingan dari AI, bukan perintah.
4. Komunitas TUNAS mendapat data agregat untuk merencanakan kegiatan pendampingan.
5. Tim PKM mendapat data evaluasi (penerimaan, kemudahan, manfaat) untuk laporan dan artikel ilmiah.

**Bukan tujuan.** SAHABAT ANAK bukan aplikasi parental control: tidak memblokir aplikasi, tidak membaca isi HP anak, dan tidak melacak lokasi. Screen time dicatat manual seperti logbook.

## 2. Pengguna dan peran

Ada empat peran. Orang tua dan anak masuk lewat `/login`, admin lewat `/login/admin`.

| Peran | Siapa | Akses utama | Login |
| --- | --- | --- | --- |
| Orang tua | Ibu atau ayah anggota TUNAS | Mencatat aktivitas, melihat analitik dan insight AI anaknya sendiri | `/login` (nomor HP/email + password) |
| Anak (opsional) | Anak usia SD yang sudah bisa membaca | Mode sederhana: catat aktivitas, lihat bintang/pencapaian | Dari perangkat orang tua dengan PIN 4 digit |
| Admin komunitas | Pengurus TUNAS (misalnya Ketua, Ibu Mifta Khul Khusnah) | Statistik agregat, kelola anggota, konten landing page, kegiatan | `/login/admin` |
| Superadmin | Tim PKM Telkom University | Semua akses admin + pengaturan AI, kategori, data mentah anonim, log sistem | `/login/admin` |

Admin komunitas tidak bisa membuka catatan harian per keluarga, hanya data agregat. Ini menjaga kepercayaan orang tua dan sesuai prinsip proposal bahwa komunitas tidak menggantikan peran orang tua.

## 3. Struktur halaman (sitemap)

Website punya tiga area: publik, dashboard orang tua, dan panel admin.

| Area | URL | Halaman | Akses |
| --- | --- | --- | --- |
| Publik | `/` | Landing page | Semua |
| Publik | `/tentang` | Tentang program, tim, mitra, roadmap | Semua |
| Publik | `/kegiatan` dan `/kegiatan/[slug]` | Daftar dan detail kegiatan pendampingan | Semua |
| Publik | `/galeri` | Galeri foto kegiatan | Semua |
| Publik | `/artikel` dan `/artikel/[slug]` | Tips digital parenting dan berita | Semua |
| Publik | `/panduan` | Cara pakai aplikasi + unduh modul PDF | Semua |
| Publik | `/daftar` | Registrasi dengan kode undangan TUNAS | Semua |
| Publik | `/login` | Login orang tua | Semua |
| Publik | `/privasi` | Kebijakan privasi dan persetujuan data | Semua |
| Orang tua | `/app` | Beranda dashboard | Orang tua |
| Orang tua | `/app/catat` | Catat aktivitas | Orang tua, anak |
| Orang tua | `/app/riwayat` | Riwayat dan edit catatan | Orang tua |
| Orang tua | `/app/analitik` | Grafik dan statistik | Orang tua |
| Orang tua | `/app/insight` | Insight AI dan riwayat insight | Orang tua |
| Orang tua | `/app/kesepakatan` | Kesepakatan digital keluarga | Orang tua |
| Orang tua | `/app/anak` | Kelola profil anak dan PIN | Orang tua |
| Orang tua | `/app/kegiatan` | Jadwal kegiatan komunitas | Orang tua |
| Orang tua | `/app/profil` | Akun, notifikasi, hapus data | Orang tua |
| Admin | `/login/admin` | Login admin (terpisah dari orang tua) | Admin |
| Admin | `/admin` | Dashboard statistik | Admin |
| Admin | `/admin/anggota` | Manajemen anggota dan kode undangan | Admin |
| Admin | `/admin/statistik` | Statistik agregat dan laporan | Admin |
| Admin | `/admin/insight` | Monitoring pemakaian dan kualitas AI | Superadmin |
| Admin | `/admin/konten` | CMS landing page, kegiatan, artikel, galeri | Admin |
| Admin | `/admin/evaluasi` | Kuesioner evaluasi dan hasilnya | Admin |
| Admin | `/admin/pengaturan` | Kategori, AI, notifikasi, akun admin | Superadmin |
| Admin | `/admin/log` | Log aktivitas admin dan sistem | Superadmin |

## 4. Landing page

Struktur mengikuti referensi website BLUD Pariwisata Banyumas (header biru, hero besar, kartu-kartu, CTA oranye, footer gelap), tanpa foto pejabat. Visualnya diganti foto kegiatan asli: anak menggambar, anak merawat lele, sesi games tanya jawab, diskusi ibu-ibu, dan pembinaan.

| No | Section | Isi | Padanan di referensi |
| --- | --- | --- | --- |
| 1 | Header | Logo SAHABAT ANAK + logo TUNAS; menu Beranda, Tentang, Kegiatan, Galeri, Artikel, Panduan; tombol oranye **Masuk / Daftar** | Header BLUD |
| 2 | Hero | Judul "Dampingi Aktivitas Anak, Seimbangkan Dunia Digitalnya"; subjudul singkat; tombol **Mulai Mencatat** dan **Pelajari Program**; foto besar anak merawat lele atau ibu-ibu diskusi | Hero dengan foto pejabat (diganti foto kegiatan) |
| 3 | Angka capaian | Kartu angka dari program sebelumnya: keterampilan digital 28,2% → 91,8%; praktik pendampingan 3,69 → 4,14; perilaku digital sehat anak 3,43 → 3,72; respons positif 88%; plus jumlah keluarga aktif (otomatis dari database) | Baru |
| 4 | Slider kegiatan unggulan + agenda mendatang | Kiri: slider kegiatan (foto, judul, tanggal, tombol Lihat Detail). Kanan: 3 agenda pendampingan TUNAS berikutnya | Highlight event + Event Mendatang |
| 5 | Fitur aplikasi | 4–6 kartu: Catat Aktivitas, Grafik Keseimbangan, Insight AI, Kesepakatan Keluarga, Mode Anak, Pantau Komunitas; tiap kartu punya ikon dan satu kalimat | Kartu Destinasi Wisata |
| 6 | Cara kerja | 3 langkah bernomor: Daftar dengan kode TUNAS → Catat aktivitas harian → Baca insight dan diskusikan dengan anak; di sebelahnya mockup HP (Gambar 5 proposal) | Panel Cara Reservasi |
| 7 | Perjalanan program | Roadmap 2025–2027: Literasi Digital Ibu Rumah Tangga → Literasi Digital Keluarga → Ternak Lele & Logbook → SAHABAT ANAK | Baru (Gambar 4 proposal) |
| 8 | Galeri kegiatan | Grid foto dengan filter kategori (Anak, Orang Tua, Pembinaan, Lele); klik untuk lightbox | Baru |
| 9 | Artikel dan tips | 3 artikel terbaru tentang digital parenting; tampilan kosong yang ramah jika belum ada | Kabar Banyumas |
| 10 | Banner CTA | "Bergabung dengan Komunitas TUNAS" + tombol **Daftar Sekarang** dan WhatsApp pengurus | Banner Mau Mengadakan Kegiatan |
| 11 | Footer | Logo, alamat Perum Bukit Lestari RT 7 RW 5 Desa Banteran, kontak, menu, logo mitra (Telkom University, TUNAS), link privasi | Footer BLUD |

**Catatan konten**

- Semua foto, angka, artikel, kegiatan, dan agenda bisa diubah admin lewat `/admin/konten`, tanpa coding.
- Foto yang menampilkan wajah anak hanya dipakai jika orang tua sudah memberi izin publikasi. Alternatifnya, pakai foto dari belakang atau fokus pada tangan dan aktivitas.
- Palet warna mengikuti logo TUNAS (hijau) dan Telkom University (merah), dengan aksen oranye untuk tombol, agar tetap mirip nuansa referensi.

## 5. Dashboard orang tua

Setelah login, orang tua masuk ke `/app`. Navigasi bawah berisi 5 menu: Beranda, Riwayat, tombol **+ Catat** di tengah, Analitik, Profil (sesuai mockup Gambar 5).

| Menu | Fitur | Rilis |
| --- | --- | --- |
| Beranda | Pilih anak (jika lebih dari satu); ringkasan hari ini: total screen time vs target, menit aktivitas positif, persen keseimbangan; kartu insight AI terbaru; akses cepat catat; pengingat jika belum mencatat hari ini; agenda TUNAS terdekat | 1 |
| Catat aktivitas | Dua tab: **Aktivitas Digital** (tujuan, aplikasi opsional, jam mulai–selesai, didampingi ya/tidak, sesuai kesepakatan ya/tidak) dan **Aktivitas Positif** (kategori berikon, dengan siapa, durasi, catatan); tombol durasi cepat 15/30/60 menit; tanggal bisa mundur maksimal 7 hari | 1 |
| Check-in harian | 3–4 pertanyaan sekali ketuk: suasana hati anak, berhenti gawai mudah/diingatkan/menolak, jam tidur, gawai sebelum tidur | 1 |
| Riwayat | Daftar catatan per hari, filter jenis dan kategori, edit dan hapus | 1 |
| Analitik | Filter minggu/bulan; grafik batang screen time harian vs garis target; donat komposisi tujuan gawai; donat kategori aktivitas positif; tren minggu ini vs minggu lalu; kalender keterisian catatan | 1 |
| Insight AI | Tombol **Analisis Sekarang** (maks 3 kali/hari per anak); hasil 5 bagian (ringkasan, yang sudah baik, perlu diperhatikan, saran, ide obrolan); tombol suka/tidak membantu; riwayat insight | 1 |
| Refleksi | Setelah membaca insight, orang tua menulis atau memilih tindak lanjut; minggu berikutnya ditanya apakah berhasil | 1 |
| Kesepakatan keluarga | Target screen time harian, jam bebas gawai, aturan lain (teks bebas); bisa dicetak sebagai poster untuk ditempel di rumah | 1 |
| Profil anak | Tambah/edit anak (nama panggilan, tahun lahir, jenjang sekolah), atur PIN mode anak | 1 |
| Mode anak | Tampilan ikon besar, warna cerah, catat aktivitas positif sendiri, dapat bintang dan lencana; tidak bisa melihat analitik atau insight | 2 |
| Kegiatan komunitas | Jadwal pendampingan TUNAS, konfirmasi hadir | 2 |
| Kuesioner evaluasi | Muncul otomatis saat admin membuka periode evaluasi | 2 |
| Profil akun | Ubah data dan password, atur pengingat, unduh data sendiri, hapus akun beserta datanya | 1 |

Semua tampilan dirancang untuk HP Android layar 360–412 px, tombol besar, bahasa Indonesia sederhana, dan bisa dipasang ke layar utama (PWA).

## 6. Panel admin (`/login/admin`)

Panel admin memakai layout desktop dengan sidebar kiri, tetap bisa dibuka di HP. Login admin terpisah dari login orang tua, dengan percobaan login dibatasi dan opsi verifikasi dua langkah untuk superadmin.

| Menu | Fitur | Admin komunitas | Superadmin | Rilis |
| --- | --- | --- | --- | --- |
| Dashboard | Kartu KPI: keluarga terdaftar, anak terdaftar, pengguna aktif 7 hari, catatan minggu ini, rata-rata screen time, rasio digital : positif, insight dibuat; grafik tren 8 minggu; daftar peringatan (misalnya keterisian turun) | Ya | Ya | 1 |
| Anggota | Buat kode undangan (sekali pakai atau batch), daftar keluarga (nama orang tua, jumlah anak, terakhir aktif, status), nonaktifkan/aktifkan akun, reset password, impor anggota dari Excel | Ya | Ya | 1 |
| Statistik | Statistik agregat dengan filter periode, jenjang/usia anak, dan RT; rata-rata screen time vs target, komposisi tujuan gawai, kategori aktivitas positif terpopuler, kepatuhan kesepakatan, jam rawan (penggunaan malam), perbandingan sebelum vs sesudah (baseline logbook kertas) | Ya (agregat, min. 5 keluarga per kelompok) | Ya | 1 |
| Laporan | Ekspor Excel/PDF: rekap bulanan komunitas, data anonim untuk artikel, rekap kehadiran kegiatan | Ya | Ya | 2 |
| Impor logbook | Input data logbook kertas lama (form massal atau unggah Excel) sebagai baseline | Tidak | Ya | 1 |
| Konten | CMS landing page: hero, angka capaian, kegiatan/agenda, galeri foto (unggah banyak sekaligus, kategori, izin publikasi), artikel (editor teks), panduan dan file modul PDF | Ya | Ya | 1 |
| Kegiatan | Buat jadwal pendampingan, daftar hadir, dokumentasi foto per kegiatan | Ya | Ya | 2 |
| Evaluasi | Kelola kuesioner (SUS, penerimaan, manfaat), buka/tutup periode pre-test dan post-test, lihat hasil dan skor otomatis | Ya | Ya | 2 |
| Monitoring AI | Jumlah analisis per hari, token dan biaya terpakai vs saldo, rating suka/tidak membantu, contoh output anonim untuk cek kualitas | Tidak | Ya | 1 |
| Pengaturan | Kategori aktivitas dan ikon, model AI dan prompt sistem, batas analisis per akun, acuan screen time per usia, teks consent, pengingat | Tidak | Ya | 1 |
| Akun admin | Tambah/hapus admin, atur peran | Tidak | Ya | 1 |
| Log | Riwayat aksi admin (siapa mengubah apa, kapan) dan error sistem | Tidak | Ya | 2 |

**Aturan privasi statistik.** Angka kelompok hanya ditampilkan jika kelompok berisi minimal 5 keluarga, supaya satu keluarga tidak bisa ditebak dari statistik. Admin komunitas tidak pernah melihat catatan harian atau insight per keluarga.

## 7. Fitur insight AI

Website menghitung semua indikator, lalu AI (Claude Haiku 5.5 reguler via OpenRouter) hanya membaca ringkasan angka dan menuliskannya menjadi saran. AI tidak menghitung sendiri dan tidak menerima nama atau identitas anak.

**Indikator yang dihitung sistem (7 hari terakhir)**

- Rata-rata screen time harian vs target kesepakatan
- Rasio menit digital : non-digital
- Komposisi tujuan gawai (belajar, hiburan, game, media sosial, komunikasi)
- Persen penggunaan gawai yang didampingi
- Jumlah hari dengan gawai menjelang tidur
- Kepatuhan pada kesepakatan (hari patuh / 7)
- Variasi dan kategori teratas aktivitas positif
- Tren dibanding minggu lalu
- Rekap check-in: suasana hati, respons saat waktu gawai habis
- Jumlah hari tercatat (agar AI tidak menyimpulkan berlebihan saat data sedikit)
- Tindak lanjut minggu lalu dan hasilnya

**Format output AI (JSON, ditampilkan sebagai kartu)**

1. Ringkasan minggu ini (2–3 kalimat)
2. Yang sudah baik
3. Yang perlu diperhatikan (1–2 poin)
4. Saran untuk dicoba (2–3 langkah konkret)
5. Ide obrolan dengan anak (1 pertanyaan pembuka)

**Aturan di prompt sistem**

- Tidak mendiagnosis (misalnya tidak menyebut "kecanduan") dan tidak menyalahkan orang tua.
- Selalu menegaskan bahwa keputusan ada di orang tua.
- Jika pola ekstrem, menyarankan konsultasi ke guru, psikolog, atau tenaga kesehatan.
- Acuan screen time per usia diambil dari pedoman resmi yang ditetapkan tim, disimpan di pengaturan, bukan dari pengetahuan model.
- Bahasa Indonesia sederhana dan hangat, maksimal sekitar 250 kata.

**Pengaman biaya.** Hasil di-cache jika data belum berubah, maksimal 3 analisis per anak per hari, `max_tokens` sekitar 800, dan limit kredit dipasang di API key. Estimasi biaya sekitar USD 7 per tahun untuk 20 analisis per hari; anggaran top-up USD 10–15.

**Cadangan jika AI gagal.** Jika API error atau saldo habis, sistem menampilkan ringkasan berbasis aturan (rule-based) dari indikator yang sama, sehingga orang tua tetap mendapat informasi.

## 8. Alur pengguna

&#91;embedded content: alur pengguna · 3 tahap, 1 siklus mingguan\]

Pendaftaran dilakukan sekali. Setelah itu orang tua mengulang siklus catat, lihat grafik, minta insight, dan tindak lanjut setiap minggu, sementara admin TUNAS hanya melihat data gabungan untuk merencanakan kegiatan.

## 9. Model data

Database PostgreSQL dengan 17 tabel inti. Data anak disimpan minimal: nama panggilan dan tahun lahir, tanpa NIK, alamat, atau foto.

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| `users` | id, nama, no\_hp, email, password\_hash, role (parent/admin/superadmin), status, last\_active\_at | Satu tabel untuk semua peran |
| `families` | id, parent\_id, rt, invite\_code\_id, consent\_at, consent\_version | Persetujuan data tercatat versinya |
| `children` | id, family\_id, nickname, birth\_year, school\_level, pin\_hash | Tanpa identitas lengkap |
| `invite_codes` | id, code, created\_by, max\_uses, used\_count, expires\_at | Untuk registrasi tertutup |
| `agreements` | id, child\_id, target\_screen\_min, no\_device\_hours, notes, updated\_at | Kesepakatan digital keluarga |
| `categories` | id, type (digital/positif), name, icon, active, sort | Dikelola superadmin |
| `activity_logs` | id, child\_id, type, category\_id, start\_at, end\_at, duration\_min, accompanied, follows\_agreement, with\_whom, note, input\_by (parent/child), source (app/logbook\_import) | Tabel terbesar |
| `daily_checkins` | id, child\_id, date, mood, stop\_response, sleep\_time, device\_before\_sleep | Satu baris per anak per hari |
| `ai_insights` | id, child\_id, period\_start, period\_end, input\_summary (JSON), output (JSON), model, tokens\_in, tokens\_out, cost\_usd, rating | Input disimpan untuk audit |
| `reflections` | id, child\_id, insight\_id, action\_text, outcome, created\_at | Tindak lanjut orang tua |
| `events` | id, title, slug, date, location, description, cover\_photo, published | Kegiatan dan agenda |
| `gallery_photos` | id, url, caption, category, publish\_consent, event\_id | Izin publikasi wajib |
| `articles` | id, title, slug, body, cover, published\_at, author\_id | Artikel dan tips |
| `surveys`, `survey_responses` | id, name, period, questions (JSON) / survey\_id, user\_id, answers (JSON), score | Evaluasi SUS dan penerimaan |
| `audit_logs` | id, actor\_id, action, target, created\_at | Jejak aksi admin |
| `settings` | key, value | Model AI, prompt, batas harian, acuan screen time |

## 10. Kebutuhan non-fungsional dan teknologi

**Teknologi yang diusulkan**

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Frontend dan backend | Next.js (App Router) + TypeScript + Tailwind | Satu codebase untuk landing, app, dan admin; SEO bagus untuk landing |
| Database dan auth | Supabase (PostgreSQL, Auth, Storage, Row Level Security) | Tier gratis cukup untuk pilot; RLS menjaga orang tua hanya melihat data keluarganya |
| Grafik | Recharts atau Chart.js | Ringan di HP |
| AI | OpenRouter → Claude Haiku 5.5 | Satu API, model bisa diganti lewat pengaturan |
| Hosting | Vercel | Deploy otomatis, gratis untuk skala pilot |
| Domain | sahabatanaktunas.com | Perlu dibeli dan diarahkan ke Vercel |
| Email/WhatsApp | Email reset password; pengingat via notifikasi PWA | WhatsApp API berbayar, dipertimbangkan di rilis 2 |

**Kebutuhan non-fungsional**

- **Performa:** landing page termuat di bawah 3 detik di jaringan 4G; foto dikompres otomatis ke WebP.
- **Perangkat:** nyaman di HP Android layar 360 px; panel admin optimal di laptop.
- **Privasi (UU PDP):** persetujuan orang tua saat daftar; data anak minimal; data ke AI dianonimkan; orang tua bisa mengunduh dan menghapus datanya; izin publikasi foto dicatat per foto.
- **Keamanan:** HTTPS, password di-hash, RLS di database, batas percobaan login, rute `/admin` hanya untuk peran admin, audit log aksi admin.
- **Ketersediaan:** backup database harian (bawaan Supabase); target uptime 99%.
- **Bahasa:** seluruh antarmuka bahasa Indonesia.
- **Aksesibilitas:** ukuran huruf minimal 16 px di app, kontras warna cukup, ikon selalu disertai teks.

## 11. Prioritas rilis dan timeline

Pengembangan dibagi dua rilis agar pelatihan Desember tetap berjalan sesuai jadwal proposal. Tanggal di bawah adalah usulan dan bergantung pada jumlah developer.

&#91;embedded content: usulan jadwal rilis · Nov 2026 - Feb 2027\]

**Rilis 1 (wajib siap sebelum pelatihan):** landing page, registrasi dengan kode undangan dan consent, login orang tua dan admin, profil anak, kesepakatan keluarga, catat aktivitas, check-in harian, riwayat, analitik, insight AI, refleksi, dashboard admin, manajemen anggota, statistik agregat, CMS konten, impor logbook, monitoring AI, pengaturan.

**Rilis 2 (selama masa pendampingan):** mode anak, jadwal dan kehadiran kegiatan, kuesioner evaluasi, laporan ekspor Excel/PDF, log admin, pengingat lanjutan.

## 12. Pertanyaan terbuka

Sebagian besar fitur sudah bisa dikerjakan. Pertanyaan berikut perlu dijawab agar tidak ada pengerjaan ulang.

- [ ] **Logbook asli:** boleh minta foto/scan modul dan logbook yang sudah terisi? Kolom form dan kategori akan disamakan persis.
- [ ] **Tim developer:** berapa orang dan apakah full-time? Ini menentukan apakah Rilis 1 realistis selesai akhir November.
- [ ] **Jumlah peserta pilot:** berapa keluarga dan berapa anak, serta rentang usianya? Ini menentukan perlu tidaknya mode anak di Rilis 1.
- [ ] **Login orang tua:** pakai nomor HP + password, email, atau Google? Nomor HP paling akrab untuk ibu-ibu, tetapi reset password lewat SMS/WhatsApp berbayar.
- [ ] **Izin foto:** apakah sudah ada izin publikasi dari orang tua untuk foto anak yang akan dipakai di landing page?
- [ ] **Domain dan anggaran:** siapa yang membeli sahabatanaktunas.com, dan apakah biaya domain, hosting, dan AI masuk RAB?
- [ ] **Acuan screen time:** pedoman mana yang dipakai sebagai acuan per usia (misalnya IDAI atau WHO)? Perlu ditetapkan tim.
- [ ] **Admin komunitas:** siapa saja pengurus TUNAS yang akan memegang akun admin?
- [ ] **HKI:** siapa yang mendaftarkan HKI aplikasi, dan dokumen apa yang dibutuhkan (manual book, source code, screenshot)?
- [ ] **Identitas visual:** apakah ada logo SAHABAT ANAK final, atau perlu dibuatkan?
