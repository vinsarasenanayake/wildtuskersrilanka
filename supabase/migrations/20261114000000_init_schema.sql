-- =====================================================================
-- Wild Tuskers Sri Lanka — Supabase schema
--
-- Run this once in Supabase Dashboard → SQL Editor (or `supabase db push`).
-- Then run supabase/seed.sql to load the starter data.
--
-- Access model (no public user accounts):
--   • Visitors (anon)  → read tuskers, sightings, observations, events and
--                        APPROVED field notes; submit field notes (always
--                        'pending') and upload photos for them.
--   • Admin            → a Supabase Auth user listed in public.admin_users;
--                        full read/write on everything, incl. unlisted tuskers.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Admins
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can see their own admin row" on public.admin_users;
create policy "Admins can see their own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Used by every RLS policy below. SECURITY DEFINER so it can read
-- admin_users regardless of the caller's own privileges.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. Listed tuskers (public registry)
-- ---------------------------------------------------------------------
create table if not exists public.tuskers (
  id                       text primary key check (id = upper(btrim(id)) and id <> ''),
  name                     text not null,
  sinhala                  text not null,
  location                 text,
  listed_date              date,
  recorded_by              text,
  nickname_given_by        text,
  description              text,
  special_marks            text,
  special_wounds           text,
  risk_score               text,
  risk_link                text default '#risk-assessment',
  photos                   text[] not null default '{}',
  ear_photos               text[] not null default '{}',
  photographic_comparison  jsonb,
  ear_comparison           jsonb,
  created_at               timestamptz not null default now()
);

create index if not exists tuskers_location_idx on public.tuskers (location);


-- ---------------------------------------------------------------------
-- 3. Sightings attached to a listed tusker
-- ---------------------------------------------------------------------
create table if not exists public.tusker_sightings (
  id            bigint generated always as identity primary key,
  tusker_id     text not null references public.tuskers (id) on update cascade on delete cascade,
  image_url     text not null,
  capture_date  date not null,
  note          text,
  author        text,
  created_at    timestamptz not null default now()
);

create index if not exists tusker_sightings_tusker_id_idx on public.tusker_sightings (tusker_id);


-- ---------------------------------------------------------------------
-- 4. Unlisted tuskers (admin-only monitoring list)
-- ---------------------------------------------------------------------
create table if not exists public.unlisted_tuskers (
  id                       text primary key check (btrim(id) <> ''),
  location                 text not null,
  listed_date              date,
  recorded_by              text,
  description              text not null,
  special_marks            text,
  special_wounds           text,
  photos                   text[] not null default '{}',
  ear_photos               text[] not null default '{}',
  photographic_comparison  jsonb,
  ear_comparison           jsonb,
  created_at               timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 5. Special observations
-- ---------------------------------------------------------------------
create table if not exists public.special_observations (
  id           bigint generated always as identity primary key,
  date         date not null,
  year         text generated always as (extract(year from date)::int::text) stored,
  tusker_name  text not null,
  location     text,
  title        text not null,
  description  text not null,
  images       text[] not null default '{}',
  author       text,
  created_at   timestamptz not null default now()
);

create index if not exists special_observations_date_idx on public.special_observations (date desc);


-- ---------------------------------------------------------------------
-- 6. Field notes (public submissions, admin-moderated)
-- ---------------------------------------------------------------------
create table if not exists public.field_notes (
  id              bigint generated always as identity primary key,
  title           text not null check (char_length(title) between 1 and 300),
  date            date not null,
  time            text check (char_length(time) <= 50),
  description     text not null check (char_length(description) between 1 and 20000),
  special_note    text check (char_length(special_note) <= 5000),
  images          text[] not null default '{}' check (cardinality(images) <= 12),
  author          text not null check (char_length(author) between 1 and 200),
  author_contact  text check (char_length(author_contact) <= 200),
  status          text not null default 'pending' check (status in ('pending', 'approved')),
  submitted_at    timestamptz not null default now(),
  approved_at     timestamptz
);

create index if not exists field_notes_status_date_idx on public.field_notes (status, date desc);


-- ---------------------------------------------------------------------
-- 7. Projects / events
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id           bigint generated always as identity primary key,
  type         text not null check (type in ('upcoming', 'past')),
  date         date not null,
  title        text not null,
  description  text not null,
  shared_by    text not null,
  image        text,
  created_at   timestamptz not null default now()
);


-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.tuskers              enable row level security;
alter table public.tusker_sightings     enable row level security;
alter table public.unlisted_tuskers     enable row level security;
alter table public.special_observations enable row level security;
alter table public.field_notes          enable row level security;
alter table public.events               enable row level security;

-- Public-read, admin-write tables -------------------------------------
do $$
declare t text;
begin
  foreach t in array array['tuskers', 'tusker_sightings', 'special_observations', 'events'] loop
    execute format('drop policy if exists "Anyone can read" on public.%I', t);
    execute format('create policy "Anyone can read" on public.%I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "Admins can write" on public.%I', t);
    execute format('create policy "Admins can write" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

-- Unlisted tuskers: admin only ----------------------------------------
drop policy if exists "Admins only" on public.unlisted_tuskers;
create policy "Admins only"
  on public.unlisted_tuskers for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Field notes ----------------------------------------------------------
drop policy if exists "Read approved notes (admins read all)" on public.field_notes;
create policy "Read approved notes (admins read all)"
  on public.field_notes for select
  to anon, authenticated
  using (status = 'approved' or (select public.is_admin()));

drop policy if exists "Anyone can submit a pending note" on public.field_notes;
create policy "Anyone can submit a pending note"
  on public.field_notes for insert
  to anon, authenticated
  with check (status = 'pending' and approved_at is null);

drop policy if exists "Admins can write" on public.field_notes;
create policy "Admins can write"
  on public.field_notes for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Hide contributor contact details from the public API.
-- Visitors can read every column EXCEPT author_contact.
revoke select on public.field_notes from anon;
grant select (id, title, date, time, description, special_note, images,
              author, status, submitted_at, approved_at)
  on public.field_notes to anon;


-- =====================================================================
-- Storage: one public bucket for images
--   field-notes/…  → visitors may upload (photos attached to submissions)
--   everything     → admins may upload / replace / delete
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wts-media', 'wts-media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'])
on conflict (id) do nothing;

drop policy if exists "Visitors can upload field note photos" on storage.objects;
create policy "Visitors can upload field note photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'wts-media' and (storage.foldername(name))[1] = 'field-notes');

drop policy if exists "Admins manage media" on storage.objects;
create policy "Admins manage media"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'wts-media' and (select public.is_admin()))
  with check (bucket_id = 'wts-media' and (select public.is_admin()));


-- =====================================================================
-- After creating your admin login (Dashboard → Authentication → Users →
-- "Add user"), make it an admin by running:
--
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = 'YOUR-ADMIN-EMAIL';
-- =====================================================================
