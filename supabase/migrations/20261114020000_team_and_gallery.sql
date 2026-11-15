-- =====================================================================
-- Migration: Team Members & Community Gallery Tables + Policies
--
-- Run in Supabase SQL Editor AFTER 20261114000000_init_schema.sql.
-- Safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Team Members (Admins & Researchers for About Us page)
-- ---------------------------------------------------------------------
create table if not exists public.team_members (
  id            bigint generated always as identity primary key,
  name          text not null,
  role          text not null default 'Admin',
  badge         text,
  bio           text,
  image         text,
  facebook_url  text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

-- Ensure facebook_url exists even if table was created previously
alter table public.team_members add column if not exists facebook_url text;

alter table public.team_members enable row level security;

drop policy if exists "Anyone can read team members" on public.team_members;
create policy "Anyone can read team members"
  on public.team_members for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage team members" on public.team_members;
create policy "Admins can manage team members"
  on public.team_members for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- 2. Gallery Photos (Public community submissions + admin moderation)
-- ---------------------------------------------------------------------
create table if not exists public.gallery_photos (
  id                    bigint generated always as identity primary key,
  image_url             text not null,
  title                 text not null,
  tusker_name           text,
  location              text,
  date                  date not null default current_date,
  photographer          text not null,
  photographer_contact  text,
  status                text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at          timestamptz not null default now(),
  approved_at           timestamptz
);

alter table public.gallery_photos enable row level security;

-- Public can read approved photos
drop policy if exists "Anyone can read approved gallery photos" on public.gallery_photos;
create policy "Anyone can read approved gallery photos"
  on public.gallery_photos for select
  to anon, authenticated
  using (status = 'approved');

-- Anyone can submit a gallery photo (starts pending)
drop policy if exists "Anyone can submit gallery photos" on public.gallery_photos;
create policy "Anyone can submit gallery photos"
  on public.gallery_photos for insert
  to anon, authenticated
  with check (status = 'pending');

-- Admins can read, approve, reject, or delete all gallery photos
drop policy if exists "Admins have full access to gallery photos" on public.gallery_photos;
create policy "Admins have full access to gallery photos"
  on public.gallery_photos for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Allow public uploads to gallery/ folder in wts-media bucket
drop policy if exists "Anyone can upload to gallery bucket" on storage.objects;
create policy "Anyone can upload to gallery bucket"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'wts-media'
    and (storage.foldername(name))[1] in ('field-notes', 'gallery')
  );

-- ---------------------------------------------------------------------
-- 3. Seed Current 13 Admins into team_members (with Facebook Profiles)
-- ---------------------------------------------------------------------
insert into public.team_members (name, role, display_order, facebook_url) values
  ('Milinda Wattegedara', 'Admin', 1, 'https://www.facebook.com/milinda.wattegedara/'),
  ('Asanka Nilagaratne', 'Admin', 2, 'https://www.facebook.com/asanka.jeewan.1'),
  ('Chandika Lakmal', 'Admin', 3, 'https://www.facebook.com/chandikacr/'),
  ('Dr Isuru Upanishad', 'Admin', 4, 'https://www.facebook.com/isuru.upanishad/'),
  ('Dushantha Silva', 'Admin', 5, null),
  ('Saman Halloluwa', 'Admin', 6, 'https://www.facebook.com/saman.halloluwa.5'),
  ('Lyndon Fernando', 'Admin', 7, null),
  ('Namal Kalagoda', 'Admin', 8, null),
  ('Pathum Bandara', 'Admin', 9, null),
  ('Priyanjana Dilmith', 'Admin', 10, null),
  ('Suraj Perera', 'Admin', 11, null),
  ('Geemal Harold', 'Admin', 12, null),
  ('Raveendra Siriwardana', 'Admin', 13, null)
on conflict do nothing;

-- Update existing records if already seeded earlier
update public.team_members set facebook_url = 'https://www.facebook.com/milinda.wattegedara/' where name = 'Milinda Wattegedara';
update public.team_members set facebook_url = 'https://www.facebook.com/asanka.jeewan.1' where name = 'Asanka Nilagaratne';
update public.team_members set facebook_url = 'https://www.facebook.com/chandikacr/' where name = 'Chandika Lakmal';
update public.team_members set facebook_url = 'https://www.facebook.com/isuru.upanishad/' where name = 'Dr Isuru Upanishad';
update public.team_members set facebook_url = 'https://www.facebook.com/saman.halloluwa.5' where name = 'Saman Halloluwa';

