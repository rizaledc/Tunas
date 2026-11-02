-- Data awal: kategori aktivitas + contoh konten. Aman dijalankan ulang.
insert into public.categories (type, name, icon, sort) values
  ('digital','Belajar','📚',1),
  ('digital','Hiburan (video)','🎬',2),
  ('digital','Game','🎮',3),
  ('digital','Media sosial','💬',4),
  ('digital','Komunikasi','📞',5),
  ('positif','Membaca','📖',1),
  ('positif','Menggambar/Mewarnai','🎨',2),
  ('positif','Merawat lele','🐟',3),
  ('positif','Olahraga/Bermain di luar','⚽',4),
  ('positif','Membantu di rumah','🧹',5),
  ('positif','Ibadah/Mengaji','🕌',6),
  ('positif','Bermain bersama keluarga','👨‍👩‍👧',7),
  ('positif','Belajar/PR tanpa gawai','✏️',8)
on conflict do nothing;

insert into public.events (title, slug, date, location, description, featured, published) values
  ('Pelatihan Penggunaan SAHABAT ANAK', 'pelatihan-sahabat-anak', '2026-12-06 09:00+07', 'Balai Warga Perum Bukit Lestari, Desa Banteran',
   'Pelatihan bagi orang tua anggota TUNAS untuk mulai mencatat aktivitas anak dengan SAHABAT ANAK.', true, true),
  ('Games Tanya Jawab Anak', 'games-tanya-jawab-anak', '2026-12-20 15:30+07', 'Halaman Komunitas TUNAS',
   'Sesi bermain sambil belajar tentang penggunaan gawai yang sehat.', true, true),
  ('Diskusi Ibu: Kesepakatan Digital Keluarga', 'diskusi-kesepakatan-digital', '2027-01-10 09:00+07', 'Rumah Ketua TUNAS',
   'Berbagi pengalaman menyusun dan menjalankan kesepakatan digital di rumah.', false, true)
on conflict (slug) do nothing;

insert into public.articles (title, slug, excerpt, body, published_at) values
  ('5 Cara Mendampingi Anak Saat Memakai Gawai', '5-cara-mendampingi-anak',
   'Pendampingan bukan berarti melarang. Ini lima langkah sederhana yang bisa dicoba di rumah.',
   E'## Mulai dari duduk bersama\n\nLuangkan 10 menit untuk ikut melihat apa yang ditonton atau dimainkan anak.\n\n## Sepakati waktunya\n\nTuliskan target waktu layar bersama anak, lalu tempel di dinding.\n\n## Tawarkan pengganti yang menyenangkan\n\nMenggambar, merawat lele, atau bermain di luar bisa jadi pilihan.\n\n## Beri tanda sebelum waktu habis\n\nIngatkan 5 menit sebelumnya supaya anak siap berhenti.\n\n## Puji usaha anak\n\nApresiasi saat anak berhenti tepat waktu.',
   now())
on conflict (slug) do nothing;
