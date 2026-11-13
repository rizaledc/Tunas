-- =====================================================================
-- SAHABAT ANAK: SQL LENGKAP UNTUK SUPABASE (proyek baru)
-- Cara pakai: Supabase Dashboard → SQL Editor → New query → tempel SEMUA
-- isi file ini → Run. Jalankan SEKALI saja pada proyek yang masih kosong.
-- Isi: (1) skema + RLS + storage, (2) ikon kategori, (3) data awal.
-- =====================================================================

-- ===================== (1) supabase/migrations/0001_init.sql =====================
-- =============================================================
-- SAHABAT ANAK: skema inti (PostgreSQL / Supabase)
-- 17 tabel inti sesuai PRD + tabel pendukung (login_attempts,
-- push_subscriptions, event_attendance).
-- =============================================================

create extension if not exists pgcrypto;

-- ---------- users ----------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  no_hp text unique,
  email text,
  role text not null default 'parent' check (role in ('parent','admin','superadmin')),
  status text not null default 'active' check (status in ('active','inactive')),
  reminder_enabled boolean not null default true,
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);
-- password_hash dikelola oleh Supabase Auth (auth.users.encrypted_password, bcrypt).

-- ---------- invite_codes ----------
create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_by uuid references public.users(id) on delete set null,
  max_uses int not null default 1 check (max_uses > 0),
  used_count int not null default 0,
  expires_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

-- ---------- families ----------
create table public.families (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null unique references public.users(id) on delete cascade,
  rt text,
  invite_code_id uuid references public.invite_codes(id) on delete set null,
  consent_at timestamptz,
  consent_version text,
  created_at timestamptz not null default now()
);

-- ---------- children ----------
create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 40),
  birth_year int not null check (birth_year between 2005 and 2030),
  school_level text not null check (school_level in ('paud','tk','sd1','sd2','sd3','sd4','sd5','sd6','smp1','smp2','smp3','sma1','sma2','sma3','lainnya','sd_awal','sd_akhir','smp')),
  pin_hash text,
  created_at timestamptz not null default now()
);
create index on public.children(family_id);

-- ---------- agreements ----------
create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null unique references public.children(id) on delete cascade,
  target_screen_min int not null default 120 check (target_screen_min between 0 and 1440),
  no_device_hours text,
  notes text,
  updated_at timestamptz not null default now()
);

-- ---------- categories ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('digital','positif','rutin')),
  name text not null,
  icon text not null default 'star',
  active boolean not null default true,
  sort int not null default 0
);

-- ---------- activity_logs ----------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  type text not null check (type in ('digital','positif','rutin')),
  category_id uuid references public.categories(id) on delete set null,
  custom_label text check (char_length(custom_label) <= 60),
  log_date date not null,
  start_at timestamptz,
  end_at timestamptz,
  duration_min int not null check (duration_min between 1 and 1440),
  app_name text,
  accompanied boolean,
  follows_agreement boolean,
  with_whom text,
  note text,
  input_by text not null default 'parent' check (input_by in ('parent','child')),
  source text not null default 'app' check (source in ('app','logbook_import')),
  created_at timestamptz not null default now()
);
create index on public.activity_logs(child_id, log_date);
create index on public.activity_logs(log_date);

-- ---------- lele_logs (logbook harian pemeliharaan lele) ----------
create table public.lele_logs (
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

-- ---------- daily_checkins ----------
create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  date date not null,
  mood text check (mood in ('senang','biasa','sedih','marah')),
  stop_response text check (stop_response in ('mudah','diingatkan','menolak')),
  sleep_time time,
  device_before_sleep boolean,
  created_at timestamptz not null default now(),
  unique (child_id, date)
);

-- ---------- ai_insights ----------
create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  input_summary jsonb not null,
  input_hash text not null,
  output jsonb not null,
  model text not null,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  cost_usd numeric(10,6) not null default 0,
  rating smallint check (rating in (-1, 1)),
  created_at timestamptz not null default now()
);
create index on public.ai_insights(child_id, created_at desc);

