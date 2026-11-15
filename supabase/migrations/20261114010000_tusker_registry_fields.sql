-- =====================================================================
-- Tusker registry fields (from the WTS "Full list" spreadsheet)
--
-- Run in Supabase SQL Editor AFTER 20261114000000_init_schema.sql.
-- Safe to run more than once.
-- =====================================================================

-- Most tuskers on the official list have no Sinhala name yet.
alter table public.tuskers alter column sinhala drop not null;

alter table public.tuskers
  add column if not exists living_status     text,
  add column if not exists death_year        integer,
  add column if not exists death_reason      text,
  add column if not exists last_seen_area    text,
  add column if not exists last_seen         date,      -- month precision (stored as the 1st)
  add column if not exists zone              text,
  add column if not exists district          text,
  add column if not exists province          text,
  add column if not exists age_range         text,
  add column if not exists health_condition  text,
  add column if not exists threat_level      text,
  add column if not exists remarks           text;

alter table public.tuskers drop constraint if exists tuskers_living_status_check;
alter table public.tuskers add constraint tuskers_living_status_check
  check (living_status in ('Alive', 'No Recent Record', 'Deceased'));

alter table public.tuskers drop constraint if exists tuskers_threat_level_check;
alter table public.tuskers add constraint tuskers_threat_level_check
  check (threat_level in ('Low', 'Medium', 'High', 'Highest'));

alter table public.tuskers drop constraint if exists tuskers_death_year_check;
alter table public.tuskers add constraint tuskers_death_year_check
  check (death_year between 1900 and 2100);

create index if not exists tuskers_living_status_idx on public.tuskers (living_status);
create index if not exists tuskers_zone_idx on public.tuskers (zone);
