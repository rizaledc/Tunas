-- Data awal: kategori aktivitas + contoh konten. Aman dijalankan ulang.
insert into public.categories (type, name, icon, sort) values
  ('digital','Belajar','book',1),
  ('digital','Hiburan (video)','video',2),
  ('digital','Game','gamepad',3),
  ('digital','Media sosial','chats',4),
  ('digital','Komunikasi','phone-call',5),
  ('positif','Membaca','book-open',1),
  ('positif','Menggambar/Mewarnai','palette',2),
  ('positif','Merawat lele','fish',3),
  ('positif','Olahraga/Bermain di luar','ball',4),
  ('positif','Membantu di rumah','broom',5),
  ('positif','Ibadah/Mengaji','mosque',6),
  ('positif','Bermain bersama keluarga','family',7),
  ('positif','Belajar/PR tanpa gawai','pencil2',8)
on conflict do nothing;

insert into public.events (title, slug, date, location, description, featured, published) values
  ('Pelatihan Penggunaan SAHABAT ANAK', 'pelatihan-sahabat-anak', '2026-12-06 09:00+07', 'Balai warga',
   'Pelatihan bagi orang tua untuk mulai mencatat aktivitas anak dengan SAHABAT ANAK.', true, true),
  ('Games Tanya Jawab Anak', 'games-tanya-jawab-anak', '2026-12-20 15:30+07', 'Halaman balai warga',
   'Sesi bermain sambil belajar tentang penggunaan gawai yang sehat.', true, true),
  ('Diskusi Ibu: Kesepakatan Digital Keluarga', 'diskusi-kesepakatan-digital', '2027-01-10 09:00+07', 'Ruang pertemuan komunitas',
   'Berbagi pengalaman menyusun dan menjalankan kesepakatan digital di rumah.', false, true)
on conflict (slug) do nothing;

insert into public.articles (title, slug, excerpt, body, published_at) values
  ('5 Cara Mendampingi Anak Saat Memakai Gawai', '5-cara-mendampingi-anak',
   'Pendampingan bukan berarti melarang. Ini lima langkah sederhana yang bisa dicoba di rumah.',
   E'## Mulai dari duduk bersama\n\nLuangkan 10 menit untuk ikut melihat apa yang ditonton atau dimainkan anak.\n\n## Sepakati waktunya\n\nTuliskan target waktu layar bersama anak, lalu tempel di dinding.\n\n## Tawarkan pengganti yang menyenangkan\n\nMenggambar, merawat lele, atau bermain di luar bisa jadi pilihan.\n\n## Beri tanda sebelum waktu habis\n\nIngatkan 5 menit sebelumnya supaya anak siap berhenti.\n\n## Puji usaha anak\n\nApresiasi saat anak berhenti tepat waktu.',
   now())
on conflict (slug) do nothing;