-- ---------- reflections ----------
create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  insight_id uuid references public.ai_insights(id) on delete set null,
  action_text text not null,
  outcome text check (outcome in ('berhasil','sebagian','belum')),
  outcome_note text,
  created_at timestamptz not null default now()
);

-- ---------- events ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  date timestamptz not null,
  location text,
  description text,
  cover_photo text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.event_attendance (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  rsvp text not null default 'hadir' check (rsvp in ('hadir','tidak')),
  attended boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ---------- gallery_photos ----------
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text,
  caption text,
  category text not null default 'anak' check (category in ('anak','orang_tua','pembinaan','lele')),
  publish_consent boolean not null default false,
  event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- articles ----------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null default '',
  cover text,
  published_at timestamptz,
  author_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- surveys ----------
create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'custom' check (kind in ('sus','penerimaan','manfaat','custom')),
  period text not null default 'pre' check (period in ('pre','post')),
  questions jsonb not null,
  is_open boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  answers jsonb not null,
  score numeric(6,2),
  created_at timestamptz not null default now(),
  unique (survey_id, user_id)
);

-- ---------- audit_logs ----------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_logs(created_at desc);

-- ---------- settings ----------
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- pendukung ----------
create table public.login_attempts (
  id bigint generated always as identity primary key,
  identifier text not null,
  scope text not null check (scope in ('parent','admin')),
  ip text,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index on public.login_attempts(identifier, created_at desc);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

-- =============================================================
-- Fungsi bantu (SECURITY DEFINER agar tidak rekursif terhadap RLS)
-- =============================================================
create or replace function public.current_role_name() returns text
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid() and status = 'active'
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('admin','superadmin'), false)
$$;

create or replace function public.is_superadmin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() = 'superadmin', false)
$$;

create or replace function public.owns_child(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.children c
    join public.families f on f.id = c.family_id
    join public.users u on u.id = f.parent_id
    where c.id = cid and f.parent_id = auth.uid() and u.status = 'active'
  )
$$;

-- =============================================================
-- Row Level Security
-- Prinsip: orang tua hanya melihat data keluarganya. Admin komunitas
-- TIDAK punya policy SELECT pada catatan harian/insight; statistik
-- agregat dihitung di server (service role) dengan aturan min. 5 keluarga.
-- =============================================================
alter table public.users enable row level security;
alter table public.invite_codes enable row level security;
alter table public.families enable row level security;
alter table public.children enable row level security;
alter table public.agreements enable row level security;
alter table public.categories enable row level security;
alter table public.activity_logs enable row level security;
alter table public.lele_logs enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.ai_insights enable row level security;
alter table public.reflections enable row level security;
alter table public.events enable row level security;
alter table public.event_attendance enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.articles enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_responses enable row level security;
alter table public.audit_logs enable row level security;
alter table public.settings enable row level security;
alter table public.login_attempts enable row level security;
alter table public.push_subscriptions enable row level security;

-- users: baca diri sendiri; admin membaca daftar akun (untuk manajemen anggota).
create policy users_self_select on public.users for select using (id = auth.uid() or public.is_admin());
-- perubahan users (role/status) hanya lewat server (service role).

-- families
create policy families_self on public.families for select using (parent_id = auth.uid() or public.is_admin());
create policy families_self_update on public.families for update using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- children (admin tidak diberi akses baris anak)
create policy children_owner_all on public.children for all
  using (exists (select 1 from public.families f where f.id = family_id and f.parent_id = auth.uid()))
  with check (exists (select 1 from public.families f where f.id = family_id and f.parent_id = auth.uid()));

-- data per anak
create policy agreements_owner on public.agreements for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy logs_owner on public.activity_logs for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy lele_owner on public.lele_logs for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy checkins_owner on public.daily_checkins for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy insights_owner_select on public.ai_insights for select using (public.owns_child(child_id));
create policy insights_owner_rate on public.ai_insights for update using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy reflections_owner on public.reflections for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));

