-- Tidur/Istirahat menjadi pilihan di Aktivitas Positif (masukan dosen pembimbing).
-- Kategori "Tidur" di Rutinitas dinonaktifkan agar tidak dobel; catatan lama tetap tersimpan.
insert into public.categories (type, name, icon, sort)
select 'positif', 'Tidur/Istirahat', 'sleep', 9
where not exists (select 1 from public.categories where type = 'positif' and name = 'Tidur/Istirahat');
update public.categories set active = false where type = 'rutin' and name = 'Tidur';
