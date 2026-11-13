-- Jenjang sekolah per kelas: SD kelas 1–6, SMP kelas 1–3, SMA/SMK kelas 1–3.
-- Nilai lama (sd_awal, sd_akhir, smp) tetap diterima agar data yang sudah ada tidak rusak.
alter table public.children drop constraint if exists children_school_level_check;
alter table public.children add constraint children_school_level_check check (school_level in (
  'paud','tk',
  'sd1','sd2','sd3','sd4','sd5','sd6',
  'smp1','smp2','smp3',
  'sma1','sma2','sma3',
  'lainnya',
  'sd_awal','sd_akhir','smp'
));
