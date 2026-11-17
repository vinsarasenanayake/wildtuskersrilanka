-- =====================================================================
-- Migration: Add Proximate Birth Year to Tuskers table
-- =====================================================================

alter table public.tuskers
  add column if not exists proximate_birth_year integer,
  add column if not exists birth_year integer;
