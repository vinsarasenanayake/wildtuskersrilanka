-- Migration: Allow 'Critical' in threat_level check constraint
alter table public.tuskers drop constraint if exists tuskers_threat_level_check;
alter table public.tuskers add constraint tuskers_threat_level_check
  check (threat_level in ('Low', 'Medium', 'High', 'Highest', 'Critical'));
