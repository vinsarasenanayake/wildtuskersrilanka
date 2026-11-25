-- Add first_recorded_location column to public.tuskers and public.unlisted_tuskers
-- Represents the baseline registration location (Row 1 of sightings history).
-- Roaming area / home range continues to be stored in the location column.

alter table public.tuskers
  add column if not exists first_recorded_location text;

alter table public.unlisted_tuskers
  add column if not exists first_recorded_location text;

create index if not exists tuskers_first_recorded_location_idx on public.tuskers (first_recorded_location);
