-- =====================================================================
-- Tusker Identification Learning Materials Schema
-- Educational presentations, guides, and morphological identification modules.
-- =====================================================================

create table if not exists public.tusker_identifications (
  id              bigint generated always as identity primary key,
  title           text not null check (char_length(title) between 1 and 400),
  category        text not null default 'General',
  description     text not null,
  author          text default 'Wild Tuskers Sri Lanka Research Team',
  cover_image     text,
  file_url        text,
  file_name       text,
  file_type       text,
  file_size       bigint default 0,
  slide_images    text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists tusker_identifications_created_at_idx on public.tusker_identifications (created_at desc);

alter table public.tusker_identifications enable row level security;

-- Public can read all educational identification materials
drop policy if exists "Anyone can read tusker_identifications" on public.tusker_identifications;
create policy "Anyone can read tusker_identifications"
  on public.tusker_identifications for select
  to anon, authenticated
  using (true);

-- Admins can create, update, and delete
drop policy if exists "Admins can manage tusker_identifications" on public.tusker_identifications;
create policy "Admins can manage tusker_identifications"
  on public.tusker_identifications for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
