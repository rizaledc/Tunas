-- 1) Jenis aktivitas ketiga "rutin" (tidur, sekolah, makan & mandi, perjalanan) agar 1 hari bisa dicatat penuh 24 jam.
alter table public.activity_logs drop constraint if exists activity_logs_type_check;
alter table public.activity_logs add constraint activity_logs_type_check check (type in ('digital','positif','rutin'));
alter table public.categories drop constraint if exists categories_type_check;
alter table public.categories add constraint categories_type_check check (type in ('digital','positif','rutin'));

-- 2) Nama kegiatan bebas saat memilih "Lainnya".
alter table public.activity_logs add column if not exists custom_label text check (char_length(custom_label) <= 60);

-- 3) Kategori baru (aman dijalankan ulang).
insert into public.categories (type, name, icon, sort)
select v.type, v.name, v.icon, v.sort from (values
  ('rutin','Tidur','sleep',1),
  ('rutin','Sekolah','school',2),
  ('rutin','Makan & mandi','utensils',3),
  ('rutin','Perjalanan','bus',4),
  ('rutin','Lainnya','more',99),
  ('digital','Lainnya','more',99),
  ('positif','Lainnya','more',99)
) as v(type, name, icon, sort)
where not exists (select 1 from public.categories c where c.type = v.type and c.name = v.name);

-- 4) Logbook harian pemeliharaan lele (Instrumen I), satu isian per anak per hari.
create table if not exists public.lele_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  log_date date not null,
  pakan_pagi text check (pakan_pagi in ('tepat','terlambat','tidak')),
  pakan_sore text check (pakan_sore in ('tepat','terlambat','tidak')),
  air text[] not null default '{}' check (air <@ array['hijau','keruh','jernih','berbusa']::text[]),
  perilaku text[] not null default '{}' check (perilaku <@ array['aktif','pasif','menggantung','kematian']::text[]),
  cuaca text check (cuaca in ('cerah','hujan')),
  didampingi boolean not null default false,
  catatan text check (char_length(catatan) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, log_date)
);
alter table public.lele_logs enable row level security;
drop policy if exists lele_owner on public.lele_logs;
create policy lele_owner on public.lele_logs for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