-- kategori: dibaca semua, diubah superadmin
create policy categories_read on public.categories for select using (true);
create policy categories_write on public.categories for all using (public.is_superadmin()) with check (public.is_superadmin());

-- undangan: admin
create policy invites_admin on public.invite_codes for all using (public.is_admin()) with check (public.is_admin());

-- konten publik
create policy events_read on public.events for select using (published or public.is_admin());
create policy events_write on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy gallery_read on public.gallery_photos for select using (publish_consent or public.is_admin());
create policy gallery_write on public.gallery_photos for all using (public.is_admin()) with check (public.is_admin());
create policy articles_read on public.articles for select using ((published_at is not null and published_at <= now()) or public.is_admin());
create policy articles_write on public.articles for all using (public.is_admin()) with check (public.is_admin());

-- kehadiran kegiatan
create policy attendance_self on public.event_attendance for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

-- kuesioner
create policy surveys_read on public.surveys for select using (auth.uid() is not null);
create policy surveys_write on public.surveys for all using (public.is_admin()) with check (public.is_admin());
create policy responses_self on public.survey_responses for select using (user_id = auth.uid() or public.is_admin());
create policy responses_insert on public.survey_responses for insert with check (user_id = auth.uid());

-- audit log: superadmin baca
create policy audit_read on public.audit_logs for select using (public.is_superadmin());

-- settings: kunci publik (prefix 'public.') boleh dibaca semua; sisanya superadmin
create policy settings_public_read on public.settings for select using (key like 'public.%' or public.is_superadmin());
create policy settings_write on public.settings for all using (public.is_superadmin()) with check (public.is_superadmin());

-- push subscription milik sendiri
create policy push_self on public.push_subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- login_attempts: tanpa policy (hanya service role).

-- =============================================================
-- Storage: bucket publik "media" untuk foto & modul PDF
-- =============================================================
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;

create policy media_public_read on storage.objects for select using (bucket_id = 'media');
create policy media_admin_insert on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects for update using (bucket_id = 'media' and public.is_admin());
create policy media_admin_delete on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- Orang tua boleh konfirmasi (rsvp), tetapi status "hadir" hanya diubah admin.
create or replace function public.guard_attendance() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and auth.role() <> 'service_role' then
    if tg_op = 'INSERT' then
      new.attended := false;
    else
      new.attended := old.attended;
    end if;
  end if;
  return new;
end $$;

create trigger event_attendance_guard before insert or update on public.event_attendance
  for each row execute function public.guard_attendance();

-- ===================== (2) supabase/migrations/0002_category_icons.sql =====================
-- Ikon kategori memakai nama ikon SVG (lihat src/components/icons.tsx), bukan emoji.
alter table public.categories alter column icon set default 'star';

update public.categories set icon = case icon
  when '📚' then 'book'
  when '🎬' then 'video'
  when '🎮' then 'gamepad'
  when '💬' then 'chats'
  when '📞' then 'phone-call'
  when '📖' then 'book-open'
  when '🎨' then 'palette'
  when '🐟' then 'fish'
  when '⚽' then 'ball'
  when '🧹' then 'broom'
  when '🕌' then 'mosque'
  when '👨‍👩‍👧' then 'family'
  when '✏️' then 'pencil2'
  when '⭐' then 'star'
  else icon
end;

-- ===================== (3) supabase/seed.sql (data awal) =====================
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
  ('positif','Belajar/PR tanpa gawai','pencil2',8),
  ('positif','Lainnya','more',99),
  ('digital','Lainnya','more',99),
  ('rutin','Tidur','sleep',1),
  ('rutin','Sekolah','school',2),
  ('rutin','Makan & mandi','utensils',3),
  ('rutin','Perjalanan','bus',4),
  ('rutin','Lainnya','more',99)
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
