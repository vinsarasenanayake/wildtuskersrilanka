-- =====================================================================
-- Migration: Empty Unlisted Tuskers table for real data
-- =====================================================================

truncate table public.unlisted_tuskers restart identity cascade;

