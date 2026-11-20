-- =====================================================================
-- Security hardening (safe to run more than once)
--
--  1. Visitors can no longer edit tusker records.
--  2. Visitors may upload photos ONLY into the gallery / field-notes
--     folders. Everything else in storage is admin-only, and visitors
--     can no longer list the bucket (public image URLs still work).
--  3. Gallery photographer contact details are hidden from visitors.
--  4. Length limits + image-URL checks on visitor submissions.
--  5. A flood guard: at most 30 pending submissions per 10 minutes
--     per table (stops a bot from filling the review queue).
--  6. Exact sighting coordinates move into an admin-only table.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Make sure the official WTS login is an admin (no-op if already so)
-- ---------------------------------------------------------------------
insert into public.admin_users (user_id)
select id from auth.users where email = 'wildtuskerssrilankaofficial@gmail.com'
on conflict do nothing;


-- ---------------------------------------------------------------------
-- 1. Tuskers: admins only for writes
-- ---------------------------------------------------------------------
drop policy if exists "Anyone can update tusker photos" on public.tuskers;


-- ---------------------------------------------------------------------
-- 2. Storage
-- ---------------------------------------------------------------------
drop policy if exists "Anyone can upload to media folders"    on storage.objects;
drop policy if exists "Anyone can upload to gallery bucket"   on storage.objects;
drop policy if exists "Anyone can read media"                 on storage.objects;
drop policy if exists "Visitors can upload field note photos" on storage.objects;
drop policy if exists "Visitors can upload submission photos" on storage.objects;

-- Paths used by the site: web/<folder>/<year>/<file>, thumb/<folder>/<year>/<file>
create policy "Visitors can upload submission photos"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'wts-media'
    and (
      (storage.foldername(name))[1] in ('gallery', 'field-notes', 'fieldnotes')
      or (
        (storage.foldername(name))[1] in ('web', 'thumb')
        and (storage.foldername(name))[2] in ('gallery', 'field-notes', 'fieldnotes')
      )
    )
  );

-- Admin policy (unchanged, re-created in case it was dropped)
drop policy if exists "Admins manage media" on storage.objects;
create policy "Admins manage media"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'wts-media' and (select public.is_admin()))
  with check (bucket_id = 'wts-media' and (select public.is_admin()));

-- Photos are compressed in the browser before upload; 10 MB is plenty.
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
 where id = 'wts-media';


-- ---------------------------------------------------------------------
-- 3. Hide gallery photographer contact from visitors
-- ---------------------------------------------------------------------
revoke select on public.gallery_photos from anon;
grant select (id, image_url, title, tusker_name, location, date,
              photographer, status, submitted_at, approved_at)
  on public.gallery_photos to anon;


-- ---------------------------------------------------------------------
-- 4. Length limits on gallery submissions (NOT VALID = existing rows
--    are left alone, new/edited rows are checked)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'gallery_photos_lengths') then
    alter table public.gallery_photos add constraint gallery_photos_lengths check (
          char_length(image_url) <= 1000
      and char_length(title) between 1 and 300
      and coalesce(char_length(tusker_name), 0) <= 200
      and coalesce(char_length(location), 0) <= 300
      and char_length(photographer) between 1 and 200
      and coalesce(char_length(photographer_contact), 0) <= 200
    ) not valid;
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 5. Visitor submission guard (field notes + gallery)
--    * images must be photos stored in this project's wts-media bucket
--    * submitted_at is always "now"
--    * max 30 pending submissions per 10 minutes per table
-- ---------------------------------------------------------------------
create or replace function public.guard_visitor_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  url_ok constant text := '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/wts-media/';
  recent int;
  u text;
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_table_name = 'gallery_photos' then
    if new.image_url is null or new.image_url !~ url_ok then
      raise exception 'Photo must be uploaded through the site' using errcode = '22023';
    end if;
    select count(*) into recent from public.gallery_photos
     where status = 'pending' and submitted_at > now() - interval '10 minutes';
  else
    foreach u in array coalesce(new.images, '{}') loop
      if u !~ url_ok then
        raise exception 'Photos must be uploaded through the site' using errcode = '22023';
      end if;
    end loop;
    select count(*) into recent from public.field_notes
     where status = 'pending' and submitted_at > now() - interval '10 minutes';
  end if;

  if recent >= 30 then
    raise exception 'Too many submissions right now. Please try again in a few minutes.'
      using errcode = '54000';
  end if;

  new.submitted_at := now();
  return new;
end;
$$;

revoke all on function public.guard_visitor_submission() from public;

drop trigger if exists guard_visitor_submission on public.gallery_photos;
create trigger guard_visitor_submission
  before insert on public.gallery_photos
  for each row execute function public.guard_visitor_submission();

drop trigger if exists guard_visitor_submission on public.field_notes;
create trigger guard_visitor_submission
  before insert on public.field_notes
  for each row execute function public.guard_visitor_submission();


-- ---------------------------------------------------------------------
-- 6. Exact sighting coordinates: admin-only table
-- ---------------------------------------------------------------------
create table if not exists public.sighting_locations (
  sighting_id    bigint primary key references public.tusker_sightings (id) on delete cascade,
  lat            double precision not null check (lat between -90 and 90),
  lng            double precision not null check (lng between -180 and 180),
  location_name  text check (char_length(location_name) <= 300),
  updated_at     timestamptz not null default now()
);

alter table public.sighting_locations enable row level security;
revoke all on public.sighting_locations from anon;

drop policy if exists "Admins only" on public.sighting_locations;
create policy "Admins only"
  on public.sighting_locations for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Move any coordinates already stored inside public sighting notes
do $$
declare
  r record;
  j jsonb;
  la double precision;
  ln double precision;
begin
  for r in select id, note from public.tusker_sightings
            where note is not null and note like '%lat%' loop
    begin
      j := r.note::jsonb;
      if jsonb_typeof(j) <> 'object' then continue; end if;
      la := coalesce((j #>> '{coords,lat}')::double precision, (j ->> 'lat')::double precision);
      ln := coalesce((j #>> '{coords,lng}')::double precision, (j ->> 'lng')::double precision);
    exception when others then
      continue;  -- plain-text note or odd values, leave it alone
    end;

    if la is not null and ln is not null then
      insert into public.sighting_locations (sighting_id, lat, lng, location_name)
      values (r.id, la, ln, j ->> 'location')
      on conflict (sighting_id) do update
        set lat = excluded.lat, lng = excluded.lng,
            location_name = excluded.location_name, updated_at = now();
    end if;

    update public.tusker_sightings
       set note = (j - 'coords' - 'lat' - 'lng')::text
     where id = r.id;
  end loop;
end $$;
